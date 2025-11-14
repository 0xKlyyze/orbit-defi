// Health Factor Calculation
// For Advanced Loops: h = Sum(Collateral_i × t_i) / Sum(Borrowed_j)
// For Quick Loops: h = t × (1 + (L_0 - B_n) / B)
// For Leveraged Positions: h = (λ × t) / (λ - 1)
// HEALTH FACTOR: h = sum(collateral_i × t_i) / sum(borrowed_j)
export const calculateHealthFactor = (collateralSteps, borrowedTotal) => {
  if (borrowedTotal === 0) return 999;
  const weightedCollateral = collateralSteps.reduce((sum, step) => {
    const value = parseFloat(step.usdValue) || 0;
    // Always use user-input threshold if available, otherwise prompt/fail
    const lt = ('liquidationThreshold' in step) ? parseFloat(step.liquidationThreshold) : 0.75;
    return sum + (value * lt);
  }, 0);
  
  return weightedCollateral / borrowedTotal;
};

// Health Factor for Leveraged Position
export const calculateLeveragedPositionHealthFactor = (leverage, liquidationThreshold) => {
  if (leverage <= 1) return 999;
  return (leverage * liquidationThreshold) / (leverage - 1);
};

// Net APY for Quick Mode (single-asset loops)
export const calculateNetAPY = (supplyAPY, borrowAPY, leverage) => {
  // Net APY = Supply APY × Leverage - Borrow APR × (Leverage - 1)
  return (supplyAPY * leverage) - (borrowAPY * (leverage - 1));
};

// AGGREGATE APY: Only initial deposit (first supply step) is used for all weighting
export const calculateAggregateAPY = (steps) => {
  const initialSupplyIndex = steps.findIndex(s =>
    s.stepType === 'supply' || s.stepType === 'stake' || s.stepType === 'restake'
  );
  const totalCapital = initialSupplyIndex !== -1 ? parseFloat(steps[initialSupplyIndex].usdValue) || 0 : 0;
  if (totalCapital === 0) return 0;
  
  // Sum yield-related steps; defaults to 0 if value missing
  const weightedAPY = steps.reduce((sum, step) => {
    if (step.apy && (step.stepType === 'supply' || step.stepType === 'stake' || step.stepType === 'restake' || step.stepType === 'leveraged')) {
      return sum + (parseFloat(step.apy) * (parseFloat(step.usdValue) || 0) / totalCapital);
    }
    return sum;
  }, 0);

  return weightedAPY;
};

// LEVERAGE RATIO: exposure / net equity
export const calculateLeverageRatio = (totalExposure, netEquity) => {
  if (netEquity === 0) return 1;
  return totalExposure / netEquity;
};

// Liquidation Price (for single-asset)
export const calculateLiquidationPrice = (entryPrice, borrowed, collateral, liquidationThreshold) => {
  if (collateral === 0 || liquidationThreshold === 0) return 0;
  return entryPrice * (borrowed / (collateral * liquidationThreshold));
};

// Calculate total collateral from steps (only the first step which is always lending)
export const calculateTotalCollateral = (steps) => {
  if (steps.length === 0) return 0;
  // The first step is always the initial collateral
  return parseFloat(steps[0].usdValue) || 0;
};

// Calculate total borrowed from steps
export const calculateTotalBorrowed = (steps) => {
  return steps
    .filter(step => step.stepType === 'borrow')
    .reduce((sum, step) => {
      return sum + (parseFloat(step.usdValue) || 0);
    }, 0);
};

// Get risk level based on health factor
export const getRiskLevel = (healthFactor) => {
  if (healthFactor >= 2.0) return { level: 'Safe', color: 'emerald', status: 'Active' };
  if (healthFactor >= 1.5) return { level: 'Warning', color: 'yellow', status: 'Active' };
  if (healthFactor >= 1.1) return { level: 'Moderate Risk', color: 'orange', status: 'In-risk' };
  return { level: 'Critical', color: 'red', status: 'In-risk' };
};

// Calculate Quick Mode iterations
// Formula: h = t × (1 + (L_0 - B_n) / B)
// where L_0 = initial deposit, B_n = last borrow, B = total borrowed, t = liquidation threshold
export const calculateQuickModeMetrics = (config) => {
  const initialDeposit = parseFloat(config.initialDeposit?.usd) || 0;
  let totalBorrowed = 0;
  let lastBorrow = 0;
  
  // Calculate cumulative borrowed from iterations
  if (config.iterations && config.iterations.length > 0) {
    config.iterations.forEach((iteration, index) => {
      const borrowUSD = parseFloat(iteration.borrowUSD) || 0;
      totalBorrowed += borrowUSD;
      if (index === config.iterations.length - 1) {
        lastBorrow = borrowUSD;
      }
    });
  }
  
  // Leverage = (Initial Deposit + Total Borrowed) / Initial Deposit
  const leverage = initialDeposit > 0 ? (initialDeposit + totalBorrowed) / initialDeposit : 1;
  
  const netAPY = calculateNetAPY(
    parseFloat(config.lendingAPY) || 0,
    parseFloat(config.borrowingAPY) || 0,
    leverage
  );
  
  const liquidationThreshold = parseFloat(config.liquidationThreshold) || 0.75;
  
  // Quick Loop Health Factor: h = t × (1 + (L_0 - B_n) / B)
  let healthFactor = 999;
  if (totalBorrowed > 0) {
    healthFactor = liquidationThreshold * (1 + (initialDeposit - lastBorrow) / totalBorrowed);
  }
  
  return {
    totalCollateral: initialDeposit,
    totalBorrowed,
    leverageRatio: leverage,
    netAPY,
    healthFactor
  };
};

/**
 * Health Factor Calculation for Advanced Mode:
 * Formula: h = Sum(Collateral_i × t_i) / Sum(Borrowed_j)
 * Only include *actual* supply/stake/leverage (synthetic) for collateral.
 * Borrow steps go exclusively to debt (unless truly resupplied—advanced tracing not in MVP!).
 */
// ADVANCED LOOP METRICS ENGINE
export const calculateAdvancedModeMetrics = (steps) => {
  let totalExposure = 0;
  let totalDebt = 0;
  let netEquity = 0;
  const collateralSteps = [];

  // Only count supply/collateral steps that actually collateralize a borrow!
  steps.forEach((step, i) => {
    const usdValue = parseFloat(step.usdValue) || 0;
    // Collateral: Only include a supply/stake/restake/leveraged step IF there is any borrowing in any step!
    if (
      (step.stepType === 'supply' || step.stepType === 'stake' || step.stepType === 'restake') &&
      steps.some(s => s.stepType === 'borrow')
    ) {
      totalExposure += usdValue;
      // Always use per-step threshold if present; must be stored in UI!
      collateralSteps.push({
        usdValue,
        liquidationThreshold: step.liquidationThreshold !== undefined ? step.liquidationThreshold : 0.75
      });
    }
    // Leveraged position steps: must always contribute synthetic collateral/debt.
    else if (step.stepType === 'leveraged') {
      const leverage = parseFloat(step.leverage) || 1;
      const syntheticCollateral = usdValue * leverage;
      const syntheticDebt = usdValue * (leverage - 1);
      totalExposure += syntheticCollateral;
      totalDebt += syntheticDebt;
      collateralSteps.push({
        usdValue: syntheticCollateral,
        liquidationThreshold: step.liquidationThreshold !== undefined ? step.liquidationThreshold : 0.75
      });
    }
    // Borrow steps: Only add to DEBT, never to collateral!
    else if (step.stepType === 'borrow') {
      totalDebt += usdValue;
      // Never add borrow step to collateral; no cross-contamination.
    }
    // Swaps, bridge, etc. are ignored for exposure/risk.
  });

  // Net Equity = Total Exposure - Total Debt
const netExposure = totalExposure - totalDebt; // Rename for consistency!
const leverageRatio = calculateLeverageRatio(totalExposure, netExposure);

// Health Factor
const healthFactor = calculateHealthFactor(collateralSteps, totalDebt);

// Aggregate APY using only the initial deposit
const aggregateAPY = calculateAggregateAPY(steps);

// For display: first supply step is user's initial actual deposit
const totalCollateral = steps.find(s =>
  s.stepType === 'supply' || s.stepType === 'stake' || s.stepType === 'restake'
);
const initialCollateral = totalCollateral ? parseFloat(totalCollateral.usdValue) || 0 : 0;

return {
  totalCollateral: initialCollateral,
  totalBorrowed: totalDebt,
  leverageRatio,
  aggregateAPY,
  healthFactor,
  netExposure,       // <<==== Now matches variable and UI expectations!
  totalExposure
};

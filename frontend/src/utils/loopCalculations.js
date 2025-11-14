// Health Factor Calculation
// For Advanced Loops: h = Sum(Collateral_i × t_i) / Sum(Borrowed_j)
// For Quick Loops: h = t × (1 + (L_0 - B_n) / B)
// For Leveraged Positions: h = (λ × t) / (λ - 1)
export const calculateHealthFactor = (collateralSteps, borrowedTotal) => {
  if (borrowedTotal === 0) return 999;
  
  // Sum(Collateral Value × Liquidation Threshold) / Total Borrowed
  const weightedCollateral = collateralSteps.reduce((sum, step) => {
    const value = parseFloat(step.usdValue) || 0;
    const lt = parseFloat(step.liquidationThreshold) || 0.75;
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

// Aggregate APY for Advanced Mode (weighted average with borrow as negative)
export const calculateAggregateAPY = (steps) => {
  const initialDeposit =
  steps.find(step => step.stepType === 'supply' || step.stepType === 'stake' || step.stepType === 'restake');
  const totalCapital = initialDeposit ? parseFloat(initialDeposit.usdValue) || 0 : 0;

  
  if (totalCapital === 0) return 0;
  
  const weightedAPY = steps.reduce((sum, step) => {
    const value = parseFloat(step.usdValue) || 0;
    const apy = parseFloat(step.apy) || 0;
    const weight = value / totalCapital;
    
    // Borrow APY is negative (cost), supply/leveraged is positive (yield)
    const apyMultiplier = step.stepType === 'borrow' ? -1 : 1;
    
    return sum + (apy * weight * apyMultiplier);
  }, 0);
  
  return weightedAPY;
};

// Leverage Ratio
export const calculateLeverageRatio = (totalPositionValue, netEquity) => {
  if (netEquity === 0) return 1;
  return totalPositionValue / netEquity;
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
export const calculateAdvancedModeMetrics = (steps) => {
  let totalExposure = 0;
  let totalDebt = 0;
  const collateralSteps = [];

  steps.forEach(step => {
    const usdValue = parseFloat(step.usdValue) || 0;

    if (step.stepType === 'supply' || step.stepType === 'stake' || step.stepType === 'restake') {
      // Collateral: supply, stake, or restake
      totalExposure += usdValue;
      collateralSteps.push({
        usdValue,
        liquidationThreshold: step.liquidationThreshold || 0.75
      });
    } 
    else if (step.stepType === 'leveraged') {
      // Leveraged position: synthetic collateral and debt
      const leverage = parseFloat(step.leverage) || 1;
      const syntheticCollateral = usdValue * leverage;
      const syntheticDebt = usdValue * (leverage - 1);
      totalExposure += syntheticCollateral;
      totalDebt += syntheticDebt;
      collateralSteps.push({
        usdValue: syntheticCollateral,
        liquidationThreshold: step.liquidationThreshold || 0.75
      });
    }
    else if (step.stepType === 'borrow') {
      // Debt: borrowed amounts only
      totalDebt += usdValue;
      // Do NOT add borrowed tokens to collateral unless you implement actual tracking of resupply.
    }
    // Swap, Bridge, Claim/Compound, etc. do NOT affect collateral or debt for healthFactor/leverage purposes
  });

  // Net equity for leverage: totalExposure - totalDebt
  const netEquity = totalExposure - totalDebt;
  // Leverage: totalExposure / netEquity (default 1 if netEquity <= 0)
  const leverageRatio = netEquity > 0 ? totalExposure / netEquity : 1;

  // Health Factor: Weighted sum of (collateral USD × threshold) / totalDebt
  const healthFactor = calculateHealthFactor(collateralSteps, totalDebt);

  // Aggregate APY from all steps with APY present
  const aggregateAPY = calculateAggregateAPY(steps.filter(s => s.apy));

  // The initial deposit/first supply step is "total collateral" (may be ambiguous in advanced, but matches previous convention)
  const totalCollateral = calculateTotalCollateral(steps);

  return {
    totalCollateral,
    totalBorrowed: totalDebt,
    leverageRatio,
    aggregateAPY,
    healthFactor,
    netExposure: netEquity,
    totalExposure
  };
};

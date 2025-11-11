// Health Factor Calculation (Aave V3 formula)
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

// Net APY for Quick Mode (single-asset loops)
export const calculateNetAPY = (supplyAPY, borrowAPY, leverage) => {
  // Net APY = Supply APY × Leverage - Borrow APR × (Leverage - 1)
  return (supplyAPY * leverage) - (borrowAPY * (leverage - 1));
};

// Aggregate APY for Advanced Mode (weighted average with borrow as negative)
export const calculateAggregateAPY = (steps) => {
  const totalCapital = steps.reduce((sum, step) => {
    return sum + (parseFloat(step.usdValue) || 0);
  }, 0);
  
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
export const calculateQuickModeMetrics = (config) => {
  const initialDeposit = parseFloat(config.initialDeposit?.usd) || 0;
  let totalBorrowed = 0;
  
  // Calculate cumulative borrowed from iterations
  if (config.iterations && config.iterations.length > 0) {
    config.iterations.forEach(iteration => {
      const borrowUSD = parseFloat(iteration.borrowUSD) || 0;
      totalBorrowed += borrowUSD;
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
  const healthFactor = calculateHealthFactor(
    [{ usdValue: initialDeposit, liquidationThreshold }],
    totalBorrowed
  );
  
  return {
    totalCollateral: initialDeposit,
    totalBorrowed,
    leverageRatio: leverage,
    netAPY,
    healthFactor
  };
};

// Calculate Advanced Mode metrics
export const calculateAdvancedModeMetrics = (steps) => {
  const totalCollateral = calculateTotalCollateral(steps);
  const totalBorrowed = calculateTotalBorrowed(steps);
  
  // Leverage = (Initial Collateral + Total Borrowed) / Initial Collateral
  const leverage = totalCollateral > 0 ? (totalCollateral + totalBorrowed) / totalCollateral : 1;
  
  // For health factor, only use the first step (initial collateral)
  const collateralSteps = steps.length > 0 ? [{
    usdValue: steps[0].usdValue,
    liquidationThreshold: steps[0].liquidationThreshold || 0.75
  }] : [];
  
  const healthFactor = calculateHealthFactor(collateralSteps, totalBorrowed);
  
  // Calculate aggregate APY from all steps with APY
  const aggregateAPY = calculateAggregateAPY(steps.filter(s => s.apy));
  
  return {
    totalCollateral,
    totalBorrowed,
    leverageRatio: leverage,
    aggregateAPY,
    healthFactor,
    netExposure: totalCollateral - totalBorrowed
  };
};
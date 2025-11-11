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

// Aggregate APY for Advanced Mode (weighted average)
export const calculateAggregateAPY = (steps) => {
  const totalCapital = steps.reduce((sum, step) => {
    return sum + (parseFloat(step.usdValue) || 0);
  }, 0);
  
  if (totalCapital === 0) return 0;
  
  const weightedAPY = steps.reduce((sum, step) => {
    const value = parseFloat(step.usdValue) || 0;
    const apy = parseFloat(step.apy) || 0;
    const weight = value / totalCapital;
    return sum + (apy * weight);
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

// Calculate total collateral from steps
export const calculateTotalCollateral = (steps) => {
  return steps
    .filter(step => step.stepType === 'supply' || step.stepType === 'leveraged')
    .reduce((sum, step) => {
      return sum + (parseFloat(step.usdValue) || 0);
    }, 0);
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
  let totalSupplied = parseFloat(config.initialDeposit?.usd) || 0;
  let totalBorrowed = 0;
  
  // Calculate cumulative from iterations
  if (config.iterations && config.iterations.length > 0) {
    config.iterations.forEach(iteration => {
      const borrowUSD = parseFloat(iteration.borrowUSD) || 0;
      totalBorrowed += borrowUSD;
      totalSupplied += borrowUSD; // Borrowed amount becomes new collateral
    });
  }
  
  const netEquity = totalSupplied - totalBorrowed;
  const leverage = netEquity > 0 ? totalSupplied / netEquity : 1;
  const netAPY = calculateNetAPY(
    parseFloat(config.lendingAPY) || 0,
    parseFloat(config.borrowingAPY) || 0,
    leverage
  );
  
  const liquidationThreshold = parseFloat(config.liquidationThreshold) || 0.75;
  const healthFactor = calculateHealthFactor(
    [{ usdValue: totalSupplied, liquidationThreshold }],
    totalBorrowed
  );
  
  return {
    totalCollateral: totalSupplied,
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
  
  const netEquity = totalCollateral - totalBorrowed;
  const leverage = calculateLeverageRatio(totalCollateral, netEquity);
  
  // Get collateral steps for health factor
  const collateralSteps = steps
    .filter(step => step.stepType === 'supply' || step.stepType === 'leveraged')
    .map(step => ({
      usdValue: step.usdValue,
      liquidationThreshold: step.liquidationThreshold || 0.75
    }));
  
  const healthFactor = calculateHealthFactor(collateralSteps, totalBorrowed);
  
  // Calculate aggregate APY from all steps
  const aggregateAPY = calculateAggregateAPY(steps.filter(s => s.apy));
  
  return {
    totalCollateral,
    totalBorrowed,
    leverageRatio: leverage,
    aggregateAPY,
    healthFactor,
    netExposure: netEquity
  };
};
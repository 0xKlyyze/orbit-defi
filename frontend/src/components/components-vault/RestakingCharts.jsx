import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getRiskLevel } from '@/utils/loopCalculations';

const RestakingCharts = ({ loops }) => {
  const COLORS = ['#EF4444', '#F97316', '#FB923C', '#FCA5A5', '#FED7AA', '#DC2626', '#EA580C'];
  const RISK_COLORS = {
    Safe: '#10B981',
    Warning: '#EAB308',
    Critical: '#EF4444'
  };

  // Risk distribution
  const riskDistribution = loops.reduce((acc, loop) => {
    const healthFactor = parseFloat(loop.healthFactor) || 0;
    const risk = getRiskLevel(healthFactor);
    const existing = acc.find(item => item.name === risk.level);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: risk.level, value: 1, color: RISK_COLORS[risk.level] });
    }
    return acc;
  }, []);

  // Collateral distribution
  const collateralDistribution = loops.reduce((acc, loop) => {
    const asset = loop.collateralAsset || 'Unknown';
    const value = parseFloat(loop.collateralValue) || 0;
    const existing = acc.find(item => item.name === asset);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: asset, value });
    }
    return acc;
  }, []);

  // Leverage distribution
  const leverageDistribution = loops.map(loop => ({
    name: loop.loopName,
    leverage: parseFloat(loop.leverageRatio) || 1
  })).sort((a, b) => b.leverage - a.leverage);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-red-500/30 rounded-lg px-4 py-2 shadow-xl">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-red-400">
            {payload[0].dataKey === 'leverage' ? `${payload[0].value.toFixed(2)}x` :
             typeof payload[0].value === 'number' ? 
             (payload[0].value < 100 ? payload[0].value : `$${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) :
             payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="restaking-charts">
      {/* Risk Distribution */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="risk-distribution-title">Risk Distribution</h3>
        {riskDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-zinc-500" data-testid="risk-chart-empty">
            No data available
          </div>
        )}
      </div>

      {/* Collateral Distribution */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="collateral-distribution-title">Collateral by Asset</h3>
        {collateralDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={collateralDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {collateralDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-zinc-500" data-testid="collateral-chart-empty">
            No data available
          </div>
        )}
      </div>

      {/* Leverage Distribution */}
      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="leverage-distribution-title">Leverage by Loop</h3>
        {leverageDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leverageDistribution}>
              <XAxis dataKey="name" stroke="#71717a" tick={{ fontSize: 12 }} />
              <YAxis stroke="#71717a" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leverage" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-zinc-500" data-testid="leverage-chart-empty">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default RestakingCharts;
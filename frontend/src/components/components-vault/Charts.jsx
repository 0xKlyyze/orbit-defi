import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Charts = ({ positions }) => {
  const COLORS = ['#EF4444', '#F97316', '#FB923C', '#FCA5A5', '#FED7AA', '#DC2626', '#EA580C'];

  // Calculate data for chain distribution
  const chainData = positions.reduce((acc, pos) => {
    const existing = acc.find(item => item.name === pos.chain);
    const value = parseFloat(pos.usdValue) || 0;
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: pos.chain, value });
    }
    return acc;
  }, []);

  // Calculate data for platform distribution
  const platformData = positions.reduce((acc, pos) => {
    const existing = acc.find(item => item.name === pos.platform);
    const value = parseFloat(pos.usdValue) || 0;
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: pos.platform, value });
    }
    return acc;
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-red-500/30 rounded-lg px-4 py-2 shadow-xl">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-red-400">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="charts-container">
      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="chain-distribution-title">Distribution by Chain</h3>
        {chainData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chainData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-zinc-500" data-testid="chain-chart-empty">
            No data available
          </div>
        )}
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4" data-testid="platform-distribution-title">Distribution by Platform</h3>
        {platformData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <XAxis dataKey="name" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-zinc-500" data-testid="platform-chart-empty">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
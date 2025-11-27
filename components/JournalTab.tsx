import React from 'react';
import { Trade } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface JournalTabProps {
  trades: Trade[];
}

export const JournalTab: React.FC<JournalTabProps> = ({ trades }) => {
  const closedTrades = trades.filter((t) => ['WON', 'LOST', 'BE'].includes(t.status));

  // Prepare Chart Data (Cumulative R)
  const chartData = closedTrades.reduce((acc, trade, index) => {
    const prevR = index > 0 ? acc[index - 1].cumulativeR : 0;
    acc.push({
      name: `T${index + 1}`,
      r: trade.finalR,
      cumulativeR: prevR + trade.finalR,
      date: new Date(trade.createdAt).toLocaleDateString(),
    });
    return acc;
  }, [] as { name: string; r: number; cumulativeR: number; date: string }[]);

  const totalR = closedTrades.reduce((sum, t) => sum + t.finalR, 0);
  const winRate = closedTrades.length > 0 
    ? (closedTrades.filter(t => t.status === 'WON').length / closedTrades.length) * 100 
    : 0;

  return (
    <div className="p-4 max-w-5xl mx-auto pb-24 space-y-8 animate-fade-in">
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm">Total PnL (R)</p>
          <h3 className={`text-3xl font-bold font-mono ${totalR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalR > 0 ? '+' : ''}{totalR.toFixed(2)}R
          </h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm">Win Rate</p>
          <h3 className="text-3xl font-bold text-white font-mono">{winRate.toFixed(1)}%</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-slate-400 text-sm">Trades Taken</p>
          <h3 className="text-3xl font-bold text-white font-mono">{closedTrades.length}</h3>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-80">
        <h3 className="text-white font-bold mb-4">Performance Curve (R-Multiple)</h3>
        {closedTrades.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="cumulativeR" stroke="#6366f1" fillOpacity={1} fill="url(#colorR)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Not enough data to display chart
          </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-bold">Trade History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Pair</th>
                <th className="px-6 py-3">Direction</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Result (R)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {closedTrades.slice().reverse().map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4">{new Date(trade.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-white font-mono">{trade.pair}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${trade.direction === 'LONG' ? 'text-emerald-400 bg-emerald-900/20' : 'text-rose-400 bg-rose-900/20'}`}>
                       {trade.direction}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                        ${trade.status === 'WON' ? 'text-emerald-400' : ''}
                        ${trade.status === 'LOST' ? 'text-rose-400' : ''}
                        ${trade.status === 'BE' ? 'text-yellow-400' : ''}
                    `}>
                        {trade.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-bold ${trade.finalR > 0 ? 'text-emerald-400' : trade.finalR < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {trade.finalR > 0 ? '+' : ''}{trade.finalR}R
                  </td>
                </tr>
              ))}
              {closedTrades.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">No closed trades yet.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

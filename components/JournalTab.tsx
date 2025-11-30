import React, { useState, useEffect } from 'react';
import { Trade, Account, Strategy } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, Edit2, Filter, Trophy, TrendingUp, BarChart2, Target } from 'lucide-react';
import { Translation } from '../translations';

interface JournalTabProps {
  trades: Trade[];
  accounts: Account[];
  strategies: Strategy[];
  monthlyTargetR: number;
  setMonthlyTargetR: (target: number) => void;
  lastCelebratedMonth: string;
  setLastCelebratedMonth: (month: string) => void;
  t: Translation;
}

export const JournalTab: React.FC<JournalTabProps> = ({ 
  trades, 
  accounts, 
  strategies, 
  monthlyTargetR, 
  setMonthlyTargetR,
  lastCelebratedMonth,
  setLastCelebratedMonth,
  t 
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTargetEditOpen, setIsTargetEditOpen] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(monthlyTargetR.toString());
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('ALL');

  // --- Filter Logic ---
  const allClosedTrades = trades.filter((t) => ['WON', 'LOST', 'BE'].includes(t.status));

  let closedTrades = selectedAccountId === 'ALL'
    ? allClosedTrades
    : allClosedTrades.filter(t => t.accountId === selectedAccountId);

  if (selectedStrategyId !== 'ALL') {
    if (selectedStrategyId === 'NONE') {
        closedTrades = closedTrades.filter(t => !t.strategyId);
    } else {
        closedTrades = closedTrades.filter(t => t.strategyId === selectedStrategyId);
    }
  }

  // --- Monthly Logic ---
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
  
  const currentMonthTrades = closedTrades.filter(t => {
      const tradeDate = new Date(t.closedAt || t.createdAt);
      const tradeMonthKey = `${tradeDate.getFullYear()}-${(tradeDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return tradeMonthKey === currentMonthKey;
  });

  const currentMonthR = currentMonthTrades.reduce((sum, t) => sum + t.finalR, 0);
  const progressPct = monthlyTargetR > 0 ? Math.min((currentMonthR / monthlyTargetR) * 100, 100) : 0;
  
  useEffect(() => {
    if (monthlyTargetR > 0 && currentMonthR >= monthlyTargetR) {
        if (lastCelebratedMonth !== currentMonthKey) {
            setShowCelebration(true);
        }
    }
  }, [currentMonthR, monthlyTargetR, lastCelebratedMonth, currentMonthKey]);

  const handleCelebrateClose = () => {
      setShowCelebration(false);
      setLastCelebratedMonth(currentMonthKey);
  };

  const handleSaveTarget = () => {
      const val = parseFloat(newTargetInput);
      if (!isNaN(val) && val > 0) {
          setMonthlyTargetR(val);
      }
      setIsTargetEditOpen(false);
  };

  const chartData = closedTrades.slice().reverse().reduce((acc, trade, index) => {
    const prevR = index > 0 ? acc[index - 1].cumulativeR : 0;
    acc.push({
      name: `T${index + 1}`,
      r: trade.finalR,
      cumulativeR: prevR + trade.finalR,
    });
    return acc;
  }, [] as { name: string; r: number; cumulativeR: number }[]);

  const totalR = closedTrades.reduce((sum, t) => sum + t.finalR, 0);
  const winRate = closedTrades.length > 0 
    ? (closedTrades.filter(t => t.status === 'WON').length / closedTrades.length) * 100 
    : 0;

  return (
    <div className="pb-24 space-y-8">
      
      {/* Monthly Target Card */}
      <div className="bg-gradient-to-r from-app-surface to-slate-800 border border-app-border rounded-2xl p-6 relative overflow-hidden shadow-card">
          <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Monthly Goal</h3>
                        <p className="text-xs text-app-muted">Target: {monthlyTargetR}R</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsTargetEditOpen(!isTargetEditOpen)}
                    className="p-2 rounded-full hover:bg-white/5 text-app-muted hover:text-white transition"
                  >
                      <Edit2 size={16} />
                  </button>
              </div>

              {isTargetEditOpen && (
                  <div className="mb-4 flex gap-2 items-center bg-black/20 p-2 rounded-xl">
                      <input 
                        type="number" 
                        value={newTargetInput}
                        onChange={e => setNewTargetInput(e.target.value)}
                        className="bg-transparent text-white border-b border-app-primary w-20 text-center focus:outline-none"
                      />
                      <button onClick={handleSaveTarget} className="text-xs font-bold text-app-primary">SAVE</button>
                  </div>
              )}

              <div className="relative h-3 bg-app-bg rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPct}%` }}
                  ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium text-app-muted">
                  <span>Current: <span className="text-white">{currentMonthR.toFixed(2)}R</span></span>
                  <span>{progressPct.toFixed(0)}%</span>
              </div>
          </div>
      </div>

      <div className="flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">{t.journal.title}</h2>
            <button 
                onClick={() => setIsReportModalOpen(true)}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 shadow-sm"
            >
                 <FileText size={16} /> {t.journal.generateReport}
            </button>
         </div>
         
         {/* Filters */}
         <div className="grid md:grid-cols-2 gap-4">
             <div>
                 <label className="text-xs font-semibold text-app-muted mb-1.5 ml-1 block">Filter by Account</label>
                 <select 
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                    className="w-full input-field p-2.5 text-sm"
                 >
                     <option value="ALL">{t.common.allAccounts}</option>
                     <option value="GENERAL">{t.common.general}</option>
                     {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                 </select>
             </div>
             
             <div>
                <label className="text-xs font-semibold text-app-muted mb-1.5 ml-1 block">Filter by Strategy</label>
                <select 
                   value={selectedStrategyId} 
                   onChange={(e) => setSelectedStrategyId(e.target.value)}
                   className="w-full input-field p-2.5 text-sm"
                >
                    <option value="ALL">{t.common.allStrategies}</option>
                    <option value="NONE">{t.common.noStrategy}</option>
                    {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-app-surface border border-app-border rounded-2xl p-5 text-center shadow-card flex flex-col items-center justify-center">
          <div className="mb-2 p-2 bg-blue-500/10 rounded-full text-blue-500"><TrendingUp size={20} /></div>
          <p className="text-app-muted text-xs font-semibold uppercase tracking-wider mb-1">Net PnL</p>
          <h3 className={`text-2xl font-bold ${totalR >= 0 ? 'text-app-success' : 'text-app-danger'}`}>
            {totalR > 0 ? '+' : ''}{totalR.toFixed(2)}R
          </h3>
        </div>
        <div className="bg-app-surface border border-app-border rounded-2xl p-5 text-center shadow-card flex flex-col items-center justify-center">
           <div className="mb-2 p-2 bg-purple-500/10 rounded-full text-purple-500"><Target size={20} /></div>
          <p className="text-app-muted text-xs font-semibold uppercase tracking-wider mb-1">Win Rate</p>
          <h3 className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</h3>
        </div>
        <div className="bg-app-surface border border-app-border rounded-2xl p-5 text-center shadow-card flex flex-col items-center justify-center">
           <div className="mb-2 p-2 bg-emerald-500/10 rounded-full text-emerald-500"><BarChart2 size={20} /></div>
          <p className="text-app-muted text-xs font-semibold uppercase tracking-wider mb-1">Trades</p>
          <h3 className="text-2xl font-bold text-white">{closedTrades.length}</h3>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-6 h-80 shadow-card">
        <h3 className="text-sm font-bold text-white mb-6">Equity Curve</h3>
        {closedTrades.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="cumulativeR" stroke="#3b82f6" strokeWidth={3} fill="url(#colorR)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-app-muted text-sm">
            No data to display
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-app-surface border border-app-border rounded-2xl overflow-hidden shadow-card">
        <div className="px-6 py-4 border-b border-app-border">
            <h3 className="font-bold text-white">Trade Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-app-text">
            <thead className="bg-app-bg text-app-muted font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Pair</th>
                <th className="px-6 py-3">Direction</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {closedTrades.slice().reverse().map((trade) => (
                <tr key={trade.id} className="hover:bg-app-card/30 transition">
                  <td className="px-6 py-4 text-app-muted">{new Date(trade.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-white">{trade.pair}</td>
                  <td className="px-6 py-4">
                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${trade.direction === 'LONG' ? 'bg-app-success/10 text-app-success' : 'bg-app-danger/10 text-app-danger'}`}>
                         {trade.direction}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${
                        trade.status === 'WON' ? 'text-app-success' : 
                        trade.status === 'LOST' ? 'text-app-danger' : 
                        'text-app-warning'
                      }`}>
                          {trade.status}
                      </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${trade.finalR > 0 ? 'text-app-success' : trade.finalR < 0 ? 'text-app-danger' : 'text-app-muted'}`}>
                      {trade.finalR > 0 ? '+' : ''}{trade.finalR}R
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-app-surface w-full max-w-sm rounded-2xl border border-app-border p-6 shadow-2xl">
                 <h3 className="text-lg font-bold text-white mb-4">Generate Report</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs text-app-muted font-semibold block mb-1">Start Date</label>
                         <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full input-field p-2 text-sm"/>
                     </div>
                     <div>
                         <label className="text-xs text-app-muted font-semibold block mb-1">End Date</label>
                         <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full input-field p-2 text-sm"/>
                     </div>
                 </div>
                 <div className="flex gap-3 mt-6">
                     <button onClick={() => setIsReportModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-app-border text-app-muted font-medium text-sm hover:bg-app-card transition">Cancel</button>
                     <button onClick={() => { alert("Generating..."); setIsReportModalOpen(false); }} className="flex-1 py-2.5 rounded-xl btn-primary text-sm shadow-lg">Download</button>
                 </div>
            </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
         <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
             <div className="bg-app-surface p-8 rounded-3xl text-center max-w-sm w-full shadow-2xl border border-app-border relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                 <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                     <Trophy size={32} className="text-white" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Target Smashed!</h2>
                 <p className="text-app-muted text-sm mb-6">You've hit your monthly goal of {monthlyTargetR}R. Keep pushing!</p>
                 <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
                     +{currentMonthR.toFixed(2)}R
                 </div>
                 <button 
                    onClick={handleCelebrateClose}
                    className="w-full btn-primary py-3"
                 >
                     Awesome!
                 </button>
             </div>
         </div>
      )}
    </div>
  );
};
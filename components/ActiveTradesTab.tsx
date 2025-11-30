import React, { useState } from 'react';
import { Trade, TradeStatus, PartialTP, Account, Strategy } from '../types';
import { Check, X, MoreHorizontal, TrendingUp, TrendingDown, Target, Shield } from 'lucide-react';
import { Translation } from '../translations';

interface ActiveTradesTabProps {
  trades: Trade[];
  accounts: Account[];
  strategies: Strategy[];
  updateTrade: (trade: Trade) => void;
  closeTrade: (tradeId: string, finalStatus: TradeStatus, finalR: number) => void;
  t: Translation;
}

export const ActiveTradesTab: React.FC<ActiveTradesTabProps> = ({
  trades,
  accounts,
  strategies,
  updateTrade,
  closeTrade,
  t
}) => {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  const openTrades = trades.filter(t => t.status === 'OPEN' || t.status === 'PARTIAL' || t.status === 'BE');

  const filteredTrades = selectedAccountId === 'ALL' 
    ? openTrades 
    : openTrades.filter(t => t.accountId === selectedAccountId);

  return (
    <div className="pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{t.active.title}</h2>
            <p className="text-app-muted text-sm">Monitor your open positions</p>
          </div>
          
          <div className="flex bg-app-surface p-1 rounded-xl overflow-x-auto custom-scrollbar border border-app-border/50">
             <button
                onClick={() => setSelectedAccountId('ALL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedAccountId === 'ALL' 
                    ? 'bg-app-card text-white shadow-sm' 
                    : 'text-app-muted hover:text-white'
                }`}
             >
                 All Accounts
             </button>
             <button
                onClick={() => setSelectedAccountId('GENERAL')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedAccountId === 'GENERAL' 
                    ? 'bg-app-card text-white shadow-sm' 
                    : 'text-app-muted hover:text-white'
                }`}
             >
                 General
             </button>
             {accounts.map(acc => (
                 <button
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedAccountId === acc.id
                        ? 'bg-app-card text-white shadow-sm' 
                        : 'text-app-muted hover:text-white'
                    }`}
                 >
                     {acc.name}
                 </button>
             ))}
          </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredTrades.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-app-muted border-2 border-dashed border-app-border rounded-3xl bg-app-surface/30">
             <div className="bg-app-card p-4 rounded-full mb-3">
                 <ActivityIcon />
             </div>
            <p className="font-medium">{t.active.noTrades}</p>
          </div>
        )}

        {filteredTrades.map((trade) => {
           const strategyName = trade.strategyId 
             ? strategies.find(s => s.id === trade.strategyId)?.name 
             : null;
           
           const riskMult = trade.riskMultiple || 1.0;

           return (
            <div key={trade.id} className="bg-app-surface border border-app-border rounded-2xl p-5 relative transition-all hover:shadow-glow group">
                {/* Header Info */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <h3 className="text-2xl font-bold text-white">{trade.pair}</h3>
                             <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${trade.direction === 'LONG' ? 'bg-app-success/10 text-app-success' : 'bg-app-danger/10 text-app-danger'}`}>
                                {trade.direction === 'LONG' ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                                {trade.direction}
                             </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                             <span className="px-2 py-0.5 rounded-md bg-app-bg text-[10px] font-medium text-app-muted border border-app-border">
                                {trade.accountId === 'GENERAL' 
                                    ? 'General Acc' 
                                    : accounts.find(a => a.id === trade.accountId)?.name || 'N/A'}
                            </span>
                            {strategyName && (
                                <span className="px-2 py-0.5 rounded-md bg-app-primary/10 text-[10px] font-medium text-app-primary border border-app-primary/20">
                                    {strategyName}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right bg-app-card/30 p-2 rounded-xl border border-app-border/30">
                         <span className="text-[10px] font-bold text-app-muted uppercase block mb-1">Risk</span>
                         <span className="text-lg font-bold text-white flex items-center justify-end gap-1">
                             <Shield size={14} className="text-app-primary" />
                             {riskMult}R
                         </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 bg-app-bg/50 p-3 rounded-xl">
                    <div className="flex flex-col">
                         <span className="text-[10px] text-app-muted uppercase font-bold mb-1">Entry Price</span>
                         <span className="text-white font-mono font-medium">{trade.entryPrice}</span>
                    </div>
                    <div className="flex flex-col text-right">
                         <span className="text-[10px] text-app-muted uppercase font-bold mb-1">Stop Loss</span>
                         <span className="text-app-danger font-mono font-medium">{trade.stopLoss}</span>
                    </div>
                </div>

                {/* TP Section - Clean List */}
                {trade.tps.length > 0 && (
                    <div className="mb-5 space-y-2">
                        {trade.tps.map((tp, idx) => {
                             const distanceR = trade.direction === 'LONG' 
                                ? (tp.price - trade.entryPrice) / trade.rValue 
                                : (trade.entryPrice - tp.price) / trade.rValue;
                             const realizedR = distanceR * riskMult;

                            return (
                                <div key={tp.id} className="flex items-center gap-3 text-xs">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${tp.hit ? 'bg-app-success border-app-success' : 'border-app-border bg-app-bg'}`}>
                                        {tp.hit && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className={`font-mono ${tp.hit ? 'text-app-success font-bold' : 'text-app-muted'}`}>TP{idx+1}: {tp.price}</span>
                                    <span className="ml-auto text-white font-medium bg-app-card px-2 py-0.5 rounded-md text-[10px]">+{realizedR.toFixed(2)}R</span>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="pt-4 border-t border-app-border flex justify-between items-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${trade.status === 'BE' ? 'bg-app-warning/10 text-app-warning' : 'bg-app-primary/10 text-app-primary'}`}>
                        {trade.status === 'BE' ? 'Break Even' : 'Running Active'}
                    </span>
                    <button 
                        onClick={() => setEditingTrade(trade)}
                        className="btn-secondary px-4 py-2 text-xs"
                    >
                        Manage Trade
                    </button>
                </div>
            </div>
           );
        })}
      </div>

      {editingTrade && (
          <ManageTradeModal 
            trade={editingTrade} 
            onClose={() => setEditingTrade(null)} 
            onUpdate={updateTrade}
            onCloseTrade={closeTrade}
            t={t}
          />
      )}
    </div>
  );
};

const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
);

const ManageTradeModal: React.FC<{
    trade: Trade; 
    onClose: () => void; 
    onUpdate: (t: Trade) => void;
    onCloseTrade: (id: string, status: TradeStatus, r: number) => void;
    t: Translation;
}> = ({ trade, onClose, onUpdate, onCloseTrade, t }) => {
    
    const [tps, setTps] = useState<PartialTP[]>(trade.tps);
    const [status, setStatus] = useState<TradeStatus>(trade.status);
    const [manualCloseR, setManualCloseR] = useState<string>("");
    
    const riskMult = trade.riskMultiple || 1.0;

    const toggleTP = (id: string) => {
        const newTps = tps.map(tp => tp.id === id ? { ...tp, hit: !tp.hit } : tp);
        setTps(newTps);
    };

    const handleSave = () => {
        onUpdate({ ...trade, tps, status });
        onClose();
    };

    const handleFullClose = (result: 'WIN' | 'LOSS' | 'BE') => {
        let finalR = 0;
        if (result === 'LOSS') finalR = -1 * riskMult;
        else if (result === 'BE') finalR = 0;
        else {
             if (manualCloseR) finalR = parseFloat(manualCloseR);
             else finalR = 1 * riskMult; 
        }
        const finalStatus = result === 'WIN' ? 'WON' : result === 'LOSS' ? 'LOST' : 'BE';
        onCloseTrade(trade.id, finalStatus, finalR);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-app-surface w-full max-w-lg rounded-2xl border border-app-border shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-app-border bg-app-bg/50">
                    <span className="font-bold text-white">Manage: {trade.pair}</span>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-app-card text-app-muted hover:text-white transition"><X size={18} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <label className="text-xs font-semibold text-app-muted mb-2 block uppercase tracking-wider">Update Status</label>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setStatus('OPEN')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${status === 'OPEN' ? 'bg-app-primary text-white border-app-primary shadow-lg shadow-blue-500/20' : 'bg-transparent border-app-border text-app-muted'}`}
                            >
                                OPEN
                            </button>
                            <button 
                                onClick={() => setStatus('BE')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${status === 'BE' ? 'bg-app-warning text-white border-app-warning shadow-lg shadow-amber-500/20' : 'bg-transparent border-app-border text-app-muted'}`}
                            >
                                BREAK EVEN
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-semibold text-app-muted mb-2 block uppercase tracking-wider">TP Checklist</label>
                        <div className="space-y-2">
                            {tps.map(tp => (
                                <button 
                                    key={tp.id}
                                    onClick={() => toggleTP(tp.id)}
                                    className={`w-full flex justify-between items-center p-3 rounded-xl border transition ${
                                        tp.hit ? 'bg-app-success/10 border-app-success/30' : 'bg-app-bg border-app-border hover:border-app-muted'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tp.hit ? 'bg-app-success border-app-success' : 'border-app-border'}`}>
                                            {tp.hit && <Check size={12} className="text-white"/>}
                                        </div>
                                        <span className={`font-mono text-sm ${tp.hit ? 'text-app-success font-bold' : 'text-app-text'}`}>
                                            {tp.price}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-app-muted bg-app-surface px-2 py-1 rounded-md">{tp.percentage}%</span>
                                </button>
                            ))}
                            {tps.length === 0 && <p className="text-center text-xs text-app-muted italic">No partials set.</p>}
                        </div>
                    </div>

                    <div className="border-t border-app-border my-6"></div>

                    <label className="text-xs font-semibold text-app-muted mb-3 block uppercase tracking-wider">Close Trade</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                         <button 
                            onClick={() => handleFullClose('LOSS')}
                            className="bg-app-danger/10 text-app-danger hover:bg-app-danger hover:text-white border border-app-danger/20 rounded-xl py-3 text-xs font-bold transition"
                        >
                            Stop Loss
                        </button>
                         <button 
                            onClick={() => handleFullClose('BE')}
                            className="bg-app-warning/10 text-app-warning hover:bg-app-warning hover:text-white border border-app-warning/20 rounded-xl py-3 text-xs font-bold transition"
                        >
                            Close BE
                        </button>
                        <div className="flex flex-col gap-1">
                             <div className="flex rounded-xl overflow-hidden border border-app-success/30">
                                <input 
                                    type="number" 
                                    placeholder="R" 
                                    value={manualCloseR}
                                    onChange={(e) => setManualCloseR(e.target.value)}
                                    className="w-1/2 bg-app-bg text-center text-xs font-bold text-white outline-none"
                                />
                                <button 
                                    onClick={() => handleFullClose('WIN')}
                                    className="w-1/2 bg-app-success text-white text-xs font-bold hover:bg-app-success/90"
                                >
                                    WIN
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-app-border bg-app-bg/50">
                    <button onClick={handleSave} className="w-full btn-primary py-3 text-sm">
                        {t.common.save} Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
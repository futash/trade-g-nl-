import React, { useState, useEffect } from 'react';
import { Trade, TradeStatus, PartialTP } from '../types';
import { Target, CheckCircle, XCircle, MoreVertical, Plus, Trash, AlertTriangle, Calculator } from 'lucide-react';

interface ActiveTradesTabProps {
  trades: Trade[];
  updateTrade: (trade: Trade) => void;
  closeTrade: (tradeId: string, finalStatus: TradeStatus, finalR: number) => void;
}

export const ActiveTradesTab: React.FC<ActiveTradesTabProps> = ({
  trades,
  updateTrade,
  closeTrade,
}) => {
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Filter only open trades
  const activeTrades = trades.filter(t => t.status === 'OPEN' || t.status === 'PARTIAL' || t.status === 'BE');

  const getProfitInR = (trade: Trade, currentStatus: TradeStatus) => {
      // This is a static calculator for display. Real calculations happen on close.
      // Since we don't have live price, we show Potential R or Locked R.
      return trade.status === 'BE' ? '0.00' : 'Open';
  };

  return (
    <div className="p-4 max-w-5xl mx-auto pb-24">
      <h2 className="text-2xl font-bold text-white mb-6">Active Executions</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {activeTrades.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            No active trades running. Go to Biases to execute one.
          </div>
        )}

        {activeTrades.map((trade) => (
          <div key={trade.id} className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white font-mono">{trade.pair}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          trade.direction === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {trade.direction}
                      </span>
                      <span className="text-slate-400 text-xs">@ {trade.entryPrice}</span>
                  </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">Risk Distance</div>
                    <div className="font-mono text-slate-300">{(trade.rValue).toFixed(5)}</div>
                </div>
              </div>

              {/* Trade Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div>
                      <span className="text-xs text-slate-500 block">Stop Loss</span>
                      <span className="text-rose-400 font-mono text-sm">{trade.stopLoss}</span>
                  </div>
                   <div>
                      <span className="text-xs text-slate-500 block">Status</span>
                      <span className={`font-mono text-sm ${trade.status === 'BE' ? 'text-yellow-400' : 'text-blue-400'}`}>
                          {trade.status === 'BE' ? 'Break Even' : 'Running'}
                      </span>
                  </div>
              </div>

              {/* Partial TPs */}
              {trade.tps.length > 0 && (
                  <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">Take Profits</p>
                      <div className="space-y-1">
                          {trade.tps.map((tp, idx) => {
                              const rMultiple = trade.direction === 'LONG' 
                                ? (tp.price - trade.entryPrice) / trade.rValue 
                                : (trade.entryPrice - tp.price) / trade.rValue;
                              
                              return (
                                <div key={tp.id} className="flex justify-between items-center text-sm p-2 bg-slate-900 rounded border border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${tp.hit ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                        <span className={tp.hit ? 'text-emerald-400 line-through' : 'text-slate-300'}>
                                            {tp.price} <span className="text-xs text-slate-500">({tp.percentage}%)</span>
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-slate-400">
                                        {rMultiple > 0 ? '+' : ''}{rMultiple.toFixed(2)}R
                                    </span>
                                </div>
                              )
                          })}
                      </div>
                  </div>
              )}

              <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setEditingTrade(trade)}
                    className="flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 py-2 rounded-lg text-sm font-medium transition"
                  >
                      Update / Manage
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingTrade && (
          <ManageTradeModal 
            trade={editingTrade} 
            onClose={() => setEditingTrade(null)} 
            onUpdate={updateTrade}
            onCloseTrade={closeTrade}
          />
      )}
    </div>
  );
};

// Sub-component for managing a specific trade
const ManageTradeModal: React.FC<{
    trade: Trade; 
    onClose: () => void; 
    onUpdate: (t: Trade) => void;
    onCloseTrade: (id: string, status: TradeStatus, r: number) => void;
}> = ({ trade, onClose, onUpdate, onCloseTrade }) => {
    
    const [tps, setTps] = useState<PartialTP[]>(trade.tps);
    const [status, setStatus] = useState<TradeStatus>(trade.status);
    const [manualCloseR, setManualCloseR] = useState<string>("");

    const toggleTP = (id: string) => {
        const newTps = tps.map(tp => tp.id === id ? { ...tp, hit: !tp.hit } : tp);
        setTps(newTps);
    };

    const handleSave = () => {
        onUpdate({
            ...trade,
            tps,
            status
        });
        onClose();
    };

    const handleFullClose = (result: 'WIN' | 'LOSS' | 'BE') => {
        let finalR = 0;
        if (result === 'LOSS') finalR = -1;
        else if (result === 'BE') finalR = 0;
        else {
             // For a win, user usually manually inputs the final R if not hitting a specific TP
             // Or we calculate based on last hit TP. 
             // To simplify, let's ask for the R or calculate from price.
             // Here we use the manual input if provided, otherwise assume last hit TP.
             if (manualCloseR) {
                 finalR = parseFloat(manualCloseR);
             } else {
                 // Auto calculate based on highest hit TP? 
                 // It's safer to require input for "Win" if not obvious.
                 // Defaulting to 1R if nothing set for safety in this demo
                 finalR = 1; 
             }
        }

        const finalStatus = result === 'WIN' ? 'WON' : result === 'LOSS' ? 'LOST' : 'BE';
        onCloseTrade(trade.id, finalStatus, finalR);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Manage Trade: {trade.pair}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-white"><XCircle size={24} /></button>
                    </div>

                    {/* Status Toggles */}
                    <div className="mb-6">
                        <label className="text-sm text-slate-400 mb-2 block">Current State</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setStatus('OPEN')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border ${status === 'OPEN' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                            >
                                Open
                            </button>
                            <button 
                                onClick={() => setStatus('BE')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border ${status === 'BE' ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                            >
                                Break Even
                            </button>
                        </div>
                    </div>

                    {/* TP Management */}
                    <div className="mb-6">
                        <label className="text-sm text-slate-400 mb-2 block">Partial Take Profits</label>
                        <div className="space-y-2">
                            {tps.map(tp => (
                                <button 
                                    key={tp.id}
                                    onClick={() => toggleTP(tp.id)}
                                    className={`w-full flex justify-between items-center p-3 rounded-lg border transition ${
                                        tp.hit ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${tp.hit ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                                            {tp.hit && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <span className={tp.hit ? 'text-emerald-300' : 'text-slate-300'}>Target: {tp.price}</span>
                                    </div>
                                    <span className="text-slate-500 text-sm">{tp.percentage}% Qty</span>
                                </button>
                            ))}
                            {tps.length === 0 && <p className="text-slate-500 text-sm italic">No partial TPs set.</p>}
                        </div>
                    </div>

                    <div className="border-t border-slate-700 my-4"></div>

                    {/* Close Actions */}
                    <label className="text-sm text-slate-400 mb-2 block">Close Trade Completely</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                         <button 
                            onClick={() => handleFullClose('LOSS')}
                            className="bg-rose-900/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800 p-2 rounded-lg text-sm font-bold"
                        >
                            Stop Hit (-1R)
                        </button>
                         <button 
                            onClick={() => handleFullClose('BE')}
                            className="bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-400 border border-yellow-800 p-2 rounded-lg text-sm font-bold"
                        >
                            Closed BE (0R)
                        </button>
                        <div className="relative">
                             <input 
                                type="number" 
                                placeholder="R Result?" 
                                value={manualCloseR}
                                onChange={(e) => setManualCloseR(e.target.value)}
                                className="w-full bg-emerald-900/20 border border-emerald-800 text-emerald-400 p-2 rounded-lg text-sm font-bold text-center outline-none focus:ring-1 focus:ring-emerald-500 mb-1"
                            />
                            <button 
                                onClick={() => handleFullClose('WIN')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-1 rounded"
                            >
                                Close Win
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-900 p-4 flex justify-end gap-3 border-t border-slate-700">
                     <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold">
                         Save Updates
                     </button>
                </div>
            </div>
        </div>
    )
}

import React, { useState, useEffect } from 'react';
import { INITIAL_FAVORITES } from './constants';
import { AppState, Bias, Trade, TradeStatus, PartialTP, Direction } from './types';
import { BiasTab } from './components/BiasTab';
import { ActiveTradesTab } from './components/ActiveTradesTab';
import { JournalTab } from './components/JournalTab';
import { SettingsTab } from './components/SettingsTab';
import { LayoutDashboard, Activity, BookOpen, Settings, X, Plus } from 'lucide-react';

const STORAGE_KEY = 'tradesync_v1';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'BIAS' | 'ACTIVE' | 'JOURNAL' | 'SETTINGS'>('BIAS');
  const [favorites, setFavorites] = useState<string[]>(INITIAL_FAVORITES);
  const [biases, setBiases] = useState<Bias[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [defaultRisk, setDefaultRisk] = useState<number>(1.0);

  // Execution Modal State
  const [executingBias, setExecutingBias] = useState<Bias | null>(null);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [execTps, setExecTps] = useState<{price: string, pct: string}[]>([]);

  // --- Effects ---
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: AppState = JSON.parse(stored);
        setFavorites(data.favorites || INITIAL_FAVORITES);
        setBiases(data.biases || []);
        setTrades(data.trades || []);
        setDefaultRisk(data.defaultRisk || 1.0);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data: AppState = { favorites, biases, trades, defaultRisk };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [favorites, biases, trades, defaultRisk]);

  // --- Handlers ---
  const addBias = (bias: Bias) => {
    setBiases([bias, ...biases]);
  };

  const deleteBias = (id: string) => {
    setBiases(biases.filter(b => b.id !== id));
  };

  const startExecution = (bias: Bias) => {
    setExecutingBias(bias);
    setEntryPrice('');
    setStopLoss('');
    setExecTps([]);
  };

  const handleExecuteTrade = () => {
    if (!executingBias || !entryPrice || !stopLoss) return;

    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    
    // Calculate 1R Distance absolute value
    const rDist = Math.abs(entry - sl);

    // Validate logic
    if (executingBias.direction === 'LONG' && sl >= entry) {
        alert("For LONG, Stop Loss must be below Entry.");
        return;
    }
    if (executingBias.direction === 'SHORT' && sl <= entry) {
        alert("For SHORT, Stop Loss must be above Entry.");
        return;
    }

    const tps: PartialTP[] = execTps.map((tp, i) => ({
        id: `tp-${Date.now()}-${i}`,
        price: parseFloat(tp.price),
        percentage: parseFloat(tp.pct),
        hit: false
    }));

    const newTrade: Trade = {
        id: Date.now().toString(),
        biasId: executingBias.id,
        pair: executingBias.pair,
        direction: executingBias.direction,
        entryPrice: entry,
        stopLoss: sl,
        rValue: rDist,
        chartLink: executingBias.chartLink,
        tps: tps,
        status: 'OPEN',
        finalR: 0,
        createdAt: Date.now(),
        notes: executingBias.notes
    };

    setTrades([newTrade, ...trades]);
    
    // Mark Bias as executed
    setBiases(biases.map(b => b.id === executingBias.id ? { ...b, isExecuted: true } : b));
    
    setExecutingBias(null);
    setActiveTab('ACTIVE');
  };

  const updateTrade = (updatedTrade: Trade) => {
      setTrades(trades.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  };

  const closeTrade = (id: string, finalStatus: TradeStatus, finalR: number) => {
      setTrades(trades.map(t => t.id === id ? { 
          ...t, 
          status: finalStatus, 
          finalR, 
          closedAt: Date.now() 
        } : t));
  };

  const addTpRow = () => {
      setExecTps([...execExecTps, { price: '', pct: '50' }]);
  };

  const updateTpRow = (idx: number, field: 'price' | 'pct', val: string) => {
      const newTps = [...execTps];
      newTps[idx] = { ...newTps[idx], [field]: val };
      setExecTps(newTps);
  };
  
  // Use a temporary variable for the render to avoid state dependency issues inside the render function logic if needed, 
  // but here direct state usage is fine.
  const execExecTps = execTps; 

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* Mobile/Desktop Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-auto md:left-0 md:w-20 md:h-screen bg-slate-950 border-t md:border-t-0 md:border-r border-slate-800 z-40 flex md:flex-col justify-around md:justify-start items-center p-2 md:pt-8 md:gap-8">
        <NavBtn 
            active={activeTab === 'BIAS'} 
            onClick={() => setActiveTab('BIAS')} 
            icon={<LayoutDashboard size={24} />} 
            label="Plan" 
        />
        <NavBtn 
            active={activeTab === 'ACTIVE'} 
            onClick={() => setActiveTab('ACTIVE')} 
            icon={<Activity size={24} />} 
            label="Active" 
            badge={trades.filter(t => t.status === 'OPEN' || t.status === 'BE').length}
        />
        <NavBtn 
            active={activeTab === 'JOURNAL'} 
            onClick={() => setActiveTab('JOURNAL')} 
            icon={<BookOpen size={24} />} 
            label="Journal" 
        />
        <div className="hidden md:block md:flex-1"></div>
        <NavBtn 
            active={activeTab === 'SETTINGS'} 
            onClick={() => setActiveTab('SETTINGS')} 
            icon={<Settings size={24} />} 
            label="Config" 
        />
      </nav>

      {/* Main Content Area */}
      <main className="pb-20 md:pb-0 md:pl-20 min-h-screen transition-all">
        <header className="p-4 md:p-8 flex justify-between items-center bg-slate-900/90 backdrop-blur sticky top-0 z-30 border-b border-slate-800">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                   TS
               </div>
               <h1 className="text-xl font-bold text-white tracking-tight">TradeSync</h1>
           </div>
        </header>

        <div className="mt-4">
            {activeTab === 'BIAS' && (
                <BiasTab 
                    biases={biases} 
                    favorites={favorites} 
                    addBias={addBias} 
                    deleteBias={deleteBias}
                    onExecute={startExecution}
                />
            )}
            {activeTab === 'ACTIVE' && (
                <ActiveTradesTab 
                    trades={trades} 
                    updateTrade={updateTrade}
                    closeTrade={closeTrade}
                />
            )}
            {activeTab === 'JOURNAL' && (
                <JournalTab trades={trades} />
            )}
            {activeTab === 'SETTINGS' && (
                <SettingsTab 
                    favorites={favorites} 
                    setFavorites={setFavorites}
                    defaultRisk={defaultRisk}
                    setDefaultRisk={setDefaultRisk}
                />
            )}
        </div>
      </main>

      {/* Execution Modal */}
      {executingBias && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                  <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                          <div>
                              <h3 className="text-xl font-bold text-white">Execute Trade</h3>
                              <p className="text-slate-400 text-sm">{executingBias.pair} • {executingBias.direction}</p>
                          </div>
                          <button onClick={() => setExecutingBias(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
                      </div>

                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs text-slate-400 mb-1 block uppercase font-bold">Entry Price</label>
                                  <input 
                                    type="number" 
                                    value={entryPrice} 
                                    onChange={e => setEntryPrice(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono" 
                                    placeholder="0.00000"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs text-slate-400 mb-1 block uppercase font-bold">Stop Loss</label>
                                  <input 
                                    type="number" 
                                    value={stopLoss} 
                                    onChange={e => setStopLoss(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 font-mono" 
                                    placeholder="0.00000"
                                  />
                              </div>
                          </div>

                          {/* R Calc Preview */}
                          {entryPrice && stopLoss && (
                              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                  <span className="text-sm text-slate-400">1R Distance</span>
                                  <span className="font-mono text-indigo-400 font-bold">{Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss)).toFixed(5)}</span>
                              </div>
                          )}

                          {/* Partial TPs */}
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs text-slate-400 uppercase font-bold">Partial Take Profits</label>
                                  <button onClick={addTpRow} className="text-indigo-400 text-xs flex items-center hover:text-indigo-300">
                                      <Plus size={14} /> Add TP
                                  </button>
                              </div>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {execTps.map((tp, idx) => (
                                      <div key={idx} className="flex gap-2">
                                          <input 
                                            type="number" 
                                            placeholder="Target"
                                            value={tp.price}
                                            onChange={e => updateTpRow(idx, 'price', e.target.value)}
                                            className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 rounded text-sm font-mono"
                                          />
                                           <input 
                                            type="number" 
                                            placeholder="%"
                                            value={tp.pct}
                                            onChange={e => updateTpRow(idx, 'pct', e.target.value)}
                                            className="w-20 bg-slate-900 border border-slate-700 text-white p-2 rounded text-sm text-center"
                                          />
                                          <button 
                                            onClick={() => setExecTps(execTps.filter((_, i) => i !== idx))}
                                            className="text-rose-500 hover:text-rose-400 px-1"
                                          >
                                              <X size={16} />
                                          </button>
                                      </div>
                                  ))}
                                  {execTps.length === 0 && <p className="text-slate-600 text-xs italic text-center py-2">No partial TPs configured</p>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-slate-900 p-4 border-t border-slate-700">
                      <button 
                        onClick={handleExecuteTrade}
                        disabled={!entryPrice || !stopLoss}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-emerald-500/20 transition"
                      >
                          Confirm Execution
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Nav Button Helper
const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 md:w-full md:py-4 relative ${
            active ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
        }`}
    >
        <div className="relative">
            {icon}
            {badge && badge > 0 ? (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {badge}
                </span>
            ) : null}
        </div>
        <span className="text-[10px] md:text-xs font-medium">{label}</span>
        {active && <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"></div>}
    </button>
);

export default App;

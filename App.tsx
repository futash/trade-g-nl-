import React, { useState, useEffect } from 'react';
import { INITIAL_FAVORITES } from './constants';
import { AppState, Bias, Trade, TradeStatus, PartialTP, Language, Account, Strategy } from './types';
import { BiasTab } from './components/BiasTab';
import { ActiveTradesTab } from './components/ActiveTradesTab';
import { JournalTab } from './components/JournalTab';
import { SettingsTab } from './components/SettingsTab';
import { LayoutDashboard, Activity, BookOpen, Settings, X, Plus, Calculator, ArrowRight } from 'lucide-react';
import { translations } from './translations';

const STORAGE_KEY = 'kaizenlog_v1';

// Kaizen Logo - "Neon Cycles & Pixels"
const Logo = () => (
  <div className="bg-[#09090b] w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] group overflow-hidden relative">
    {/* Ambient Glow */}
    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
    
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
      {/* Outer Arc */}
      <path d="M21 12A9 9 0 0 0 12 3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 12a9 9 0 0 0 9 9" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Middle Arc */}
      <path d="M17 12A5 5 0 0 0 12 7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
      <path d="M7 12a5 5 0 0 0 5 5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8"/>
      
      {/* Inner Arc */}
      <path d="M14 12A2 2 0 1 0 10 12" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6"/>
      
      {/* Pixel Blocks (Top Right Growth) */}
      <rect x="19" y="3" width="2" height="2" fill="#10b981" />
      <rect x="17" y="5" width="2" height="2" fill="#10b981" fillOpacity="0.8"/>
      
      {/* Pixel Blocks (Bottom Left Foundation) */}
      <rect x="3" y="19" width="2" height="2" fill="#10b981" />
      <rect x="5" y="17" width="2" height="2" fill="#10b981" fillOpacity="0.8"/>
    </svg>
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'BIAS' | 'ACTIVE' | 'JOURNAL' | 'SETTINGS'>('BIAS');
  const [favorites, setFavorites] = useState<string[]>(INITIAL_FAVORITES);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [biases, setBiases] = useState<Bias[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [defaultRisk, setDefaultRisk] = useState<number>(1.0);
  const [language, setLanguage] = useState<Language>('en');
  const [monthlyTargetR, setMonthlyTargetR] = useState<number>(20);
  const [lastCelebratedMonth, setLastCelebratedMonth] = useState<string>('');

  // Execution Modal State
  const [executingBias, setExecutingBias] = useState<Bias | null>(null);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [executionRisk, setExecutionRisk] = useState<string>('1.0');
  const [execTps, setExecTps] = useState<{price: string, pct: string}[]>([]);
  const [selectedAccountForTrade, setSelectedAccountForTrade] = useState<string>('GENERAL');
  const [selectedStrategyForTrade, setSelectedStrategyForTrade] = useState<string>('');

  // Get current translation object
  const t = translations[language];

  // --- Effects ---
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: AppState = JSON.parse(stored);
        setFavorites(data.favorites || INITIAL_FAVORITES);
        setAccounts(data.accounts || []);
        setStrategies(data.strategies || []);
        setBiases(data.biases || []);
        const loadedTrades = (data.trades || []).map(t => ({
             ...t,
             accountId: t.accountId || 'GENERAL',
             riskMultiple: t.riskMultiple || 1.0
        }));
        setTrades(loadedTrades);
        setDefaultRisk(data.defaultRisk || 1.0);
        setLanguage(data.language || 'en');
        setMonthlyTargetR(data.monthlyTargetR || 20);
        setLastCelebratedMonth(data.lastCelebratedMonth || '');
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  useEffect(() => {
    const data: AppState = { 
        favorites, accounts, strategies, biases, trades, defaultRisk, language,
        monthlyTargetR, lastCelebratedMonth
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [favorites, accounts, strategies, biases, trades, defaultRisk, language, monthlyTargetR, lastCelebratedMonth]);

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
    setExecutionRisk('1.0');
    setExecTps([]);
    setSelectedAccountForTrade('GENERAL');
    setSelectedStrategyForTrade('');
  };

  const handleExecuteTrade = () => {
    if (!executingBias || !entryPrice || !stopLoss) return;

    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    const riskMult = parseFloat(executionRisk) || 1.0;
    
    const rDist = Math.abs(entry - sl);

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
        accountId: selectedAccountForTrade,
        strategyId: selectedStrategyForTrade || undefined,
        pair: executingBias.pair,
        direction: executingBias.direction,
        entryPrice: entry,
        stopLoss: sl,
        rValue: rDist,
        riskMultiple: riskMult,
        chartLink: executingBias.chartLink,
        tps: tps,
        status: 'OPEN',
        finalR: 0,
        createdAt: Date.now(),
        notes: executingBias.notes
    };

    setTrades([newTrade, ...trades]);
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
  
  const execExecTps = execTps; 

  return (
    <div className="min-h-screen bg-app-bg text-app-text selection:bg-app-primary selection:text-white flex flex-col md:flex-row font-sans">
      
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-app-bg to-[#000000] z-0 pointer-events-none"></div>

      {/* Modern Sidebar / Mobile Bottom Bar */}
      <nav className="glass-nav fixed bottom-0 left-0 w-full z-50 md:static md:w-24 md:h-screen md:border-t-0 md:border-r md:border-app-border flex md:flex-col justify-between items-center py-2 px-6 md:py-8 md:px-0 shadow-2xl">
        <div className="hidden md:flex flex-col items-center gap-6">
            <Logo />
        </div>
        
        <div className="flex md:flex-col justify-between w-full md:w-auto md:gap-8">
            <NavBtn 
                active={activeTab === 'BIAS'} 
                onClick={() => setActiveTab('BIAS')} 
                icon={<LayoutDashboard size={24} />} 
                label={t.nav.plan} 
            />
            <NavBtn 
                active={activeTab === 'ACTIVE'} 
                onClick={() => setActiveTab('ACTIVE')} 
                icon={<Activity size={24} />} 
                label={t.nav.active}
                badge={trades.filter(t => t.status === 'OPEN' || t.status === 'BE').length}
            />
            <NavBtn 
                active={activeTab === 'JOURNAL'} 
                onClick={() => setActiveTab('JOURNAL')} 
                icon={<BookOpen size={24} />} 
                label={t.nav.journal}
            />
            <NavBtn 
                active={activeTab === 'SETTINGS'} 
                onClick={() => setActiveTab('SETTINGS')} 
                icon={<Settings size={24} />} 
                label={t.nav.config}
            />
        </div>

        <div className="hidden md:block w-full text-center pb-4">
             <div className="w-8 h-1 bg-app-border rounded-full mx-auto"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 pt-safe relative z-10 overflow-y-auto max-h-screen custom-scrollbar">
        {/* Mobile Header */}
        <header className="md:hidden px-6 py-6 sticky top-0 z-40 flex justify-between items-center bg-app-bg/80 backdrop-blur-md border-b border-app-border">
           <div className="flex items-center gap-3">
               <Logo />
               <h1 className="text-xl font-bold tracking-tight text-white">KaizenLog</h1>
           </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {activeTab === 'BIAS' && (
                <BiasTab 
                    biases={biases} 
                    favorites={favorites} 
                    addBias={addBias} 
                    deleteBias={deleteBias}
                    onExecute={startExecution}
                    t={t}
                />
            )}
            {activeTab === 'ACTIVE' && (
                <ActiveTradesTab 
                    trades={trades} 
                    accounts={accounts}
                    strategies={strategies}
                    updateTrade={updateTrade}
                    closeTrade={closeTrade}
                    t={t}
                />
            )}
            {activeTab === 'JOURNAL' && (
                <JournalTab 
                    trades={trades} 
                    accounts={accounts} 
                    strategies={strategies} 
                    monthlyTargetR={monthlyTargetR}
                    setMonthlyTargetR={setMonthlyTargetR}
                    lastCelebratedMonth={lastCelebratedMonth}
                    setLastCelebratedMonth={setLastCelebratedMonth}
                    t={t} 
                />
            )}
            {activeTab === 'SETTINGS' && (
                <SettingsTab 
                    favorites={favorites} 
                    setFavorites={setFavorites}
                    accounts={accounts}
                    setAccounts={setAccounts}
                    strategies={strategies}
                    setStrategies={setStrategies}
                    defaultRisk={defaultRisk}
                    setDefaultRisk={setDefaultRisk}
                    language={language}
                    setLanguage={setLanguage}
                    t={t}
                />
            )}
        </div>
      </main>

      {/* Execution Modal - Modern Card Style */}
      {executingBias && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-app-surface w-full max-w-lg rounded-xl shadow-2xl border border-app-border overflow-hidden transform transition-all">
                  <div className="p-4 border-b border-app-border flex justify-between items-center bg-app-bg/50">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Calculator size={18} className="text-app-primary" />
                        Execute Trade
                      </h3>
                      <button onClick={() => setExecutingBias(null)} className="p-2 hover:bg-app-card rounded-full text-app-muted hover:text-white transition"><X size={18} /></button>
                  </div>

                  <div className="p-6">
                      <div className="flex justify-between items-end mb-6">
                          <div>
                              <p className="text-app-muted text-xs font-medium uppercase tracking-wider mb-1">Asset</p>
                              <h2 className="text-3xl font-bold text-white tracking-tight">{executingBias.pair}</h2>
                          </div>
                          <div className={`px-4 py-2 rounded-lg text-sm font-bold ${executingBias.direction === 'LONG' ? 'bg-app-success/20 text-app-success border border-app-success/30' : 'bg-app-danger/20 text-app-danger border border-app-danger/30'}`}>
                              {executingBias.direction}
                          </div>
                      </div>

                      <div className="space-y-5">
                          {/* Configs */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-app-muted font-medium mb-1.5 block">Account</label>
                                <select 
                                    value={selectedAccountForTrade} 
                                    onChange={(e) => setSelectedAccountForTrade(e.target.value)}
                                    className="w-full input-field p-3 text-sm"
                                >
                                    <option value="GENERAL">{t.common.general}</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-app-muted font-medium mb-1.5 block">Strategy</label>
                                <select 
                                    value={selectedStrategyForTrade} 
                                    onChange={(e) => setSelectedStrategyForTrade(e.target.value)}
                                    className="w-full input-field p-3 text-sm"
                                >
                                    <option value="">No Strategy</option>
                                    {strategies.map(strat => (
                                        <option key={strat.id} value={strat.id}>{strat.name}</option>
                                    ))}
                                </select>
                            </div>
                          </div>

                          {/* Price Inputs */}
                          <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-1">
                                  <label className="text-xs text-app-muted font-medium mb-1.5 block">Entry</label>
                                  <input 
                                    type="number" 
                                    value={entryPrice} 
                                    onChange={e => setEntryPrice(e.target.value)}
                                    className="w-full input-field p-3 text-sm font-mono" 
                                    placeholder="0.0000"
                                  />
                              </div>
                              <div className="col-span-1">
                                  <label className="text-xs text-app-muted font-medium mb-1.5 block">Stop Loss</label>
                                  <input 
                                    type="number" 
                                    value={stopLoss} 
                                    onChange={e => setStopLoss(e.target.value)}
                                    className="w-full input-field p-3 text-sm font-mono border-app-danger/30 focus:border-app-danger" 
                                    placeholder="0.0000"
                                  />
                              </div>
                              <div className="col-span-1">
                                  <label className="text-xs text-app-primary font-medium mb-1.5 block">Risk (R)</label>
                                  <input 
                                    type="number" 
                                    value={executionRisk} 
                                    onChange={e => setExecutionRisk(e.target.value)}
                                    className="w-full input-field p-3 text-sm text-center font-bold text-app-primary border-app-primary/30" 
                                    placeholder="1.0"
                                  />
                              </div>
                          </div>

                          {/* 1R Calc */}
                          {entryPrice && stopLoss && (
                              <div className="bg-app-card/50 rounded-lg p-3 flex justify-between items-center border border-app-border/50">
                                  <span className="text-xs text-app-muted font-medium">1R Distance</span>
                                  <span className="text-white font-mono font-bold text-sm">{Math.abs(parseFloat(entryPrice) - parseFloat(stopLoss)).toFixed(5)}</span>
                              </div>
                          )}

                          {/* Partial TPs */}
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs text-app-muted font-medium">Partial Take Profits</label>
                                  <button onClick={addTpRow} className="text-app-primary text-xs font-bold hover:underline flex items-center gap-1">
                                      <Plus size={12} /> Add Level
                                  </button>
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                  {execTps.map((tp, idx) => (
                                      <div key={idx} className="flex gap-2">
                                          <input 
                                            type="number" 
                                            placeholder="Price"
                                            value={tp.price}
                                            onChange={e => updateTpRow(idx, 'price', e.target.value)}
                                            className="flex-1 input-field p-2 text-xs font-mono"
                                          />
                                           <div className="relative w-20">
                                              <input 
                                                type="number" 
                                                placeholder="%"
                                                value={tp.pct}
                                                onChange={e => updateTpRow(idx, 'pct', e.target.value)}
                                                className="w-full input-field p-2 text-xs text-center pr-6"
                                              />
                                              <span className="absolute right-2 top-2 text-xs text-app-muted">%</span>
                                           </div>
                                          <button 
                                            onClick={() => setExecTps(execTps.filter((_, i) => i !== idx))}
                                            className="text-app-muted hover:text-app-danger px-1 transition"
                                          >
                                              <X size={16} />
                                          </button>
                                      </div>
                                  ))}
                                  {execTps.length === 0 && <div className="text-app-muted/50 text-xs italic text-center py-2 bg-app-card/30 rounded-lg">No partial TPs defined</div>}
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-app-border bg-app-bg/50">
                      <button 
                        onClick={handleExecuteTrade}
                        disabled={!entryPrice || !stopLoss}
                        className="w-full btn-primary py-3.5 flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Confirm Execution <ArrowRight size={18} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Modern Nav Button
const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
    <button 
        onClick={onClick}
        className={`group relative flex md:flex-row flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 md:w-full md:aspect-square ${
            active 
            ? 'bg-app-primary text-white shadow-glow' 
            : 'text-app-muted hover:bg-app-surface hover:text-white'
        }`}
    >
        <div className="relative">
            {icon}
            {badge && badge > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-app-danger text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold border-2 border-app-bg">
                </span>
            ) : null}
        </div>
        <span className={`text-[10px] mt-1 md:hidden font-medium ${active ? 'text-white' : 'text-app-muted'}`}>{label}</span>
    </button>
);

export default App;
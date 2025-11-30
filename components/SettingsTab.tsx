import React, { useState } from 'react';
import { Plus, Trash2, Globe, Shield, Wallet, Layers, Sliders, Check } from 'lucide-react';
import { Language, Account, Strategy } from '../types';
import { Translation } from '../translations';

interface SettingsTabProps {
  favorites: string[];
  setFavorites: (favs: string[]) => void;
  accounts: Account[];
  setAccounts: (accs: Account[]) => void;
  strategies: Strategy[];
  setStrategies: (strats: Strategy[]) => void;
  defaultRisk: number;
  setDefaultRisk: (risk: number) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  favorites,
  setFavorites,
  accounts,
  setAccounts,
  strategies,
  setStrategies,
  defaultRisk,
  setDefaultRisk,
  language,
  setLanguage,
  t
}) => {
  const [newPair, setNewPair] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newStrategy, setNewStrategy] = useState('');

  // Pairs Logic
  const handleAddPair = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPair.trim().toUpperCase();
    if (!trimmed) return;
    if (favorites.includes(trimmed)) {
      setNewPair(''); 
      return;
    }
    setFavorites([...favorites, trimmed]);
    setNewPair('');
  };

  const handleRemovePair = (pair: string) => {
    setFavorites(favorites.filter((f) => f !== pair));
  };

  // Accounts Logic
  const handleAddAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAccount.trim();
    if (!trimmed) return;
    const newAcc: Account = { id: Date.now().toString(), name: trimmed };
    setAccounts([...accounts, newAcc]);
    setNewAccount('');
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  // Strategies Logic
  const handleAddStrategy = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newStrategy.trim();
    if (!trimmed) return;
    const newStrat: Strategy = { id: Date.now().toString(), name: trimmed };
    setStrategies([...strategies, newStrat]);
    setNewStrategy('');
  };

  const handleRemoveStrategy = (id: string) => {
    setStrategies(strategies.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-24">
      <h2 className="text-3xl font-bold text-white mb-6">{t.settings.title}</h2>
      
      {/* Language */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-app-primary" /> {t.settings.language}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {LANGUAGES.map((lang) => (
              <button 
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl transition font-medium text-sm border ${
                    language === lang.code 
                    ? 'bg-app-primary text-white border-app-primary shadow-lg shadow-blue-500/20' 
                    : 'bg-app-bg text-app-muted border-app-border hover:bg-app-card hover:text-white'
                }`}
              >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {language === lang.code && <Check size={14} className="ml-auto" />}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accounts */}
        <div className="bg-app-surface border border-app-border rounded-2xl p-6 shadow-card">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-500"/>
                {t.settings.accountsTitle}
            </h2>
            <p className="text-xs text-app-muted mb-4">{t.settings.accountsSubtitle}</p>
            
            <form onSubmit={handleAddAccount} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="e.g., Fund A"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    className="flex-1 input-field p-2 text-sm"
                />
                <button type="submit" disabled={!newAccount.trim()} className="btn-secondary px-4 text-xs">
                    ADD
                </button>
            </form>

            <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {accounts.map((acc) => (
                <li key={acc.id} className="flex justify-between items-center p-3 bg-app-bg rounded-xl border border-app-border">
                    <span className="text-sm text-white font-medium">{acc.name}</span>
                    <button onClick={() => handleRemoveAccount(acc.id)} className="text-app-muted hover:text-app-danger transition"><Trash2 size={16} /></button>
                </li>
            ))}
            {accounts.length === 0 && <p className="text-xs text-app-muted italic text-center py-2">{t.settings.noAccounts}</p>}
            </ul>
        </div>

        {/* Strategies */}
        <div className="bg-app-surface border border-app-border rounded-2xl p-6 shadow-card">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Layers size={18} className="text-purple-500"/>
                {t.settings.strategiesTitle}
            </h2>
            <p className="text-xs text-app-muted mb-4">{t.settings.strategiesSubtitle}</p>
            
            <form onSubmit={handleAddStrategy} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="e.g., Breakout"
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value)}
                    className="flex-1 input-field p-2 text-sm"
                />
                <button type="submit" disabled={!newStrategy.trim()} className="btn-secondary px-4 text-xs">
                    ADD
                </button>
            </form>

            <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {strategies.map((strat) => (
                <li key={strat.id} className="flex justify-between items-center p-3 bg-app-bg rounded-xl border border-app-border">
                    <span className="text-sm text-white font-medium">{strat.name}</span>
                    <button onClick={() => handleRemoveStrategy(strat.id)} className="text-app-muted hover:text-app-danger transition"><Trash2 size={16} /></button>
                </li>
            ))}
             {strategies.length === 0 && <p className="text-xs text-app-muted italic text-center py-2">{t.settings.noStrategies}</p>}
            </ul>
        </div>
      </div>

      {/* Risk */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-6 flex justify-between items-center shadow-card">
        <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Shield size={18} className="text-amber-500"/>
                {t.settings.riskTitle}
            </h2>
            <p className="text-xs text-app-muted">{t.settings.riskLabel}</p>
        </div>
        <div className="flex items-center gap-2 bg-app-bg p-1 rounded-xl border border-app-border">
            <input
                type="number"
                value={defaultRisk}
                onChange={(e) => setDefaultRisk(parseFloat(e.target.value))}
                className="w-16 bg-transparent text-center text-lg font-bold text-white outline-none"
            />
            <span className="text-sm font-medium text-app-muted pr-3">%</span>
        </div>
      </div>

      {/* Pairs */}
      <div className="bg-app-surface border border-app-border rounded-2xl p-6 shadow-card">
        <div className="flex justify-between items-center mb-6 border-b border-app-border pb-4">
            <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                    <Sliders size={18} className="text-pink-500"/>
                    {t.settings.pairsTitle}
                </h2>
                <p className="text-xs text-app-muted">{t.settings.pairsSubtitle}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-app-bg rounded-full text-app-muted">{favorites.length} Pairs</span>
        </div>
        
        <form onSubmit={handleAddPair} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="e.g. BTCUSDT"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            className="flex-1 input-field p-3 text-sm uppercase font-mono"
          />
          <button type="submit" disabled={!newPair.trim()} className="btn-primary px-6 text-sm">
            ADD
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {favorites.map((pair) => (
            <div key={pair} className="group p-3 rounded-xl border border-app-border bg-app-bg hover:border-app-primary transition flex justify-between items-center">
              <span className="font-bold text-white text-xs">{pair}</span>
              <button onClick={() => handleRemovePair(pair)} className="text-app-muted hover:text-app-danger transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
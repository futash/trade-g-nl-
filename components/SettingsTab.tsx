
import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

interface SettingsTabProps {
  favorites: string[];
  setFavorites: (favs: string[]) => void;
  defaultRisk: number;
  setDefaultRisk: (risk: number) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  favorites,
  setFavorites,
  defaultRisk,
  setDefaultRisk,
}) => {
  const [newPair, setNewPair] = useState('');

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

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Risk Settings */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Risk Management</h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-400">Default Risk % per Trade (Display Only)</label>
          <input
            type="number"
            value={defaultRisk}
            onChange={(e) => setDefaultRisk(parseFloat(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-1/3"
            placeholder="1.0"
          />
        </div>
      </div>

      {/* Pair Management */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Manage Pair List</h2>
            <p className="text-sm text-slate-400 mt-1">Add or remove pairs to appear in your selection lists.</p>
          </div>
          <span className="text-sm text-indigo-400 font-mono bg-indigo-500/10 px-3 py-1 rounded-full">
            {favorites.length} Pairs
          </span>
        </div>
        
        {/* Add Pair Form */}
        <form onSubmit={handleAddPair} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Enter pair (e.g. SOLUSDT)"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
          />
          <button 
            type="submit"
            disabled={!newPair.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-bold flex items-center gap-2 transition"
          >
            <Plus size={20} /> Add
          </button>
        </form>

        {/* Pairs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {favorites.map((pair) => (
            <div
              key={pair}
              className="group p-3 rounded-lg border border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 transition-all flex justify-between items-center"
            >
              <span className="font-mono font-medium text-slate-200">{pair}</span>
              <button
                onClick={() => handleRemovePair(pair)}
                className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-rose-900/20 transition"
                title="Remove Pair"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {favorites.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
              No pairs added. Add one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

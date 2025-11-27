import React, { useState } from 'react';
import { Bias, Direction } from '../types';
import { analyzeBias } from '../services/geminiService';
import { Plus, ExternalLink, Trash2, ArrowRight, Wand2, Loader2 } from 'lucide-react';

interface BiasTabProps {
  biases: Bias[];
  favorites: string[];
  addBias: (bias: Bias) => void;
  deleteBias: (id: string) => void;
  onExecute: (bias: Bias) => void;
}

export const BiasTab: React.FC<BiasTabProps> = ({
  biases,
  favorites,
  addBias,
  deleteBias,
  onExecute,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form State
  const [pair, setPair] = useState(favorites[0] || '');
  const [direction, setDirection] = useState<Direction>('LONG');
  const [chartLink, setChartLink] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    const newBias: Bias = {
      id: Date.now().toString(),
      pair,
      direction,
      chartLink,
      notes,
      createdAt: Date.now(),
      isExecuted: false,
    };
    addBias(newBias);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNotes('');
    setChartLink('');
    setDirection('LONG');
  };

  const handleAIAnalyze = async () => {
    if (!pair) return;
    setIsAnalyzing(true);
    const result = await analyzeBias(pair, direction, notes);
    setNotes((prev) => (prev ? `${prev}\n\n-- AI Analysis --\n${result}` : result));
    setIsAnalyzing(false);
  };

  const activeBiases = biases.filter(b => !b.isExecuted);

  return (
    <div className="p-4 max-w-5xl mx-auto relative min-h-screen pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Weekly Biases</h2>
          <p className="text-slate-400 text-sm">Plan your trades before executing.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus size={18} /> Add Bias
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeBiases.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            No active biases. Start planning!
          </div>
        )}
        {activeBiases.map((bias) => (
          <div
            key={bias.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg relative group hover:border-slate-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xl font-bold text-white font-mono">{bias.pair}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  bias.direction === 'LONG'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {bias.direction}
              </span>
            </div>

            {bias.notes && (
              <p className="text-slate-400 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">{bias.notes}</p>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
               {bias.chartLink && (
                  <a
                    href={bias.chartLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition"
                    title="Open Chart"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => deleteBias(bias.id)}
                  className="p-2 bg-slate-700 text-rose-400 rounded hover:bg-rose-900/30 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => onExecute(bias)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-2 text-sm font-semibold flex justify-center items-center gap-2 transition ml-auto"
                >
                  Execute <ArrowRight size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">New Weekly Bias</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Pair</label>
                  <select
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {favorites.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                    {favorites.length === 0 && <option value="">No favorites selected</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDirection('LONG')}
                      className={`p-3 rounded-lg font-bold transition ${
                        direction === 'LONG'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      onClick={() => setDirection('SHORT')}
                      className={`p-3 rounded-lg font-bold transition ${
                        direction === 'SHORT'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 text-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">TradingView Chart URL (Optional)</label>
                  <input
                    type="url"
                    value={chartLink}
                    onChange={(e) => setChartLink(e.target.value)}
                    placeholder="https://tradingview.com/..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-400 text-sm">Notes / Plan</label>
                    <button 
                        onClick={handleAIAnalyze}
                        disabled={isAnalyzing || !process.env.API_KEY}
                        className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        Ask AI
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key levels, confluences, setup details..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="bg-slate-900 p-4 flex gap-3 justify-end border-t border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

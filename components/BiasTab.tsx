import React, { useState } from 'react';
import { Bias, Direction } from '../types';
import { Plus, ExternalLink, Trash2, ArrowRight } from 'lucide-react';
import { Translation } from '../translations';

interface BiasTabProps {
  biases: Bias[];
  favorites: string[];
  addBias: (bias: Bias) => void;
  deleteBias: (id: string) => void;
  onExecute: (bias: Bias) => void;
  t: Translation;
}

export const BiasTab: React.FC<BiasTabProps> = ({
  biases,
  favorites,
  addBias,
  deleteBias,
  onExecute,
  t
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const activeBiases = biases.filter(b => !b.isExecuted);

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">{t.bias.title}</h2>
          <p className="text-app-muted text-sm">{t.bias.subtitle}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} /> {t.bias.addBias}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-24">
        {activeBiases.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-app-muted border-2 border-dashed border-app-border rounded-3xl bg-app-surface/30">
            <p className="text-sm font-medium">{t.bias.noBiases}</p>
          </div>
        )}
        
        {activeBiases.map((bias) => (
          <div
            key={bias.id}
            className="bg-app-surface border border-app-border rounded-2xl p-5 shadow-card hover:shadow-glow transition-all duration-300 relative group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{bias.pair}</h3>
                  <p className="text-xs text-app-muted font-medium mt-1">
                      {new Date(bias.createdAt).toLocaleDateString()}
                  </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${bias.direction === 'LONG' ? 'bg-app-success/10 text-app-success border border-app-success/20' : 'bg-app-danger/10 text-app-danger border border-app-danger/20'}`}>
                    {bias.direction}
              </span>
            </div>

            {bias.notes && (
              <div className="bg-app-bg/50 rounded-xl p-3 mb-4 flex-1">
                 <p className="text-app-text text-sm line-clamp-3 whitespace-pre-wrap leading-relaxed">{bias.notes}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2 mt-auto">
               {bias.chartLink && (
                  <a
                    href={bias.chartLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-app-card text-app-muted hover:text-white hover:bg-app-border transition"
                    title="Open Chart"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                <button
                  onClick={() => deleteBias(bias.id)}
                  className="p-2.5 rounded-xl bg-app-card text-app-muted hover:text-app-danger hover:bg-app-danger/10 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => onExecute(bias)}
                  className="flex-1 btn-secondary hover:bg-white hover:text-black py-2.5 text-sm flex justify-center items-center gap-2 group-hover:bg-app-primary group-hover:text-white transition-colors"
                >
                  {t.bias.execute} <ArrowRight size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-app-surface w-full max-w-md rounded-2xl border border-app-border shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-app-border bg-app-bg/50">
                <h3 className="text-white font-bold text-center">Plan New Trade</h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-app-muted text-xs font-semibold mb-1.5 ml-1">Pair / Asset</label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full input-field p-3"
                >
                  {favorites.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  {favorites.length === 0 && <option value="">No Favorites</option>}
                </select>
              </div>

              <div>
                <label className="block text-app-muted text-xs font-semibold mb-1.5 ml-1">Direction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDirection('LONG')}
                    className={`py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                      direction === 'LONG'
                        ? 'bg-app-success text-white shadow-lg shadow-green-500/20'
                        : 'bg-app-card text-app-muted border border-transparent'
                    }`}
                  >
                    LONG ↗
                  </button>
                  <button
                    onClick={() => setDirection('SHORT')}
                    className={`py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                      direction === 'SHORT'
                        ? 'bg-app-danger text-white shadow-lg shadow-red-500/20'
                        : 'bg-app-card text-app-muted border border-transparent'
                    }`}
                  >
                    SHORT ↘
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-app-muted text-xs font-semibold mb-1.5 ml-1">Chart URL (Optional)</label>
                <input
                  type="url"
                  value={chartLink}
                  onChange={(e) => setChartLink(e.target.value)}
                  placeholder="https://tradingview.com/..."
                  className="w-full input-field p-3 text-sm"
                />
              </div>

              <div>
                <label className="block text-app-muted text-xs font-semibold mb-1.5 ml-1">Analysis & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What is your thesis?"
                  rows={3}
                  className="w-full input-field p-3 text-sm resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 pt-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-3 rounded-xl bg-transparent border border-app-border text-app-muted hover:text-white hover:bg-app-card transition font-medium text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAdd}
                className="btn-primary py-3 text-sm"
              >
                {t.common.save} Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
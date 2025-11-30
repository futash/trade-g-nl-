
export type Direction = 'LONG' | 'SHORT';

export type TradeStatus = 'OPEN' | 'WON' | 'LOST' | 'BE' | 'PARTIAL';

export type Language = 'en' | 'tr' | 'es' | 'de' | 'fr' | 'pt' | 'ru' | 'zh' | 'ja';

export interface Account {
  id: string;
  name: string;
}

export interface Strategy {
  id: string;
  name: string;
}

export interface Bias {
  id: string;
  pair: string;
  direction: Direction;
  chartLink?: string;
  notes?: string;
  createdAt: number;
  isExecuted: boolean; // True if moved to Active Trades
}

export interface PartialTP {
  id: string;
  price: number;
  percentage: number; // e.g., 50 for 50%
  hit: boolean;
}

export interface Trade {
  id: string;
  biasId: string;
  accountId: string; // 'GENERAL' or specific Account ID
  strategyId?: string; // Optional strategy ID
  pair: string;
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  rValue: number; // The price distance equal to 1R (Standard Distance)
  riskMultiple?: number; // How many R risking? Default 1.0
  chartLink?: string;
  tps: PartialTP[];
  status: TradeStatus;
  finalR: number; // e.g., 2.5 or -1
  createdAt: number;
  closedAt?: number;
  notes?: string;
}

export interface AppState {
  favorites: string[];
  accounts: Account[];
  strategies: Strategy[];
  biases: Bias[];
  trades: Trade[];
  defaultRisk: number;
  language: Language;
  monthlyTargetR: number; // New: Monthly Target in R
  lastCelebratedMonth: string; // New: To track if we already celebrated this month (format "YYYY-MM")
}
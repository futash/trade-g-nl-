
export type Direction = 'LONG' | 'SHORT';

export type TradeStatus = 'OPEN' | 'WON' | 'LOST' | 'BE' | 'PARTIAL';

export interface Bias {
  id: string;
  pair: string;
  direction: Direction;
  chartLink?: string;
  notes?: string;
  createdAt: number;
  isExecuted: boolean; // True if moved to Active Trades
  aiAnalysis?: string;
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
  pair: string;
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  rValue: number; // The price distance equal to 1R
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
  biases: Bias[];
  trades: Trade[];
  defaultRisk: number;
}

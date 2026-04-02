export interface CEOMetric {
  id: string;
  title: string;
  value: string;
  trend: number; // Percentage -> 2.5 for +2.5%
  trendDirection: 'up' | 'down' | 'neutral';
  isPositiveTrend: boolean; // Indicates if this trend is good or bad (e.g. rising costs are bad)
  history: { date: string, value: number }[];
}

export interface SupplyChainNode {
  id: string;
  title: string;
  status: 'fluindo' | 'atencao' | 'gargalo';
  wip: number;
  wipLimit: number;
  avgTime: string;
  throughput: number;
}

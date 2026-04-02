export type ProjectStatus = 'Em Desenvolvimento' | 'Em Produção' | 'Concluído' | 'Cancelado';

export interface ProjectData {
  reference: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  productionDate: string | null;
  devTimeDays: number;
  revenueRealized: number;
  revenueProjected: number;
  marginPercent: number;
}

export interface MetricCardConfig {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

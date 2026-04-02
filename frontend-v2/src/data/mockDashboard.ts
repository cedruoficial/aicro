import type { ProjectData, MetricCardConfig } from '../types/dashboard';

export const METRICS_DATA: MetricCardConfig[] = [
  {
    title: "Projetos Ativos",
    value: "12",
    subtitle: "Atualmente em carteira",
    icon: "📈",
    trend: 'up',
    trendValue: "+2 neste mês"
  },
  {
    title: "Em Produção",
    value: "5",
    subtitle: "Itens faturando",
    icon: "🏭",
    trend: 'neutral',
  },
  {
    title: "Em Desenvolvimento",
    value: "7",
    subtitle: "Aguardando aprovações/testes",
    icon: "🔬",
    trend: 'up',
    trendValue: "+1 nesta semana"
  },
  {
    title: "Ticket Médio",
    value: "R$ 22.450",
    subtitle: "Retorno médio p/ projeto",
    icon: "💰",
    trend: 'up',
    trendValue: "+15% vs ano anterior"
  }
];

export const PROJECTS_DATA: ProjectData[] = [
  {
    reference: "DK-2026-012",
    client: "Dakota",
    status: "Em Desenvolvimento",
    startDate: "2026-03-01",
    productionDate: null,
    devTimeDays: 31,
    revenueRealized: 0,
    revenueProjected: 15500,
    marginPercent: 45
  },
  {
    reference: "BB-2026-005",
    client: "Bibi",
    status: "Em Produção",
    startDate: "2026-01-10",
    productionDate: "2026-02-20",
    devTimeDays: 41,
    revenueRealized: 25000,
    revenueProjected: 25000,
    marginPercent: 52
  },
  {
    reference: "PMP-2026-041",
    client: "Pampili",
    status: "Concluído",
    startDate: "2025-12-15",
    productionDate: "2026-01-10",
    devTimeDays: 26,
    revenueRealized: 18500,
    revenueProjected: 18500,
    marginPercent: 48
  },
  {
    reference: "AN-2026-018",
    client: "Aniger",
    status: "Em Desenvolvimento",
    startDate: "2026-03-20",
    productionDate: null,
    devTimeDays: 12,
    revenueRealized: 0,
    revenueProjected: 32000,
    marginPercent: 50
  },
  {
    reference: "PG-2026-009",
    client: "Pegada",
    status: "Cancelado",
    startDate: "2026-02-05",
    productionDate: null,
    devTimeDays: 15,
    revenueRealized: 0,
    revenueProjected: 12000,
    marginPercent: 0
  },
  {
    reference: "DASS-2026-001",
    client: "Dass",
    status: "Em Produção",
    startDate: "2026-01-05",
    productionDate: "2026-03-10",
    devTimeDays: 64,
    revenueRealized: 8500,
    revenueProjected: 45000,
    marginPercent: 42
  }
];

export const REVENUE_EVOLUTION = [
  { month: 'Nov', value: 35000 },
  { month: 'Dez', value: 42000 },
  { month: 'Jan', value: 55000 },
  { month: 'Fev', value: 48000 },
  { month: 'Mar', value: 62000 },
  { month: 'Abr', value: 28500 }, // Parcial
];

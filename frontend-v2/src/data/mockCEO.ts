import type { CEOMetric, SupplyChainNode } from '../types/ceo';

const sparklineDates = ['01', '05', '10', '15', '20', '25', '30'];

function generateSparkline(baseLine: number, variance: number) {
  return sparklineDates.map(date => ({
    date,
    value: Math.max(0, baseLine + (Math.random() * variance * 2 - variance))
  }));
}

export const CEO_METRICS: CEOMetric[] = [
  {
    id: 'oee',
    title: 'OEE Geral',
    value: '82.4%',
    trend: 1.2,
    trendDirection: 'down',
    isPositiveTrend: false,
    history: generateSparkline(85, 5)
  },
  {
    id: 'otif',
    title: 'OTIF',
    value: '94.2%',
    trend: 0.8,
    trendDirection: 'up',
    isPositiveTrend: true,
    history: generateSparkline(92, 4)
  },
  {
    id: 'leadTime',
    title: 'Lead Time Médio',
    value: '5.8 dias',
    trend: 12.5,
    trendDirection: 'down',
    isPositiveTrend: true,
    history: generateSparkline(6.5, 1)
  },
  {
    id: 'fpy',
    title: 'First Pass Yield',
    value: '88.9%',
    trend: 2.1,
    trendDirection: 'up',
    isPositiveTrend: true,
    history: generateSparkline(86, 3)
  },
  {
    id: 'copq',
    title: 'Custo da Não Qual.',
    value: 'R$ 14.5K',
    trend: 5.4,
    trendDirection: 'up',
    isPositiveTrend: false,
    history: generateSparkline(12, 4)
  },
  {
    id: 'rev',
    title: 'Faturamento vs Meta',
    value: '104%',
    trend: 4.0,
    trendDirection: 'up',
    isPositiveTrend: true,
    history: generateSparkline(98, 8)
  }
];

export const SUPPLY_CHAIN: SupplyChainNode[] = [
  { id: 'com', title: 'Comercial', status: 'fluindo', wip: 12, wipLimit: 20, avgTime: '1 dia', throughput: 15 },
  { id: 'pd', title: 'P&D', status: 'atencao', wip: 8, wipLimit: 10, avgTime: '4 dias', throughput: 5 },
  { id: 'art', title: 'Arte', status: 'fluindo', wip: 4, wipLimit: 15, avgTime: '0.5 dia', throughput: 18 },
  { id: 'lab', title: 'Lab. / Tinta', status: 'fluindo', wip: 6, wipLimit: 15, avgTime: '2 hrs', throughput: 22 },
  { id: 'pcp', title: 'PCP (Prod.)', status: 'gargalo', wip: 45, wipLimit: 25, avgTime: '2.5 dias', throughput: 8 },
  { id: 'ctia', title: 'Qualidade CTIA', status: 'fluindo', wip: 5, wipLimit: 10, avgTime: '4 hrs', throughput: 12 },
  { id: 'exp', title: 'Expedição', status: 'fluindo', wip: 3, wipLimit: 12, avgTime: '2 hrs', throughput: 15 },
];

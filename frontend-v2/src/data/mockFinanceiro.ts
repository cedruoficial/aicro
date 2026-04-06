export const FINANCIAL_METRICS = [
  {
    title: "Custo Oculto Mensal (WIP)",
    value: "R$ 42.5K",
    trend: "+5.2%",
    trendDirection: "up", // No contexto de custo oculto, up é ruim (vermelho)
    description: "Capital imobilizado em filas ou pausas."
  },
  {
    title: "Desperdício: Setup (Tempo)",
    value: "R$ 18.2K",
    trend: "-12%",
    trendDirection: "down", // down é bom (verde)
    description: "Custo das máquinas paradas na transição de pedidos."
  },
  {
    title: "Desperdício: Refações",
    value: "R$ 8.9K",
    trend: "+2.1%",
    trendDirection: "up",
    description: "Gastos com perda de material e re-trabalho (Qualidade)."
  },
  {
    title: "Lucro Potencial Salvo (Kaizen)",
    value: "R$ 11.4K",
    trend: "+15%",
    trendDirection: "up", // up é bom (verde)
    description: "Receita recuperada por otimização de PCP neste mês."
  }
];

export const SECTOR_EFFICIENCY = [
  { sector: "PCP (Planejamento)", manager: "João Souza", revenue: 0, cost: 18500, label: "Gargalo Crítico", efficiency: 45, action: "Travar liberação de novas ordens até escoar WIP.", projectedLoss: 4250, slaMetric: "SLA: 1h | Real: 12h", target: "Baixar fila de 45 para 15 itens em 3 dias." },
  { sector: "Impressão / Sakurai", manager: "Roberto Silva", revenue: 120000, cost: 22000, label: "Alta Performance", efficiency: 92, action: "Manter setup otimizado atual. Revisar cilindros.", projectedLoss: 0, slaMetric: "SLA: 4h | Real: 3.5h", target: "Manter OEE acima de 90% ao longo do mês." },
  { sector: "Corte", manager: "Ana Oliveira", revenue: 45000, cost: 16500, label: "Desgaste de Material", efficiency: 68, action: "Agendar afiação das facas. Padronizar encaixe.", projectedLoss: 1800, slaMetric: "SLA: 2h | Real: 3.5h", target: "Reduzir perda de refugo de 5% para 2% até sexta." },
  { sector: "Qualidade (CTIA)", manager: "Bruno Mendes", revenue: 0, cost: 9200, label: "Rigor Positivo", efficiency: 88, action: "Automatizar relatórios de Veslic para poupar tempo.", projectedLoss: 0, slaMetric: "SLA: 6h | Real: 5h", target: "Implementar scan barcode nos laboratórios." },
  { sector: "Expedição", manager: "Marcos Lima", revenue: 0, cost: 4800, label: "Estável", efficiency: 75, action: "Alinhar horários de coleta com a Jadlog.", projectedLoss: 400, slaMetric: "SLA: 8h | Real: 9h", target: "Evitar pernoite de carga pronta na doca." },
];


export const LOSSES_EVOLUTION = [
  { month: "Dez", setup: 22000, idle: 15000, rework: 7000 },
  { month: "Jan", setup: 25000, idle: 18000, rework: 8500 },
  { month: "Fev", setup: 21000, idle: 16000, rework: 9000 },
  { month: "Mar", setup: 19500, idle: 14500, rework: 7800 },
  { month: "Abr", setup: 18200, idle: 12000, rework: 8900 },
];

export const FINANCIAL_ALERTS = [
  {
    type: 'critical',
    sector: 'Serigrafia (Local)',
    message: 'Custo de mão de obra para setup manual está consumindo 35% da margem líquida dos pedidos de teste.',
    action: 'Avaliar automação ou lotes maiores.'
  },
  {
    type: 'warning',
    sector: 'Corte / Preparação',
    message: 'Nível de descarte de material subiu 4% e impactou em R$ 2.400 de perda de matéria-prima.',
    action: 'Revisar calibração de facas e moldes.'
  },
  {
    type: 'success',
    sector: 'Sublimação V.',
    message: 'Organização em fluxo contínuo reduziu custo de máquina parada em R$ 4.500 no último mês.',
    action: 'Replicar modelo 5S em Transfer Local.'
  }
];

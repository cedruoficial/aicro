export type ProductionStatus = 'Programado' | 'Em Preparação' | 'Em Produção' | 'Concluído' | 'Atrasado';

export interface ProductionOperation {
  id: string;
  description: string; // e.g. "03466 - VERDE GEODE TEAL 3ND NIKE BASE"
  screen: string; // e.g. "90", "77"
  inkNeeded: number; // Necessidade Prevista (kg)
  passesInfo: string; // e.g. "Monte 1 tom 2 passadas. Montes 2,3,4,5 e 6 com uma passada."
  impressions: number; // Folhas Impressas
}

export interface ProductionBlock {
  id: string;
  reference: string;
  client: string;
  product: string;
  machineId: string;
  programadoInicio: string; // ISO datetime ou formatavel
  programadoFim: string;
  status: ProductionStatus;
  progress: number;
  operations?: ProductionOperation[];
}

export interface Machine {
  id: string;
  name: string;
  type: 'Sakurai' | 'Atima';
  status: 'Online' | 'Offline' | 'Manutenção';
}

export interface PCPMetrics {
  totalDay: number;
  completedDay: number;
  avgSetupTime: number; // minutes
  efficiency: number; // %
  delayed: number;
  activeMachines: number;
}

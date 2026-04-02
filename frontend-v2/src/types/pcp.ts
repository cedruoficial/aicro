export type ProductionStatus = 'Programado' | 'Em Preparação' | 'Em Produção' | 'Concluído' | 'Atrasado';

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

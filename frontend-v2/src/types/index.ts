export type StatusType = 'ativo' | 'alerta' | 'critico';

export interface SubSector {
  name: string;
  icon: string;
  status: StatusType;
  tasks: number;
}

export interface Sector {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subSectors: SubSector[];
}

export type EventType = 'reprovado' | 'aprovado' | 'alerta' | 'info';
export type PriorityType = 'ALTA' | 'MÉDIA' | 'BAIXA';

export interface FeedEvent {
  id: number;
  time: string;
  type: EventType;
  sector: string;
  message: string;
  detail: string;
  notifyTo: string[];
  
  // Phase 4 Details
  responsibles?: string;
  whereToAct?: string;
  materialId?: string;
  problemType?: string;
  actionRequired?: string;
  deadline?: string;
  priority?: PriorityType;
}

export type DemandaStatus = 'pendente' | 'em_execucao' | 'finalizado' | 'atrasado';

export interface DemandaHistory {
  sectorId: string;
  entryTime: string;
  exitTime?: string;
  acceptedBy?: string;
  status: DemandaStatus;
}

export interface Demanda {
  id: string;
  cliente: string;
  projeto: string;
  tipo: 'Novo' | 'R&D';
  currentSector: string;
  status: DemandaStatus;
  createdAt: string;
  history: DemandaHistory[];
  slaHours: number;
}

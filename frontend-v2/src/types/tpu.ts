export type MachineType = 'Manual' | 'Rotativa';
export type JobPriority = 'Normal' | 'Urgente' | 'Atrasado';

export interface TPUOperator {
  id: string;
  name: string;
  avatar?: string;
}

export interface TPUJob {
  id: string;
  material: string;        // Ex: "Sublimação Alta Freq"
  reference: string;       // Ex: "PED-4022" ou "REF-99X"
  client: string;
  machineType: MachineType;
  machineName: string;     // Ex: "Boca 1", "Rotativa 3"
  operator: TPUOperator;
  quantityRequested: number;
  quantityProduced: number;
  priority: JobPriority;
  forecastEnd: string;     // ISO Date ou HH:mm
  status: 'Aguardando' | 'Em Produção' | 'Concluído' | 'Pausado';
  notes?: string;
}

export interface TPUGroupedMaterial {
  materialName: string;
  jobs: TPUJob[];
  totalRequested: number;
  totalProduced: number;
}

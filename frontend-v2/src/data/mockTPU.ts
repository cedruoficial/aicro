import type { TPUJob } from '../types/tpu';

export const MOCK_TPU_JOBS: TPUJob[] = [
  {
    id: 'tpu-1',
    material: 'Etiqueta PU Alta Freq',
    reference: 'REF-772A',
    client: 'Dakota',
    machineType: 'Manual',
    machineName: 'Prensa 01',
    operator: { id: 'op-1', name: 'Maria Silva' },
    quantityRequested: 5000,
    quantityProduced: 3200,
    priority: 'Normal',
    forecastEnd: '15:30',
    status: 'Em Produção'
  },
  {
    id: 'tpu-2',
    material: 'Etiqueta PU Alta Freq',
    reference: 'REF-772B',
    client: 'Dakota',
    machineType: 'Manual',
    machineName: 'Prensa 02',
    operator: { id: 'op-2', name: 'Joana Dark' },
    quantityRequested: 3000,
    quantityProduced: 2900,
    priority: 'Normal',
    forecastEnd: '14:00',
    status: 'Em Produção'
  },
  {
    id: 'tpu-3',
    material: 'Transfer Sublimático',
    reference: 'PED-9988',
    client: 'Vulcabras',
    machineType: 'Rotativa',
    machineName: 'Rotativa Alpha',
    operator: { id: 'op-3', name: 'Carlos Santos' },
    quantityRequested: 15000,
    quantityProduced: 4500,
    priority: 'Urgente',
    forecastEnd: '19:00',
    status: 'Em Produção',
    notes: 'Atenção na temperatura do rolo.'
  },
  {
    id: 'tpu-4',
    material: 'Transfer Sublimático',
    reference: 'PED-9989',
    client: 'Vulcabras',
    machineType: 'Rotativa',
    machineName: 'Rotativa Beta',
    operator: { id: 'op-4', name: 'Ana Costa' },
    quantityRequested: 8000,
    quantityProduced: 8000,
    priority: 'Normal',
    forecastEnd: '11:00',
    status: 'Concluído'
  },
  {
    id: 'tpu-5',
    material: 'Holográfico Star',
    reference: 'REF-001X',
    client: 'Bibi',
    machineType: 'Manual',
    machineName: 'Prensa 05',
    operator: { id: 'op-5', name: 'Lucia Lima' },
    quantityRequested: 1200,
    quantityProduced: 300,
    priority: 'Atrasado',
    forecastEnd: '12:00',
    status: 'Em Produção'
  },
  {
    id: 'tpu-6',
    material: 'Holográfico Star',
    reference: 'REF-002Y',
    client: 'Bibi',
    machineType: 'Rotativa',
    machineName: 'Rotativa Gama',
    operator: { id: 'op-6', name: 'Marcos Paulo' },
    quantityRequested: 22000,
    quantityProduced: 0,
    priority: 'Normal',
    forecastEnd: 'Amanhã 10:00',
    status: 'Aguardando'
  }
];

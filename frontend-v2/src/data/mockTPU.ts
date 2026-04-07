import type { TPUJob, MachineType, JobPriority } from '../types/tpu';

// Caching objects by dayOffset to keep them stable across renders
const mockCache: Record<number, TPUJob[]> = {};

export const getMockTpuJobs = (dayOffset: number): TPUJob[] => {
  if (mockCache[dayOffset]) return mockCache[dayOffset];

  const jobs: TPUJob[] = [];
  const operators = [
    { name: 'Maria Silva', shift: '1º Turno' },
    { name: 'Joana Dark', shift: '1º Turno' },
    { name: 'Carlos Santos', shift: '2º Turno' },
    { name: 'Ana Costa', shift: '2º Turno' },
    { name: 'Lucia Lima', shift: '3º Turno' },
    { name: 'Marcos Paulo', shift: '3º Turno' },
    { name: 'Fernanda Souza', shift: '1º Turno' },
    { name: 'Rafael Mendes', shift: '2º Turno' },
    { name: 'Bruna Alves', shift: '1º Turno' }
  ];
  
  const materials = ['TPU Flamengo', 'TPU Nike', 'TPU Adidas', 'TPU Puma', 'TPU Umbro'];
  const clients = ['Bibi', 'Dakota', 'Vulcabras', 'Grendene', 'Beira Rio'];

  let idCounter = 1;
  const isFuture = dayOffset > 0;
  const isPast = dayOffset < 0;

  for (let i = 1; i <= 35; i++) {
    const isRotativa = i % 5 === 0;
    const mType: MachineType = isRotativa ? 'Rotativa' : 'Frequência';
    const mName = isRotativa ? `Rotativa ${String(Math.ceil(i/5)).padStart(2, '0')}` : `Frequência ${String(i).padStart(2, '0')}`;
    const material = materials[(i + Math.abs(dayOffset)) % materials.length];
    const client = clients[(i + Math.abs(dayOffset)) % clients.length];
    
    // Status Logic
    let status: TPUJob['status'] = 'Aguardando';
    if (isPast) {
      status = 'Concluído'; // Past days are mostly done
      if (i % 8 === 0) status = 'Atrasado' as any; // keeping it simple, but wait 'Atrasado' is not a status. Statuses are: 'Aguardando' | 'Em Produção' | 'Concluído' | 'Pausado'
      status = i % 15 === 0 ? 'Pausado' : 'Concluído';
    } else if (isFuture) {
      status = 'Aguardando'; // Future is waiting
    } else {
      // Today
      const statuses = ['Concluído', 'Em Produção', 'Aguardando', 'Pausado'] as const;
      status = statuses[i % statuses.length];
    }
    
    // Priority Logic
    let priority: JobPriority = 'Normal';
    if (i % 7 === 0) priority = 'Urgente';
    if (i % 11 === 0 && !isFuture) priority = 'Atrasado';

    // Quantity Logic
    const qtyReq = 1000 + (idCounter * 500) + (Math.abs(dayOffset) * 200);
    let qtyProd = 0;
    
    if (status === 'Concluído') {
      qtyProd = qtyReq;
    } else if (status === 'Em Produção') {
      qtyProd = Math.floor(qtyReq * ((idCounter % 9) / 10 + 0.1));
    }

    const operatorData = operators[i % operators.length];

    jobs.push({
      id: `tpu-day${dayOffset}-${idCounter}`,
      material,
      reference: `REF-${2000 + idCounter + Math.abs(dayOffset * 10)}`,
      client,
      machineType: mType,
      machineName: mName,
      operator: { id: `op-${i % operators.length}`, name: operatorData.name, shift: operatorData.shift },
      quantityRequested: qtyReq,
      quantityProduced: qtyProd,
      priority,
      forecastEnd: `${String(10 + (i % 8)).padStart(2, '0')}:${String((i * 15) % 60).padStart(2, '0')}`,
      status,
      notes: i % 8 === 0 ? 'Verificar nível da matriz.' : undefined
    });
    idCounter++;
  }

  // Adding a few more items to the same material to test grouping
  for (let i = 1; i <= 10; i++) {
    const material = materials[0]; // TPU Flamengo
    
    let status: TPUJob['status'] = isFuture ? 'Aguardando' : isPast ? 'Concluído' : 'Em Produção';
    let qtyReq = 5000;
    let qtyProd = status === 'Concluído' ? qtyReq : status === 'Em Produção' ? 2500 : 0;

    const opData = operators[0];

    jobs.push({
      id: `tpu-day${dayOffset}-${idCounter}`,
      material,
      reference: `REF-${3000 + idCounter + Math.abs(dayOffset * 10)}`,
      client: 'Flamengo Oficial',
      machineType: 'Frequência',
      machineName: `Frequência ${String(30 + i).padStart(2, '0')}`,
      operator: { id: `op-1`, name: opData.name, shift: opData.shift },
      quantityRequested: qtyReq,
      quantityProduced: qtyProd,
      priority: 'Urgente',
      forecastEnd: '16:00',
      status: status
    });
    idCounter++;
  }

  mockCache[dayOffset] = jobs;
  return jobs;
};

// Fallback just in case some other file is trying to import this directly
export const MOCK_TPU_JOBS: TPUJob[] = getMockTpuJobs(0);

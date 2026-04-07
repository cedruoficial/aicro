import type { TPUJob, MachineType, JobPriority } from '../types/tpu';

const generateMockData = (): TPUJob[] => {
  const jobs: TPUJob[] = [];
  const operators = ['Maria Silva', 'Joana Dark', 'Carlos Santos', 'Ana Costa', 'Lucia Lima', 'Marcos Paulo', 'Fernanda Souza', 'Rafael Mendes', 'Bruna Alves'];
  const materials = ['TPU Flamengo', 'TPU Nike', 'TPU Adidas', 'TPU Puma', 'TPU Umbro'];
  const clients = ['Bibi', 'Dakota', 'Vulcabras', 'Grendene', 'Beira Rio'];

  let idCounter = 1;

  for (let i = 1; i <= 35; i++) {
    const isRotativa = i % 5 === 0;
    const mType: MachineType = isRotativa ? 'Rotativa' : 'Frequência';
    const mName = isRotativa ? `Rotativa ${String(Math.ceil(i/5)).padStart(2, '0')}` : `Frequência ${String(i).padStart(2, '0')}`;
    const material = materials[i % materials.length];
    const client = clients[i % clients.length];
    
    // Aleatórios para status
    const statuses = ['Concluído', 'Em Produção', 'Aguardando', 'Pausado'] as const;
    const status = statuses[i % statuses.length];
    
    // Aleatórios para prioridade
    let priority: JobPriority = 'Normal';
    if (i % 7 === 0) priority = 'Urgente';
    if (i % 11 === 0) priority = 'Atrasado';

    const qtyReq = 1000 + (idCounter * 500);
    let qtyProd = 0;
    if (status === 'Concluído') qtyProd = qtyReq;
    else if (status === 'Em Produção') qtyProd = Math.floor(qtyReq * ((idCounter % 9) / 10 + 0.1));

    jobs.push({
      id: `tpu-${idCounter}`,
      material,
      reference: `REF-${2000 + idCounter}`,
      client,
      machineType: mType,
      machineName: mName,
      operator: { id: `op-${i % operators.length}`, name: operators[i % operators.length] },
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
    jobs.push({
      id: `tpu-${idCounter}`,
      material,
      reference: `REF-${3000 + idCounter}`,
      client: 'Flamengo Oficial',
      machineType: 'Frequência',
      machineName: `Frequência ${String(30 + i).padStart(2, '0')}`,
      operator: { id: `op-1`, name: operators[0] },
      quantityRequested: 5000,
      quantityProduced: 2500,
      priority: 'Urgente',
      forecastEnd: '16:00',
      status: 'Em Produção'
    });
    idCounter++;
  }

  return jobs;
};

export const MOCK_TPU_JOBS: TPUJob[] = generateMockData();

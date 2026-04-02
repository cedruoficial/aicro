import type { ProductionBlock, Machine, PCPMetrics } from '../types/pcp';

// ─── Máquinas (12 Sakurai + 5 Atima) ─────────────────────────────────────────
export const MACHINES: Machine[] = [
  // SAKURAI
  { id: 'sak01', name: 'Sakurai 01', type: 'Sakurai', status: 'Online' },
  { id: 'sak02', name: 'Sakurai 02', type: 'Sakurai', status: 'Online' },
  { id: 'sak03', name: 'Sakurai 03', type: 'Sakurai', status: 'Online' },
  { id: 'sak04', name: 'Sakurai 04', type: 'Sakurai', status: 'Online' },
  { id: 'sak05', name: 'Sakurai 05', type: 'Sakurai', status: 'Manutenção' },
  { id: 'sak06', name: 'Sakurai 06', type: 'Sakurai', status: 'Online' },
  { id: 'sak07', name: 'Sakurai 07', type: 'Sakurai', status: 'Online' },
  { id: 'sak08', name: 'Sakurai 08', type: 'Sakurai', status: 'Online' },
  { id: 'sak09', name: 'Sakurai 09', type: 'Sakurai', status: 'Offline' },
  { id: 'sak10', name: 'Sakurai 10', type: 'Sakurai', status: 'Online' },
  { id: 'sak11', name: 'Sakurai 11', type: 'Sakurai', status: 'Online' },
  { id: 'sak12', name: 'Sakurai 12', type: 'Sakurai', status: 'Online' },
  // ATIMA
  { id: 'atm01', name: 'Atima 01', type: 'Atima', status: 'Online' },
  { id: 'atm02', name: 'Atima 02', type: 'Atima', status: 'Online' },
  { id: 'atm03', name: 'Atima 03', type: 'Atima', status: 'Online' },
  { id: 'atm04', name: 'Atima 04', type: 'Atima', status: 'Manutenção' },
  { id: 'atm05', name: 'Atima 05', type: 'Atima', status: 'Online' },
];

export const PRODUCTION_METRICS: PCPMetrics = {
  totalDay: 34,
  completedDay: 14,
  avgSetupTime: 22,
  efficiency: 88,
  delayed: 3,
  activeMachines: 14,
};

// ─── Helper: gera blocos para uma data específica ─────────────────────────────
function d(dateStr: string, h: number, m = 0) {
  return `${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
}

const CLIENTS = ['Aniger', 'Dakota', 'Bibi', 'Vulcabras', 'Dass', 'Pegada', 'Pampili', 'Olympikus'];
const PRODUCTS = [
  'Transfer TX-45 (Verde)',
  'Sublimação Premium',
  'Etiqueta PU Alta Freq',
  'Transfer Refletivo T2',
  'Holográfico Star',
  'Sola Vulcanizada 2C',
  'Bally Test Mix',
  'Verniz UV Localizado',
  'Stamping Metálico',
  'Film Matte Clamshell',
];

let _blockId = 0;
function makeBlock(
  date: string,
  machineId: string,
  hStart: number,
  hEnd: number,
  status: ProductionBlock['status'],
  refNum: number,
  progress = 0
): ProductionBlock {
  const cl = CLIENTS[(refNum + parseInt(machineId.slice(-2), 10)) % CLIENTS.length];
  const pr = PRODUCTS[(refNum * 3 + parseInt(machineId.slice(-2), 10)) % PRODUCTS.length];
  return {
    id: `blk-${++_blockId}`,
    reference: `PED-2026-${String(refNum).padStart(4, '0')}`,
    client: cl,
    product: pr,
    machineId,
    programadoInicio: d(date, hStart),
    programadoFim: d(date, hEnd),
    status,
    progress,
  };
}

// ─── Gera programação para N dias ─────────────────────────────────────────────
function generateDayBlocks(date: string, isToday: boolean, isPast: boolean): ProductionBlock[] {
  const blocks: ProductionBlock[] = [];
  const slots = [
    [7, 10], [10, 12], [12, 14], [14, 16], [16, 18], [18, 20],
  ] as [number, number][];

  MACHINES.forEach((machine, mi) => {
    if (machine.status === 'Offline') return;
    const machineSlots = slots.slice(0, machine.status === 'Manutenção' ? 2 : 5);

    machineSlots.forEach(([hs, he], si) => {
      const refNum = 400 + mi * 7 + si + (isPast ? 0 : isToday ? 50 : 100);
      let status: ProductionBlock['status'] = 'Programado';
      let progress = 0;

      if (isPast) {
        status = si < 3 ? 'Concluído' : (Math.random() > 0.8 ? 'Atrasado' : 'Concluído');
        progress = 100;
      } else if (isToday) {
        const nowH = new Date().getHours();
        if (hs < nowH - 1) { status = 'Concluído'; progress = 100; }
        else if (hs <= nowH) { status = Math.random() > 0.2 ? 'Em Produção' : 'Em Preparação'; progress = Math.floor(Math.random() * 70) + 10; }
        else { status = 'Programado'; progress = 0; }
      }

      blocks.push(makeBlock(date, machine.id, hs, he, status, refNum, progress));
    });
  });

  return blocks;
}

// ─── Pool de datas (7 dias anteriores + hoje + 7 próximos) ───────────────────
function offsetDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export const ALL_PRODUCTION_BLOCKS: Record<string, ProductionBlock[]> = {};

for (let i = -7; i <= 7; i++) {
  const dt = offsetDate(i);
  ALL_PRODUCTION_BLOCKS[dt] = generateDayBlocks(dt, i === 0, i < 0);
}

// Blocos do dia atual para compatibilidade
export const PRODUCTION_BLOCKS: ProductionBlock[] = ALL_PRODUCTION_BLOCKS[offsetDate(0)] || [];

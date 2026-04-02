import { useState } from 'react';
import {
  BarChart2, Clock, CheckCircle, AlertTriangle,
  TrendingUp, TrendingDown, Layers, Zap,
  Filter, Download, RefreshCw, ArrowRight
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type Periodo = '7d' | '30d' | '90d';

// ─── Dados mockados (virão do backend) ─────────────────────────────────────────

// Lead time médio em horas por setor
const LEAD_TIME_SETORES = [
  { setor: 'Comercial',      avg: 0.5,  meta: 1,   color: '#00CEC9' },
  { setor: 'Arte',           avg: 4.2,  meta: 4,   color: '#9B59B6' },
  { setor: 'Lab. Cores',     avg: 2.1,  meta: 2,   color: '#E17055' },
  { setor: 'PCP',            avg: 1.3,  meta: 1.5, color: '#0984E3' },
  { setor: 'Corte',          avg: 3.8,  meta: 3,   color: '#00B894' },
  { setor: 'Impressão',      avg: 6.4,  meta: 5,   color: '#6C5CE7' },
  { setor: 'Revisão',        avg: 1.2,  meta: 2,   color: '#FDCB6E' },
  { setor: 'Embalagem',      avg: 0.8,  meta: 1,   color: '#FD79A8' },
  { setor: 'Qualidade',      avg: 2.5,  meta: 2,   color: '#D63031' },
  { setor: 'Expedição',      avg: 0.6,  meta: 1,   color: '#55EFC4' },
];

// Impedimentos por motivo
const IMPEDIMENTOS = [
  { id: 'I001', setor: 'Impressão',  subSetor: 'Impressão / Sakurai', motivo: 'Máquina parada / falha',     detalhe: 'Sakurai parou no meio do lote PED-0445. Aguardando técnico.', hora: '09:14', data: 'Hoje' },
  { id: 'I002', setor: 'Corte',      subSetor: 'Corte',               motivo: 'Falta de material',          detalhe: 'Acabou bobina de TPU 1.2mm.', hora: '10:42', data: 'Hoje' },
  { id: 'I003', setor: 'Lab. Cores', subSetor: 'Lab. Cores',          motivo: 'Aguardando aprovação',       detalhe: 'Aguardando OK do cliente na amostra de cor ref. AZ-12.', hora: '08:30', data: 'Hoje' },
  { id: 'I004', setor: 'Impressão',  subSetor: 'Impressão / Atima',   motivo: 'Retrabalho necessário',      detalhe: 'Registro desalinhado no PED-0391. Relaminando.', hora: '14:10', data: 'Ontem' },
  { id: 'I005', setor: 'Qualidade',  subSetor: 'CTIA',                motivo: 'Problema de qualidade',      detalhe: '', hora: '11:05', data: 'Ontem' },
  { id: 'I006', setor: 'PCP',        subSetor: 'PCP',                 motivo: 'Mão de obra insuficiente',   detalhe: 'Diego ausente — máquina Atima sem operador.', hora: '07:45', data: 'Ontem' },
];

// Pedidos concluídos recentes
const CONCLUIDOS = [
  { ref: 'PED-0430', cliente: 'Ramarim', produto: 'Silk UV Prata',     setores: 7, leadTotal: '18h 22m', sla: 24, dentroSla: true,  data: 'Hoje 08:15' },
  { ref: 'PED-0425', cliente: 'Beira Rio', produto: 'Transfer Digital', setores: 9, leadTotal: '31h 05m', sla: 24, dentroSla: false, data: 'Ontem 15:40' },
  { ref: 'PED-0418', cliente: 'Grendene', produto: 'Sublimação Plus',   setores: 6, leadTotal: '11h 48m', sla: 12, dentroSla: true,  data: 'Ontem 11:20' },
  { ref: 'PED-0410', cliente: 'Aniger',   produto: 'TPU Neon',          setores: 8, leadTotal: '22h 10m', sla: 24, dentroSla: true,  data: '01/04 18:00' },
  { ref: 'PED-0405', cliente: 'Dakota',   produto: 'Couro Sintético',   setores: 7, leadTotal: '28h 40m', sla: 24, dentroSla: false, data: '01/04 09:30' },
];

// Pedidos por status atual
const STATUS_DIST = [
  { status: 'Em Execução', qtd: 12, color: '#00B894' },
  { status: 'Na Fila',     qtd: 8,  color: '#E17055' },
  { status: 'Bloqueados',  qtd: 4,  color: '#8B8BA0' },
  { status: 'Atrasados',   qtd: 3,  color: '#FF4757' },
  { status: 'Concluídos',  qtd: 27, color: '#6C5CE7' },
];
const TOTAL_PEDIDOS = STATUS_DIST.reduce((s, x) => s + x.qtd, 0);

// Throughput diário (últimos 7 dias)
const THROUGHPUT = [
  { dia: 'Sex', qtd: 8 },
  { dia: 'Sáb', qtd: 3 },
  { dia: 'Dom', qtd: 0 },
  { dia: 'Seg', qtd: 11 },
  { dia: 'Ter', qtd: 9 },
  { dia: 'Qua', qtd: 7 },
  { dia: 'Hoje', qtd: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctSla(setores: typeof LEAD_TIME_SETORES) {
  return setores.filter(s => s.avg <= s.meta).length;
}

// ─── Mini donut SVG ──────────────────────────────────────────────────────────
function MiniDonut({ data }: { data: { qtd: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.qtd, 0);
  let offset = 0;
  const r = 40; const circ = 2 * Math.PI * r;
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      {data.map((d, i) => {
        const pct = d.qtd / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const rotate = (offset / total) * 360 - 90;
        offset += d.qtd;
        return (
          <circle key={i} cx={50} cy={50} r={r} fill="none"
            stroke={d.color} strokeWidth={18}
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rotate} 50 50)`}
          />
        );
      })}
      <circle cx={50} cy={50} r={31} fill="white" />
    </svg>
  );
}

// ─── Barra de throughput ──────────────────────────────────────────────────────
function ThroughputChart() {
  const max = Math.max(...THROUGHPUT.map(d => d.qtd), 1);
  return (
    <div className="flex items-end gap-2 h-28">
      {THROUGHPUT.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] font-black" style={{ color: d.dia === 'Hoje' ? '#6C5CE7' : '#A0A0B0' }}>
            {d.qtd > 0 ? d.qtd : '—'}
          </div>
          <div className="w-full rounded-t-lg transition-all duration-700 relative overflow-hidden"
            style={{
              height: `${Math.max((d.qtd / max) * 80, d.qtd === 0 ? 4 : 8)}px`,
              background: d.dia === 'Hoje'
                ? 'linear-gradient(180deg,#6C5CE7,#9B8FF7)'
                : d.qtd === 0
                ? '#F0F0F5'
                : 'linear-gradient(180deg,#A0A0C0,#D0D0E0)',
            }}
          />
          <div className="text-[9px] font-bold" style={{ color: d.dia === 'Hoje' ? '#6C5CE7' : '#C0C0D0' }}>
            {d.dia}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Barra de lead time ───────────────────────────────────────────────────────
function LeadTimeBars() {
  const max = Math.max(...LEAD_TIME_SETORES.map(s => Math.max(s.avg, s.meta)));
  return (
    <div className="space-y-3">
      {LEAD_TIME_SETORES.map(s => {
        const over = s.avg > s.meta;
        const pctAvg  = (s.avg  / max) * 100;
        const pctMeta = (s.meta / max) * 100;
        return (
          <div key={s.setor} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] font-bold text-[#6B6B80]">{s.setor}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black" style={{ color: over ? '#FF4757' : '#00B894' }}>
                  {s.avg}h {over ? '▲' : '▼'}
                </span>
                <span className="text-[9px] text-[#C0C0D0] font-bold">meta {s.meta}h</span>
              </div>
            </div>
            <div className="relative h-3 bg-[#F0F0F5] rounded-full overflow-visible">
              {/* Barra real */}
              <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{ width: `${pctAvg}%`, background: over ? '#FF4757' : s.color, opacity: 0.85 }} />
              {/* Linha de meta */}
              <div className="absolute top-[-3px] h-[18px] w-[2px] bg-[#2D2D3A] rounded-full"
                style={{ left: `${pctMeta}%` }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F0F0F5]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#00B894]" />
          <span className="text-[9px] text-[#A0A0B0] font-bold">Dentro da meta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF4757]" />
          <span className="text-[9px] text-[#A0A0B0] font-bold">Acima da meta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[2px] h-3 bg-[#2D2D3A]" />
          <span className="text-[9px] text-[#A0A0B0] font-bold">Linha de meta</span>
        </div>
      </div>
    </div>
  );
}

// ─── Badge de motivo de impedimento ──────────────────────────────────────────
const MOTIVO_COLORS: Record<string, string> = {
  'Máquina parada / falha':    '#FF4757',
  'Falta de material':         '#E17055',
  'Aguardando aprovação':      '#FDCB6E',
  'Mão de obra insuficiente':  '#9B59B6',
  'Problema de qualidade':     '#D63031',
  'Retrabalho necessário':     '#0984E3',
  'Energia / utilidades':      '#FD79A8',
  'Outro (descreva abaixo)':   '#A0A0B0',
};

// ─── Página de Relatórios ─────────────────────────────────────────────────────
type RelaTab = 'visao' | 'leadtime' | 'impedimentos' | 'historico';

export function Relatorios() {
  const [periodo, setPeriodo]     = useState<Periodo>('30d');
  const [tab, setTab]             = useState<RelaTab>('visao');
  const [filtroImp, setFiltroImp] = useState('Todos');

  const slaOk    = pctSla(LEAD_TIME_SETORES);
  const slaPct   = Math.round((slaOk / LEAD_TIME_SETORES.length) * 100);
  const concPct  = Math.round((CONCLUIDOS.filter(c => c.dentroSla).length / CONCLUIDOS.length) * 100);
  const setoresImp = ['Todos', ...Array.from(new Set(IMPEDIMENTOS.map(i => i.setor)))];

  const impFiltrados = filtroImp === 'Todos'
    ? IMPEDIMENTOS
    : IMPEDIMENTOS.filter(i => i.setor === filtroImp);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] mb-1">INTELIGÊNCIA OPERACIONAL</div>
          <h1 className="text-2xl font-black text-[#2D2D3A] tracking-tight m-0">Relatórios</h1>
          <p className="text-[#8B8BA0] text-sm font-medium mt-0.5">Análise do fluxo produtivo · Lead time · SLA · Impedimentos</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          <div className="flex bg-white border border-[#E8E6F0] rounded-xl p-1 gap-1">
            {([['7d','7 dias'],['30d','30 dias'],['90d','90 dias']] as [Periodo,string][]).map(([p, l]) => (
              <button key={p} onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  periodo === p ? 'text-white' : 'text-[#8B8BA0] hover:text-[#2D2D3A]'
                }`}
                style={periodo === p ? { background: 'linear-gradient(135deg,#6C5CE7,#5A4BCE)' } : {}}>
                {l}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E8E6F0] rounded-xl text-xs font-black text-[#8B8BA0] hover:text-[#2D2D3A] transition-all">
            <Download size={13} /> Exportar
          </button>
          <button className="p-2 bg-white border border-[#E8E6F0] rounded-xl text-[#A0A0B0] hover:text-[#6C5CE7] transition-all">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPIs Macro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: 'Pedidos Ativos', val: '27',
            sub: `${STATUS_DIST.find(s=>s.status==='Atrasados')?.qtd ?? 0} atrasados`,
            color: '#6C5CE7', icon: <Layers size={18} />,
            trend: '+3 vs semana passada', up: true,
          },
          {
            label: 'Lead Time Médio', val: '3.4h',
            sub: 'por setor no fluxo',
            color: '#0984E3', icon: <Clock size={18} />,
            trend: '-0.8h vs mês anterior', up: true,
          },
          {
            label: 'SLA Compliance', val: `${concPct}%`,
            sub: `${CONCLUIDOS.filter(c=>c.dentroSla).length}/${CONCLUIDOS.length} pedidos no prazo`,
            color: concPct >= 80 ? '#00B894' : '#FF4757', icon: <CheckCircle size={18} />,
            trend: concPct >= 80 ? 'Dentro do alvo' : 'Abaixo do alvo de 80%', up: concPct >= 80,
          },
          {
            label: 'Impedimentos Ativos', val: `${IMPEDIMENTOS.filter(i=>i.data==='Hoje').length}`,
            sub: 'abertos hoje',
            color: '#FF4757', icon: <AlertTriangle size={18} />,
            trend: `${IMPEDIMENTOS.length} total no período`, up: false,
          },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E8E6F0] p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 p-2 rounded-xl" style={{ background: `${k.color}15` }}>
              <div style={{ color: k.color }}>{k.icon}</div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#A0A0B0] mb-1">{k.label}</div>
            <div className="text-3xl font-black text-[#2D2D3A] mb-1" style={{ letterSpacing: '-1px' }}>{k.val}</div>
            <div className="text-[10px] text-[#A0A0B0] font-medium mb-2">{k.sub}</div>
            <div className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
              k.up ? 'bg-[#EEFAF5] text-[#00B894]' : 'bg-[#FFF0F0] text-[#FF4757]'
            }`}>
              {k.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {k.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E8E6F0] pb-4 flex-wrap">
        {([
          { key: 'visao',         icon: <BarChart2 size={14} />,     label: 'Visão Geral' },
          { key: 'leadtime',      icon: <Clock size={14} />,         label: 'Lead Time por Setor' },
          { key: 'impedimentos',  icon: <AlertTriangle size={14} />, label: `Impedimentos (${IMPEDIMENTOS.length})` },
          { key: 'historico',     icon: <CheckCircle size={14} />,   label: 'Histórico de Pedidos' },
        ] as { key: RelaTab; icon: React.ReactNode; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === t.key ? 'text-white shadow-md' : 'bg-white text-[#8B8BA0] border border-[#E8E6F0] hover:border-[#C0C0D0]'
            }`}
            style={tab === t.key ? { background: 'linear-gradient(135deg, #6C5CE7, #5A4BCE)' } : {}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════ VISÃO GERAL ════════ */}
      {tab === 'visao' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Distribuição de pedidos + donut */}
          <div className="bg-white rounded-2xl border border-[#E8E6F0] p-6">
            <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest mb-4">Distribuição de Pedidos</h3>
            <div className="flex items-center gap-4 mb-5">
              <MiniDonut data={STATUS_DIST} />
              <div className="space-y-1.5">
                {STATUS_DIST.map(s => (
                  <div key={s.status} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[11px] text-[#6B6B80] flex-1">{s.status}</span>
                    <span className="text-[11px] font-black text-[#2D2D3A]">{s.qtd}</span>
                    <span className="text-[9px] text-[#C0C0D0] font-bold w-8 text-right">
                      {Math.round(s.qtd / TOTAL_PEDIDOS * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#F8F7FC] rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-[#6C5CE7]">{TOTAL_PEDIDOS}</div>
              <div className="text-[9px] text-[#A0A0B0] font-bold uppercase tracking-wider">Pedidos no sistema</div>
            </div>
          </div>

          {/* Throughput */}
          <div className="bg-white rounded-2xl border border-[#E8E6F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Throughput Diário</h3>
              <span className="text-[9px] font-bold text-[#A0A0B0] bg-[#F4F3F8] px-2 py-1 rounded-lg">Pedidos concluídos/dia</span>
            </div>
            <ThroughputChart />
            <div className="mt-4 pt-4 border-t border-[#F0F0F5] grid grid-cols-2 gap-3">
              <div className="text-center bg-[#F8F7FC] rounded-xl p-3">
                <div className="text-lg font-black text-[#6C5CE7]">
                  {Math.round(THROUGHPUT.filter(d=>d.qtd>0).reduce((s,d)=>s+d.qtd,0) / THROUGHPUT.filter(d=>d.qtd>0).length * 10) / 10}
                </div>
                <div className="text-[8px] text-[#A0A0B0] font-bold uppercase mt-0.5">Média/dia</div>
              </div>
              <div className="text-center bg-[#F8F7FC] rounded-xl p-3">
                <div className="text-lg font-black text-[#00B894]">{THROUGHPUT.reduce((s,d)=>s+d.qtd,0)}</div>
                <div className="text-[8px] text-[#A0A0B0] font-bold uppercase mt-0.5">Total 7 dias</div>
              </div>
            </div>
          </div>

          {/* SLA por setor — semáforo rápido */}
          <div className="bg-white rounded-2xl border border-[#E8E6F0] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">SLA por Setor</h3>
              <span className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: slaPct >= 70 ? '#EEFAF5' : '#FFF0F0', color: slaPct >= 70 ? '#00B894' : '#FF4757' }}>
                {slaOk}/{LEAD_TIME_SETORES.length} OK
              </span>
            </div>
            <div className="space-y-2">
              {LEAD_TIME_SETORES.map(s => {
                const ok = s.avg <= s.meta;
                const pct = Math.min((s.avg / s.meta) * 100, 150);
                return (
                  <div key={s.setor} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-[#00B894]' : 'bg-[#FF4757]'}`} />
                    <div className="text-[10px] font-bold text-[#6B6B80] w-20 shrink-0">{s.setor}</div>
                    <div className="flex-1 h-1.5 bg-[#F0F0F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: ok ? s.color : '#FF4757' }} />
                    </div>
                    <div className="text-[9px] font-black w-12 text-right shrink-0"
                      style={{ color: ok ? '#00B894' : '#FF4757' }}>{s.avg}h</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════ LEAD TIME POR SETOR ════════ */}
      {tab === 'leadtime' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E8E6F0] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Lead Time Médio por Setor</h3>
                <p className="text-[10px] text-[#A0A0B0] font-medium mt-0.5">Linha vertical preta = meta de SLA do setor</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[#FF4757] bg-[#FFF0F0] px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingUp size={9} />
                  {LEAD_TIME_SETORES.filter(s => s.avg > s.meta).length} acima da meta
                </span>
              </div>
            </div>
            <LeadTimeBars />
          </div>

          {/* Ranking de gargalos */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#FF475720] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-[#FF4757]" />
                <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Gargalos Identificados</h3>
              </div>
              <div className="space-y-3">
                {LEAD_TIME_SETORES
                  .filter(s => s.avg > s.meta)
                  .sort((a, b) => (b.avg - b.meta) - (a.avg - a.meta))
                  .map(s => (
                    <div key={s.setor} className="flex items-center gap-3 p-3 bg-[#FFF8F8] rounded-xl border border-[#FF475715]">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}20` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-[#2D2D3A]">{s.setor}</div>
                        <div className="text-[9px] text-[#FF4757] font-bold">
                          +{Math.round((s.avg - s.meta) * 10) / 10}h acima da meta
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-[#FF4757]">{s.avg}h</div>
                        <div className="text-[8px] text-[#A0A0B0]">meta {s.meta}h</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#00B89420] p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={14} className="text-[#00B894]" />
                <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Dentro da Meta</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {LEAD_TIME_SETORES.filter(s => s.avg <= s.meta).map(s => (
                  <div key={s.setor} className="flex items-center gap-1.5 bg-[#EEFAF5] px-3 py-1.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00B894]" />
                    <span className="text-[10px] font-bold text-[#00B894]">{s.setor}</span>
                    <span className="text-[9px] text-[#52C89C]">{s.avg}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ IMPEDIMENTOS ════════ */}
      {tab === 'impedimentos' && (
        <div className="space-y-4">
          {/* Filtro por setor */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={13} className="text-[#A0A0B0]" />
            {setoresImp.map(s => (
              <button key={s} onClick={() => setFiltroImp(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  filtroImp === s ? 'text-white border-transparent' : 'bg-white text-[#8B8BA0] border-[#E8E6F0]'
                }`}
                style={filtroImp === s ? { background: '#6C5CE7' } : {}}>
                {s}
              </button>
            ))}
          </div>

          {/* Resumo por motivo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(
              IMPEDIMENTOS.reduce<Record<string, number>>((acc, i) => {
                acc[i.motivo] = (acc[i.motivo] ?? 0) + 1;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([motivo, count]) => (
              <div key={motivo} className="bg-white rounded-2xl border border-[#E8E6F0] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: MOTIVO_COLORS[motivo] ?? '#A0A0B0' }} />
                  <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider truncate">{motivo}</div>
                </div>
                <div className="text-2xl font-black" style={{ color: MOTIVO_COLORS[motivo] ?? '#A0A0B0' }}>
                  {count}×
                </div>
                <div className="text-[9px] text-[#C0C0D0] font-bold">no período</div>
              </div>
            ))}
          </div>

          {/* Lista de impedimentos */}
          <div className="bg-white rounded-2xl border border-[#E8E6F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0F0F5] flex items-center justify-between">
              <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">
                Registro de Impedimentos ({impFiltrados.length})
              </h3>
            </div>
            <div className="divide-y divide-[#F8F7FC]">
              {impFiltrados.map(imp => (
                <div key={imp.id} className="px-6 py-4 hover:bg-[#F8F7FC] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${MOTIVO_COLORS[imp.motivo] ?? '#A0A0B0'}20` }}>
                        <AlertTriangle size={14} style={{ color: MOTIVO_COLORS[imp.motivo] ?? '#A0A0B0' }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-black text-[#2D2D3A]">{imp.motivo}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${MOTIVO_COLORS[imp.motivo] ?? '#A0A0B0'}15`, color: MOTIVO_COLORS[imp.motivo] ?? '#A0A0B0' }}>
                          {imp.subSetor}
                        </span>
                      </div>
                      {imp.detalhe && (
                        <div className="text-[11px] text-[#8B8BA0] mb-1">{imp.detalhe}</div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-[#C0C0D0] font-bold">{imp.data} · {imp.hora}</span>
                        <span className="text-[9px] font-bold text-[#A0A0B0] flex items-center gap-1">
                          <ArrowRight size={8} /> {imp.setor}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full"
                        style={imp.data === 'Hoje'
                          ? { background: '#FFF0F0', color: '#FF4757' }
                          : { background: '#F4F3F8', color: '#A0A0B0' }}>
                        {imp.data}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {impFiltrados.length === 0 && (
                <div className="px-6 py-12 text-center text-[#C0C0D0] font-bold text-sm">
                  Nenhum impedimento registrado para este setor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════ HISTÓRICO DE PEDIDOS ════════ */}
      {tab === 'historico' && (
        <div className="space-y-4">
          {/* KPIs de histórico */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Concluídos', val: CONCLUIDOS.length, color: '#6C5CE7' },
              { label: 'No Prazo',   val: CONCLUIDOS.filter(c => c.dentroSla).length, color: '#00B894' },
              { label: 'Fora do SLA', val: CONCLUIDOS.filter(c => !c.dentroSla).length, color: '#FF4757' },
              { label: 'Lead Médio Total', val: '22h 21m', color: '#0984E3' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-2xl border border-[#E8E6F0] p-4 text-center">
                <div className="text-2xl font-black" style={{ color: k.color }}>{k.val}</div>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Tabela */}
          <div className="bg-white rounded-2xl border border-[#E8E6F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0F0F5]">
              <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Pedidos Concluídos Recentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F7FC]">
                  <tr>
                    {['Referência', 'Cliente', 'Produto', 'Setores', 'Lead Time Total', 'SLA', 'Status', 'Concluído em'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F7FC]">
                  {CONCLUIDOS.map(p => (
                    <tr key={p.ref} className="hover:bg-[#F8F7FC] transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-xs font-black text-[#6C5CE7]">{p.ref}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-[#2D2D3A]">{p.cliente}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#8B8BA0] font-medium">{p.produto}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-black text-[#2D2D3A]">{p.setores}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black" style={{ color: p.dentroSla ? '#2D2D3A' : '#FF4757' }}>
                          {p.leadTotal}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#A0A0B0] font-bold">{p.sla}h</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${
                          p.dentroSla
                            ? 'bg-[#EEFAF5] text-[#00B894]'
                            : 'bg-[#FFF0F0] text-[#FF4757]'
                        }`}>
                          {p.dentroSla ? <CheckCircle size={9} /> : <AlertTriangle size={9} />}
                          {p.dentroSla ? 'No prazo' : 'Fora do SLA'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] text-[#A0A0B0] font-medium">{p.data}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

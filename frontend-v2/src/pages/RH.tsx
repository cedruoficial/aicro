import { useState } from 'react';
import {
  Users, TrendingUp, Award, AlertTriangle,
  Plus, Search, Filter,
  Star, CheckCircle, XCircle, Coffee
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Turno   = 'Manhã' | 'Tarde' | 'Noite';
type StatusDia = 'presente' | 'ausente' | 'ferias' | 'remoto';
type NivelComp = 0 | 1 | 2 | 3 | 4; // 0=não tem, 1=básico, 2=intermediário, 3=avançado, 4=especialista

interface Colaborador {
  id: string;
  nome: string;
  iniciais: string;
  cor: string;
  cargo: string;
  setor: string;
  subSetor: string;
  turno: Turno;
  statusHoje: StatusDia;
  admissao: string;
  tarefasAtivas: number;
  competencias: Record<string, NivelComp>;         // Técnicas / operacionais
  competenciasPessoais: Record<string, NivelComp>; // Soft skills / comportamentais
  obs?: string;
}

// ─── Competências técnicas (operacionais) ──────────────────────────────────────────────────
const COMPETENCIAS = [
  'Máq. Sakurai', 'Máq. Atima', 'Corte Manual', 'Plotter',
  'Revisão Visual', 'Lab. Cores', 'Embalagem', 'PCP/Planej.',
  'CTIA/Qualidade', 'TPU', 'Calçado', 'Gestão de Equipe',
];

// ─── Competências pessoais (soft skills / comportamentais) ────────────────────────
const COMPETENCIAS_PESSOAIS = [
  'Comunicação', 'Trabalho em Equipe', 'Liderança', 'Proatividade',
  'Organização', 'Resolução de Problemas', 'Adaptabilidade',
  'Foco em Resultado', 'Pontualidade', 'Aprendizado Contínuo',
];

// ─── Mock de colaboradores ────────────────────────────────────────────────────
const COLABORADORES: Colaborador[] = [
  {
    id: 'C001', nome: 'Carlos Mendonça', iniciais: 'CM', cor: '#6C5CE7',
    cargo: 'Operador Sênior', setor: 'Produção', subSetor: 'Impressão / Sakurai',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2019-03-12', tarefasAtivas: 3,
    competencias: { 'Máq. Sakurai': 4, 'Máq. Atima': 3, 'Corte Manual': 2, 'Revisão Visual': 2, 'CTIA/Qualidade': 1, 'Lab. Cores': 1, 'PCP/Planej.': 2, 'Plotter': 1, 'Embalagem': 2, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 2 },
    competenciasPessoais: { 'Comunicação': 3, 'Trabalho em Equipe': 4, 'Liderança': 2, 'Proatividade': 3, 'Organização': 3, 'Resolução de Problemas': 4, 'Adaptabilidade': 3, 'Foco em Resultado': 4, 'Pontualidade': 4, 'Aprendizado Contínuo': 3 },
    obs: 'Referência técnica em Sakurai. Treinou 4 operadores.',
  },
  {
    id: 'C002', nome: 'Fernanda Silva', iniciais: 'FS', cor: '#E17055',
    cargo: 'Técnica de Qualidade', setor: 'Produção', subSetor: 'Qualidade (CTIA)',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2021-06-01', tarefasAtivas: 2,
    competencias: { 'CTIA/Qualidade': 4, 'Revisão Visual': 4, 'Lab. Cores': 3, 'Máq. Sakurai': 1, 'Máq. Atima': 0, 'Corte Manual': 1, 'Plotter': 0, 'Embalagem': 2, 'PCP/Planej.': 1, 'TPU': 0, 'Calçado': 1, 'Gestão de Equipe': 1 },
    competenciasPessoais: { 'Comunicação': 4, 'Trabalho em Equipe': 3, 'Liderança': 2, 'Proatividade': 4, 'Organização': 4, 'Resolução de Problemas': 3, 'Adaptabilidade': 3, 'Foco em Resultado': 4, 'Pontualidade': 3, 'Aprendizado Contínuo': 4 },
  },
  {
    id: 'C003', nome: 'Roberto Alves', iniciais: 'RA', cor: '#00B894',
    cargo: 'Operador de Corte', setor: 'Produção', subSetor: 'Corte',
    turno: 'Tarde', statusHoje: 'presente', admissao: '2020-09-15', tarefasAtivas: 4,
    competencias: { 'Corte Manual': 4, 'Plotter': 3, 'Máq. Sakurai': 2, 'Máq. Atima': 1, 'Revisão Visual': 2, 'Lab. Cores': 0, 'Embalagem': 2, 'PCP/Planej.': 0, 'CTIA/Qualidade': 0, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 0 },
    competenciasPessoais: { 'Comunicação': 2, 'Trabalho em Equipe': 3, 'Liderança': 1, 'Proatividade': 2, 'Organização': 3, 'Resolução de Problemas': 3, 'Adaptabilidade': 4, 'Foco em Resultado': 3, 'Pontualidade': 4, 'Aprendizado Contínuo': 4 },
    obs: 'Especialista em corte de precisão. Cursa técnico em manufatura.',
  },
  {
    id: 'C004', nome: 'Juliana Costa', iniciais: 'JC', cor: '#FDCB6E',
    cargo: 'Colorista', setor: 'Produção', subSetor: 'Laboratório de Cores',
    turno: 'Manhã', statusHoje: 'ferias', admissao: '2018-11-20', tarefasAtivas: 0,
    competencias: { 'Lab. Cores': 4, 'CTIA/Qualidade': 3, 'Revisão Visual': 3, 'Máq. Sakurai': 0, 'Máq. Atima': 0, 'Corte Manual': 0, 'Plotter': 0, 'Embalagem': 1, 'PCP/Planej.': 1, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 2 },
    competenciasPessoais: { 'Comunicação': 3, 'Trabalho em Equipe': 4, 'Liderança': 3, 'Proatividade': 3, 'Organização': 4, 'Resolução de Problemas': 4, 'Adaptabilidade': 3, 'Foco em Resultado': 3, 'Pontualidade': 3, 'Aprendizado Contínuo': 3 },
    obs: 'Responsável pelo banco de fórmulas de tintas. Férias até 12/04.',
  },
  {
    id: 'C005', nome: 'Marcos Lima', iniciais: 'ML', cor: '#0984E3',
    cargo: 'Planejador PCP', setor: 'Produção', subSetor: 'PCP (Planejamento)',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2017-04-05', tarefasAtivas: 6,
    competencias: { 'PCP/Planej.': 4, 'Máq. Sakurai': 2, 'Máq. Atima': 2, 'Corte Manual': 1, 'Plotter': 1, 'Revisão Visual': 2, 'Lab. Cores': 1, 'Embalagem': 1, 'CTIA/Qualidade': 2, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 3 },
    competenciasPessoais: { 'Comunicação': 4, 'Trabalho em Equipe': 4, 'Liderança': 4, 'Proatividade': 4, 'Organização': 4, 'Resolução de Problemas': 4, 'Adaptabilidade': 3, 'Foco em Resultado': 4, 'Pontualidade': 3, 'Aprendizado Contínuo': 3 },
  },
  {
    id: 'C006', nome: 'Ana Paula Ramos', iniciais: 'AP', cor: '#9B59B6',
    cargo: 'Designer Gráfica', setor: 'Arte', subSetor: 'Criação e Design',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2022-02-14', tarefasAtivas: 5,
    competencias: { 'Plotter': 3, 'Corte Manual': 1, 'Revisão Visual': 3, 'Lab. Cores': 2, 'Máq. Sakurai': 0, 'Máq. Atima': 0, 'Embalagem': 0, 'PCP/Planej.': 0, 'CTIA/Qualidade': 1, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 0 },
    competenciasPessoais: { 'Comunicação': 4, 'Trabalho em Equipe': 3, 'Liderança': 2, 'Proatividade': 4, 'Organização': 3, 'Resolução de Problemas': 3, 'Adaptabilidade': 4, 'Foco em Resultado': 3, 'Pontualidade': 4, 'Aprendizado Contínuo': 4 },
    obs: 'Excelência em design de produto. Faz pós em branding.',
  },
  {
    id: 'C007', nome: 'Diego Ferreira', iniciais: 'DF', cor: '#E84393',
    cargo: 'Operador Atima', setor: 'Produção', subSetor: 'Impressão / Sakurai',
    turno: 'Tarde', statusHoje: 'ausente', admissao: '2023-07-10', tarefasAtivas: 0,
    competencias: { 'Máq. Atima': 3, 'Máq. Sakurai': 1, 'Corte Manual': 2, 'Revisão Visual': 1, 'Lab. Cores': 0, 'Plotter': 1, 'Embalagem': 2, 'PCP/Planej.': 0, 'CTIA/Qualidade': 0, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 0 },
    competenciasPessoais: { 'Comunicação': 2, 'Trabalho em Equipe': 3, 'Liderança': 1, 'Proatividade': 2, 'Organização': 2, 'Resolução de Problemas': 2, 'Adaptabilidade': 3, 'Foco em Resultado': 2, 'Pontualidade': 1, 'Aprendizado Contínuo': 3 },
    obs: 'Ausência por atestado médico.',
  },
  {
    id: 'C008', nome: 'Patricia Nunes', iniciais: 'PN', cor: '#00CEC9',
    cargo: 'Atendente Comercial', setor: 'Comercial', subSetor: 'Recebimento de Pedidos',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2020-01-13', tarefasAtivas: 8,
    competencias: { 'PCP/Planej.': 2, 'Revisão Visual': 1, 'Lab. Cores': 0, 'Máq. Sakurai': 0, 'Máq. Atima': 0, 'Corte Manual': 0, 'Plotter': 0, 'Embalagem': 0, 'CTIA/Qualidade': 0, 'TPU': 0, 'Calçado': 0, 'Gestão de Equipe': 1 },
    competenciasPessoais: { 'Comunicação': 4, 'Trabalho em Equipe': 4, 'Liderança': 2, 'Proatividade': 4, 'Organização': 3, 'Resolução de Problemas': 3, 'Adaptabilidade': 4, 'Foco em Resultado': 4, 'Pontualidade': 4, 'Aprendizado Contínuo': 3 },
  },
  {
    id: 'C009', nome: 'Thiago Barbosa', iniciais: 'TB', cor: '#D63031',
    cargo: 'Técnico TPU', setor: 'Produção', subSetor: 'TPU',
    turno: 'Manhã', statusHoje: 'presente', admissao: '2021-03-22', tarefasAtivas: 3,
    competencias: { 'TPU': 4, 'Calçado': 3, 'Corte Manual': 2, 'Revisão Visual': 2, 'Máq. Sakurai': 0, 'Máq. Atima': 0, 'Plotter': 0, 'Lab. Cores': 1, 'Embalagem': 2, 'PCP/Planej.': 0, 'CTIA/Qualidade': 1, 'Gestão de Equipe': 0 },
    competenciasPessoais: { 'Comunicação': 2, 'Trabalho em Equipe': 3, 'Liderança': 1, 'Proatividade': 3, 'Organização': 2, 'Resolução de Problemas': 4, 'Adaptabilidade': 3, 'Foco em Resultado': 4, 'Pontualidade': 3, 'Aprendizado Contínuo': 4 },
  },
  {
    id: 'C010', nome: 'Larissa Melo', iniciais: 'LM', cor: '#6C5CE7',
    cargo: 'P&D Analista', setor: 'P&D', subSetor: 'Novos Projetos',
    turno: 'Manhã', statusHoje: 'remoto', admissao: '2022-08-01', tarefasAtivas: 4,
    competencias: { 'CTIA/Qualidade': 4, 'Lab. Cores': 4, 'TPU': 2, 'Calçado': 2, 'Revisão Visual': 3, 'Máq. Sakurai': 0, 'Máq. Atima': 0, 'Corte Manual': 0, 'Plotter': 0, 'Embalagem': 0, 'PCP/Planej.': 2, 'Gestão de Equipe': 1 },
    competenciasPessoais: { 'Comunicação': 4, 'Trabalho em Equipe': 4, 'Liderança': 3, 'Proatividade': 4, 'Organização': 4, 'Resolução de Problemas': 4, 'Adaptabilidade': 4, 'Foco em Resultado': 4, 'Pontualidade': 3, 'Aprendizado Contínuo': 4 },
    obs: 'Liderança no desenvolvimento de novos artigos de calçado.',
  },
];

// ─── Config de status ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<StatusDia, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  presente: { label: 'Presente',  color: '#00B894', bg: '#EEFAF5', icon: <CheckCircle size={12} /> },
  ausente:  { label: 'Ausente',   color: '#FF4757', bg: '#FFF0F0', icon: <XCircle size={12} /> },
  ferias:   { label: 'Férias',    color: '#FDCB6E', bg: '#FFFBEB', icon: <Coffee size={12} /> },
  remoto:   { label: 'Remoto',    color: '#0984E3', bg: '#EBF5FF', icon: <CheckCircle size={12} /> },
};

const NIVEL_LABEL = ['—', 'Básico', 'Intermediário', 'Avançado', 'Especialista'];
const NIVEL_COLOR = ['#E0E0EC', '#74B9FF', '#FDCB6E', '#00B894', '#6C5CE7'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tempoAdmissao(data: string) {
  const ms = Date.now() - new Date(data).getTime();
  const anos = Math.floor(ms / (365.25 * 24 * 3600000));
  const meses = Math.floor((ms % (365.25 * 24 * 3600000)) / (30.44 * 24 * 3600000));
  return anos > 0 ? `${anos}a ${meses}m` : `${meses} meses`;
}

// ─── Mini donut CSS ───────────────────────────────────────────────────────────
function DonutKPI({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F5" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

// ─── Barra de competência ─────────────────────────────────────────────────────
function CompBar({ nivel, compact = false }: { nivel: NivelComp; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-0.5 ${compact ? '' : 'gap-1'}`}>
      {([1, 2, 3, 4] as NivelComp[]).map(n => (
        <div key={n}
          className={`${compact ? 'w-3 h-1.5' : 'w-4 h-2'} rounded-full transition-all`}
          style={{ background: nivel >= n ? NIVEL_COLOR[nivel] : '#E8E6F0' }}
        />
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ c, size = 36 }: { c: Colaborador; size?: number }) {
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white shrink-0"
      style={{ width: size, height: size, background: c.cor, fontSize: size * 0.32 }}>
      {c.iniciais}
    </div>
  );
}

// ─── Card do colaborador ──────────────────────────────────────────────────────
function ColabCard({ c, onSelect }: { c: Colaborador; onSelect: (c: Colaborador) => void }) {
  const st = STATUS_CFG[c.statusHoje];
  const topComps = Object.entries(c.competencias)
    .filter(([, v]) => v >= 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  const avgComp = Math.round(
    Object.values(c.competencias).reduce((a: number, b: number) => a + b, 0) /
    (Object.values(c.competencias).filter(v => v > 0).length || 1)
  );

  return (
    <div
      onClick={() => onSelect(c)}
      className="bg-white rounded-2xl border border-[#E8E6F0] p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar c={c} size={44} />
          <div>
            <div className="font-black text-[#2D2D3A] text-sm group-hover:text-[#6C5CE7] transition-colors">{c.nome}</div>
            <div className="text-[11px] text-[#8B8BA0] font-medium">{c.cargo}</div>
            <div className="text-[10px] text-[#A0A0B0] mt-0.5">{c.subSetor}</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full"
          style={{ color: st.color, background: st.bg }}>
          {st.icon} {st.label}
        </span>
      </div>

      {/* Competências top */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {topComps.map(([comp, nivel]) => (
          <span key={comp} className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `${NIVEL_COLOR[nivel]}25`, color: NIVEL_COLOR[nivel] }}>
            {comp}
          </span>
        ))}
        {topComps.length === 0 && (
          <span className="text-[9px] text-[#C0C0D0] font-bold">Sem especialização mapeada</span>
        )}
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F0F0F5]">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-sm font-black" style={{ color: c.cor }}>{c.tarefasAtivas}</div>
            <div className="text-[8px] text-[#A0A0B0] font-bold uppercase">Tarefas</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-black text-[#2D2D3A]">{tempoAdmissao(c.admissao)}</div>
            <div className="text-[8px] text-[#A0A0B0] font-bold uppercase">Empresa</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-black" style={{ color: NIVEL_COLOR[Math.min(avgComp, 4)] }}>
              {NIVEL_LABEL[Math.min(avgComp, 4)] ?? '—'}
            </div>
            <div className="text-[8px] text-[#A0A0B0] font-bold uppercase">Nível Médio</div>
          </div>
        </div>
        <div className="text-[#C0C0D0] group-hover:text-[#6C5CE7] transition-colors text-sm font-bold">›</div>
      </div>
    </div>
  );
}

// ─── Modal de detalhe do colaborador ─────────────────────────────────────────
function ColabModal({ c, onClose }: { c: Colaborador; onClose: () => void }) {
  const st = STATUS_CFG[c.statusHoje];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header colorido */}
        <div className="px-8 pt-7 pb-6 rounded-t-[28px]" style={{ background: `linear-gradient(135deg, ${c.cor}15, ${c.cor}05)`, borderBottom: `2px solid ${c.cor}20` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar c={c} size={56} />
              <div>
                <h2 className="text-xl font-black text-[#2D2D3A]">{c.nome}</h2>
                <div className="text-sm text-[#8B8BA0] font-medium">{c.cargo} · {c.subSetor}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ color: st.color, background: st.bg }}>{st.icon} {st.label}</span>
                  <span className="text-[10px] text-[#A0A0B0] font-bold">Turno {c.turno}</span>
                  <span className="text-[10px] text-[#A0A0B0] font-bold">· {tempoAdmissao(c.admissao)} de empresa</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-[#C0C0D0] hover:text-[#2D2D3A] text-xl font-bold transition-colors">✕</button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Tarefas ativas', val: c.tarefasAtivas, color: c.cor },
              { label: 'Competências', val: Object.values(c.competencias).filter(v => v > 0).length, color: '#6C5CE7' },
              { label: 'Especializações', val: Object.values(c.competencias).filter(v => v >= 3).length, color: '#00B894' },
              { label: 'Tempo empresa', val: tempoAdmissao(c.admissao), color: '#E17055' },
            ].map(k => (
              <div key={k.label} className="bg-[#F8F7FC] rounded-2xl p-3 text-center">
                <div className="text-lg font-black" style={{ color: k.color }}>{k.val}</div>
                <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Mapa de competências técnicas */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
              <h3 className="text-sm font-black text-[#2D2D3A] uppercase tracking-widest">Competências Técnicas</h3>
            </div>
            <div className="space-y-2">
              {COMPETENCIAS.map(comp => {
                const nivel = c.competencias[comp] as NivelComp ?? 0;
                return (
                  <div key={comp} className="flex items-center gap-3">
                    <div className="text-[11px] font-bold text-[#8B8BA0] w-36 shrink-0">{comp}</div>
                    <div className="flex-1 h-2 bg-[#F0F0F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(nivel / 4) * 100}%`, background: NIVEL_COLOR[nivel] }} />
                    </div>
                    <div className="text-[10px] font-black w-24 shrink-0"
                      style={{ color: nivel > 0 ? NIVEL_COLOR[nivel] : '#C0C0D0' }}>
                      {NIVEL_LABEL[nivel]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mapa de competências pessoais */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#E17055]" />
              <h3 className="text-sm font-black text-[#2D2D3A] uppercase tracking-widest">Competências Pessoais</h3>
              <span className="text-[9px] text-[#A0A0B0] font-bold bg-[#F4F3F8] px-2 py-0.5 rounded-full">Soft Skills · Comportamentais</span>
            </div>
            <div className="space-y-2">
              {COMPETENCIAS_PESSOAIS.map(comp => {
                const nivel = c.competenciasPessoais[comp] as NivelComp ?? 0;
                return (
                  <div key={comp} className="flex items-center gap-3">
                    <div className="text-[11px] font-bold text-[#8B8BA0] w-36 shrink-0">{comp}</div>
                    <div className="flex-1 h-2 bg-[#F0F0F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(nivel / 4) * 100}%`, background: nivel >= 3 ? '#E17055' : nivel >= 2 ? '#FDCB6E' : NIVEL_COLOR[nivel] }} />
                    </div>
                    <div className="text-[10px] font-black w-24 shrink-0"
                      style={{ color: nivel > 0 ? (nivel >= 3 ? '#E17055' : '#FDCB6E') : '#C0C0D0' }}>
                      {NIVEL_LABEL[nivel]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Análise de perfil */}
          <div className="bg-[#F8F7FC] rounded-2xl p-5">
            <h3 className="text-sm font-black text-[#2D2D3A] mb-3 uppercase tracking-widest">Análise de Perfil</h3>
            <div className="space-y-2 text-sm text-[#6B6B80]">
              {Object.values(c.competencias).filter(v => v === 4).length >= 2 && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6C5CE720] flex items-center justify-center shrink-0">
                    <Star size={11} className="text-[#6C5CE7]" />
                  </span>
                  <span><strong className="text-[#2D2D3A]">Colaborador-chave:</strong> Especialista em múltiplas áreas. Risco de dependência operacional.</span>
                </div>
              )}
              {c.tarefasAtivas >= 5 && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FF475720] flex items-center justify-center shrink-0">
                    <AlertTriangle size={11} className="text-[#FF4757]" />
                  </span>
                  <span><strong className="text-[#2D2D3A]">Alta carga:</strong> {c.tarefasAtivas} tarefas simultâneas pode impactar qualidade.</span>
                </div>
              )}
              {Object.values(c.competencias).filter(v => v === 0).length >= 8 && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#FDCB6E20] flex items-center justify-center shrink-0">
                    <TrendingUp size={11} className="text-[#FDCB6E]" />
                  </span>
                  <span><strong className="text-[#2D2D3A]">Potencial de crescimento:</strong> Perfil especializado, oportunidade de capacitação cruzada.</span>
                </div>
              )}
              {parseInt(tempoAdmissao(c.admissao)) >= 4 && (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00B89420] flex items-center justify-center shrink-0">
                    <Award size={11} className="text-[#00B894]" />
                  </span>
                  <span><strong className="text-[#2D2D3A]">Colaborador veterano:</strong> Mais de 4 anos de empresa. Detentor de conhecimento tácito.</span>
                </div>
              )}
            </div>
          </div>

          {/* Obs */}
          {c.obs && (
            <div className="bg-[#F4F3FD] rounded-2xl px-5 py-4 text-sm text-[#6B6B80]">
              <span className="font-black text-[#6C5CE7]">Obs: </span>{c.obs}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mapa de competências da empresa ─────────────────────────────────────────
function MapaCompetencias({ colabs }: { colabs: Colaborador[] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E6F0] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#F0F0F5]">
        <h2 className="text-sm font-black text-[#2D2D3A] uppercase tracking-widest">Matriz de Competências</h2>
        <p className="text-xs text-[#A0A0B0] font-medium mt-0.5">Cobertura de habilidades por pessoa</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7FC]">
              <th className="px-4 py-3 text-left text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider w-28 sticky left-0 bg-[#F8F7FC]">
                Colaborador
              </th>
              {COMPETENCIAS.map(c => (
                <th key={c} className="px-2 py-3 text-[8px] font-black text-[#A0A0B0] uppercase text-center min-w-[64px]">
                  <div className="writing-mode-vertical">{c}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F5]">
            {colabs.map(c => (
              <tr key={c.id} className="hover:bg-[#F8F7FC] transition-colors">
                <td className="px-4 py-3 sticky left-0 bg-white">
                  <div className="flex items-center gap-2">
                    <Avatar c={c} size={24} />
                    <span className="text-[10px] font-bold text-[#2D2D3A] truncate max-w-[72px]">{c.nome.split(' ')[0]}</span>
                  </div>
                </td>
                {COMPETENCIAS.map(comp => {
                  const nivel = c.competencias[comp] as NivelComp ?? 0;
                  return (
                    <td key={comp} className="px-2 py-3 text-center">
                      <div className="flex justify-center">
                        {nivel === 0 ? (
                          <div className="w-5 h-5 rounded-full bg-[#F0F0F5]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black"
                            style={{ background: NIVEL_COLOR[nivel] }}>
                            {nivel}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Legenda */}
      <div className="px-6 py-3 border-t border-[#F0F0F5] flex items-center gap-4 flex-wrap">
        {NIVEL_LABEL.slice(1).map((l, i) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black"
              style={{ background: NIVEL_COLOR[i + 1] }}>{i + 1}</div>
            <span className="text-[10px] text-[#A0A0B0] font-bold">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Análise de gaps ──────────────────────────────────────────────────────────
function AnaliseGaps({ colabs }: { colabs: Colaborador[] }) {
  const gaps = COMPETENCIAS.map(comp => {
    const especialistas = colabs.filter(c => (c.competencias[comp] ?? 0) >= 3).length;
    const cobertura = (especialistas / colabs.length) * 100;
    return { comp, especialistas, cobertura };
  }).sort((a, b) => a.cobertura - b.cobertura);

  const singlePoints = COMPETENCIAS.filter(comp =>
    colabs.filter(c => (c.competencias[comp] ?? 0) >= 3).length === 1
  );

  return (
    <div className="space-y-4">
      {/* Alertas críticos */}
      {singlePoints.length > 0 && (
        <div className="bg-[#FFF0F0] border border-[#FF475730] rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-[#FF4757]" />
            <span className="text-xs font-black text-[#FF4757] uppercase tracking-wider">Risco: Ponto Único de Falha</span>
          </div>
          <p className="text-xs text-[#8B8BA0] mb-2">Estas competências têm apenas <strong>1 especialista</strong> — risco operacional alto:</p>
          <div className="flex flex-wrap gap-1.5">
            {singlePoints.map(c => (
              <span key={c} className="text-[10px] font-black px-2.5 py-1 bg-[#FF475715] text-[#FF4757] rounded-full border border-[#FF475730]">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Barras de cobertura */}
      <div className="bg-white rounded-2xl border border-[#E8E6F0] p-5">
        <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest mb-4">Cobertura por Competência</h3>
        <div className="space-y-2.5">
          {gaps.map(({ comp, especialistas, cobertura }) => (
            <div key={comp} className="flex items-center gap-3">
              <div className="text-[10px] font-bold text-[#8B8BA0] w-28 shrink-0">{comp}</div>
              <div className="flex-1 h-2 bg-[#F0F0F5] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${cobertura}%`,
                    background: cobertura < 20 ? '#FF4757' : cobertura < 50 ? '#FDCB6E' : '#00B894'
                  }} />
              </div>
              <div className="text-[10px] font-black w-16 text-right shrink-0"
                style={{ color: cobertura < 20 ? '#FF4757' : cobertura < 50 ? '#D97706' : '#00B894' }}>
                {especialistas} pessoa{especialistas !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Workload visual ──────────────────────────────────────────────────────────
function WorkloadPanel({ colabs }: { colabs: Colaborador[] }) {
  const sorted = [...colabs].sort((a, b) => b.tarefasAtivas - a.tarefasAtivas);
  const max = Math.max(...colabs.map(c => c.tarefasAtivas), 1);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E6F0] p-5">
      <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest mb-4">Volume de Trabalho Atual</h3>
      <div className="space-y-2">
        {sorted.map(c => (
          <div key={c.id} className="flex items-center gap-3">
            <Avatar c={c} size={24} />
            <div className="text-[10px] font-bold text-[#8B8BA0] w-20 shrink-0 truncate">{c.nome.split(' ')[0]}</div>
            <div className="flex-1 h-3 bg-[#F0F0F5] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(c.tarefasAtivas / max) * 100}%`,
                  background: c.tarefasAtivas >= 6 ? '#FF4757' : c.tarefasAtivas >= 4 ? '#FDCB6E' : c.cor,
                }} />
            </div>
            <div className="text-[10px] font-black w-10 text-right shrink-0"
              style={{ color: c.tarefasAtivas >= 6 ? '#FF4757' : c.tarefasAtivas >= 4 ? '#D97706' : '#6C5CE7' }}>
              {c.tarefasAtivas}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Página RH ────────────────────────────────────────────────────────────────
type ViewTab = 'equipe' | 'competencias' | 'analise';

export function RH() {
  const [tab, setTab]             = useState<ViewTab>('equipe');
  const [busca, setBusca]         = useState('');
  const [filtroSetor, setFiltroSetor] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusDia | 'todos'>('todos');
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);

  const setores = ['Todos', ...Array.from(new Set(COLABORADORES.map(c => c.setor)))];

  const filtered = COLABORADORES.filter(c => {
    const matchBusca  = busca === '' || c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cargo.toLowerCase().includes(busca.toLowerCase());
    const matchSetor  = filtroSetor === 'Todos' || c.setor === filtroSetor;
    const matchStatus = filtroStatus === 'todos' || c.statusHoje === filtroStatus;
    return matchBusca && matchSetor && matchStatus;
  });

  const kpis = {
    total:     COLABORADORES.length,
    presentes: COLABORADORES.filter(c => c.statusHoje === 'presente' || c.statusHoje === 'remoto').length,
    ferias:    COLABORADORES.filter(c => c.statusHoje === 'ferias').length,
    ausentes:  COLABORADORES.filter(c => c.statusHoje === 'ausente').length,
    pctPresenca: Math.round(COLABORADORES.filter(c => c.statusHoje === 'presente' || c.statusHoje === 'remoto').length / COLABORADORES.length * 100),
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#6C5CE7] mb-1">GESTÃO DE PESSOAS</div>
          <h1 className="text-2xl font-black text-[#2D2D3A] tracking-tight m-0">Recursos Humanos</h1>
          <p className="text-[#8B8BA0] text-sm font-medium mt-0.5">Equipe, competências e análise de capital humano.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-black text-sm shadow-lg transition-all active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5A4BCE)' }}>
          <Plus size={16} /> Novo Colaborador
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-7">
        {[
          { label: 'Total',      val: kpis.total,        color: '#6C5CE7', sub: 'colaboradores', donut: 100 },
          { label: 'Presentes',  val: kpis.presentes,    color: '#00B894', sub: 'hoje',           donut: kpis.pctPresenca },
          { label: 'Remotos',    val: COLABORADORES.filter(c => c.statusHoje === 'remoto').length, color: '#0984E3', sub: 'hoje', donut: Math.round(COLABORADORES.filter(c => c.statusHoje === 'remoto').length/kpis.total*100) },
          { label: 'Férias',     val: kpis.ferias,       color: '#FDCB6E', sub: 'período',        donut: Math.round(kpis.ferias/kpis.total*100) },
          { label: 'Ausentes',   val: kpis.ausentes,     color: '#FF4757', sub: 'hoje',           donut: Math.round(kpis.ausentes/kpis.total*100) },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#E8E6F0] shadow-sm p-4 flex items-center gap-3">
            <div className="relative shrink-0">
              <DonutKPI pct={k.donut} color={k.color} size={48} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black" style={{ color: k.color }}>{k.val}</span>
              </div>
            </div>
            <div>
              <div className="text-lg font-black text-[#2D2D3A]">{k.val}</div>
              <div className="text-[9px] font-black text-[#A0A0B0] uppercase tracking-wider">{k.label}</div>
              <div className="text-[9px] text-[#C0C0D0]">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#E8E6F0] pb-4">
        {([
          { key: 'equipe',      icon: <Users size={14} />,      label: 'Equipe' },
          { key: 'competencias',icon: <Award size={14} />,      label: 'Competências' },
          { key: 'analise',     icon: <TrendingUp size={14} />, label: 'Análise / Gaps' },
        ] as { key: ViewTab; icon: React.ReactNode; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === t.key
                ? 'text-white shadow-md'
                : 'bg-white text-[#8B8BA0] border border-[#E8E6F0] hover:border-[#C0C0D0]'
            }`}
            style={tab === t.key ? { background: 'linear-gradient(135deg, #6C5CE7, #5A4BCE)' } : {}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─────────────── ABA: EQUIPE ─────────────── */}
      {tab === 'equipe' && (
        <>
          {/* Filtros */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-[#A0A0B0]" />
              {setores.map(s => (
                <button key={s} onClick={() => setFiltroSetor(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    filtroSetor === s ? 'text-white shadow-sm border-transparent' : 'bg-white text-[#8B8BA0] border-[#E8E6F0]'
                  }`}
                  style={filtroSetor === s ? { background: '#6C5CE7' } : {}}>
                  {s}
                </button>
              ))}
              <div className="h-4 w-px bg-[#E8E6F0] mx-1" />
              {(['todos', 'presente', 'remoto', 'ferias', 'ausente'] as (StatusDia | 'todos')[]).map(s => (
                <button key={s} onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    filtroStatus === s ? 'text-white shadow-sm border-transparent' : 'bg-white text-[#8B8BA0] border-[#E8E6F0]'
                  }`}
                  style={filtroStatus === s ? { background: s === 'todos' ? '#6C5CE7' : STATUS_CFG[s as StatusDia]?.color ?? '#6C5CE7' } : {}}>
                  {s === 'todos' ? 'Todos Status' : STATUS_CFG[s as StatusDia].label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-[#C0C0D0]" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar colaborador..."
                className="pl-8 pr-4 py-2 bg-white border border-[#E8E6F0] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6C5CE730] w-52" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <ColabCard key={c.id} c={c} onSelect={setSelectedColab} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#E8E6F0] p-16 text-center text-[#C0C0D0] font-bold">
                Nenhum colaborador encontrado.
              </div>
            )}
          </div>
        </>
      )}

      {/* ─────────────── ABA: COMPETÊNCIAS ─────────────── */}
      {tab === 'competencias' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <MapaCompetencias colabs={COLABORADORES} />
            </div>
            <WorkloadPanel colabs={COLABORADORES} />
          </div>
        </div>
      )}

      {/* ─────────────── ABA: ANÁLISE ─────────────── */}
      {tab === 'analise' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnaliseGaps colabs={COLABORADORES} />

          {/* Top performers por especialização */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E6F0] p-5">
              <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest mb-4">Especialistas por Área</h3>
              <div className="space-y-3">
                {COMPETENCIAS.slice(0, 8).map(comp => {
                  const experts = COLABORADORES
                    .filter(c => (c.competencias[comp] ?? 0) >= 3)
                    .sort((a, b) => (b.competencias[comp] ?? 0) - (a.competencias[comp] ?? 0));
                  return (
                    <div key={comp}>
                      <div className="text-[10px] font-black text-[#A0A0B0] uppercase tracking-wider mb-1.5">{comp}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {experts.length === 0 ? (
                          <span className="text-[10px] text-[#FF4757] font-bold bg-[#FFF0F0] px-2 py-0.5 rounded-full">⚠ Sem especialista</span>
                        ) : experts.map(c => (
                          <div key={c.id} className="flex items-center gap-1.5 bg-[#F8F7FC] px-2.5 py-1 rounded-full">
                            <Avatar c={c} size={16} />
                            <span className="text-[10px] font-bold text-[#4D4B5A]">{c.nome.split(' ')[0]}</span>
                            <CompBar nivel={c.competencias[comp] as NivelComp} compact />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colaboradores chave */}
            <div className="bg-white rounded-2xl border border-[#6C5CE730] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-[#6C5CE7]" />
                <h3 className="text-xs font-black text-[#2D2D3A] uppercase tracking-widest">Colaboradores-Chave</h3>
              </div>
              <div className="space-y-3">
                {COLABORADORES
                  .map(c => ({ c, esp: Object.values(c.competencias).filter(v => v >= 3).length }))
                  .sort((a, b) => b.esp - a.esp)
                  .slice(0, 5)
                  .map(({ c, esp }) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Avatar c={c} size={32} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-[#2D2D3A] truncate">{c.nome}</div>
                        <div className="text-[10px] text-[#8B8BA0]">{c.cargo}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-[#6C5CE7]">{esp}</div>
                        <div className="text-[8px] text-[#A0A0B0] font-bold uppercase">especializ.</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalhe colaborador */}
      {selectedColab && (
        <ColabModal c={selectedColab} onClose={() => setSelectedColab(null)} />
      )}
    </div>
  );
}

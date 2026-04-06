import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, AlertCircle, ArrowRight, ChevronRight, Menu, X, User, LogOut, Settings, Shield } from 'lucide-react';
import { FEED_EVENTS } from '../data/mock';
import { SUBSECTOR_TASKS, type SubTask } from '../data/mockSubTasks';
import { typeConfig } from '../data/constants';

// ─── Cadeia Produtiva Real ─────────────────────────────────────────────────────
const PRODUCTION_CHAIN: { label: string; sectorId: string; subKey: string; color: string }[] = [
  { label: 'Comercial',    sectorId: 'comercial', subKey: 'Recebimento de Pedidos', color: '#00CEC9' },
  { label: 'Arte',         sectorId: 'arte',      subKey: 'Criação e Design',       color: '#9B59B6' },
  { label: 'P&D',          sectorId: 'pd',        subKey: 'Novos Projetos',         color: '#E17055' },
  { label: 'Lab. Cores',   sectorId: 'producao',  subKey: 'Laboratório de Cores',   color: '#FDCB6E' },
  { label: 'PCP',          sectorId: 'producao',  subKey: 'PCP (Planejamento)',     color: '#0984E3' },
  { label: 'Corte',        sectorId: 'producao',  subKey: 'Corte',                 color: '#00B894' },
  { label: 'Plotter',      sectorId: 'producao',  subKey: 'Plotter',               color: '#6C5CE7' },
  { label: 'Impressão',    sectorId: 'producao',  subKey: 'Impressão / Sakurai',   color: '#6C5CE7' },
  { label: 'Revisão',      sectorId: 'producao',  subKey: 'Revisão',               color: '#E17055' },
  { label: 'Embalagem',    sectorId: 'producao',  subKey: 'Embalagem',             color: '#FD79A8' },
  { label: 'Qualidade',    sectorId: 'producao',  subKey: 'Qualidade (CTIA)',       color: '#D63031' },
  { label: 'Expedição',    sectorId: 'producao',  subKey: 'Expedição',             color: '#55EFC4' },
];



const NAV_ITEMS = [
  { label: "Painel Geral", path: "/home",      icon: "🏠" },
  { label: "Comercial",    path: "/comercial",  icon: "🤝" },
  { label: "Insights",     path: "/insights",   icon: "📊" },
  { label: "PCP",          path: "/pcp",        icon: "📅" },
  { label: "RH",           path: "/rh",         icon: "👥" },
];

export function Header() {
  const [showNotifPanel, setShowNotifPanel]  = useState(false);
  const [showUserMenu, setShowUserMenu]    = useState(false);
  const [notifications, setNotifications]    = useState(3);
  const [search, setSearch]                  = useState('');
  const [showResults, setShowResults]        = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]  = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchRef      = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const navigate       = useNavigate();
  const location       = useLocation();

  const pendingEvents = FEED_EVENTS
    .filter(e => e.type === "reprovado" || e.type === "alerta")
    .slice(0, 4);



  const getSearchResults = () => {
    if (search.length < 2) return [];
    const results: { task: SubTask; sectorId: string; subSector: string }[] = [];
    const seen = new Set<string>();
    const term = search.toLowerCase();
    Object.entries(SUBSECTOR_TASKS).forEach(([key, tasks]) => {
      const [sectorId, subSector] = key.split('::');
      tasks.forEach(task => {
        const dedupeKey = `${task.ref}::${sectorId}::${subSector}`;
        if (seen.has(dedupeKey)) return;
        if (
          task.ref.toLowerCase().includes(term) ||
          task.produto.toLowerCase().includes(term) ||
          task.cliente.toLowerCase().includes(term)
        ) {
          seen.add(dedupeKey);
          results.push({ task, sectorId, subSector });
        }
      });
    });
    results.sort((a, b) => {
      const aStuck = a.task.status === 'bloqueado' || a.task.status === 'atrasado' ? -1 : 0;
      const bStuck = b.task.status === 'bloqueado' || b.task.status === 'atrasado' ? -1 : 0;
      return aStuck - bStuck;
    });
    return results.slice(0, 7);
  };

  const results = getSearchResults();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      // Fecha menu de usuário ao clicar fora
      if (showUserMenu && !(event.target as HTMLElement).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fechar menu mobile ao navegar
  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Abrir busca mobile e focar input
  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 100);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setSearch('');
    setShowResults(false);
  };

  return (
    <>
      <header className="bg-white border-b border-[#E8E6F0] sticky top-0 z-50 shadow-[0_1px_8px_rgba(108,92,231,0.06)]">
        <div className="px-4 lg:px-8 h-14 flex items-center justify-between gap-2">

          {/* ── Brand ─────────────────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
            onClick={() => navigate('/home')}
          >
            <img
              src="/logo-cromo.png"
              alt="Grupo Cromotransfer"
              className="h-8 sm:h-9 object-contain"
            />
            <span className="text-[9px] font-medium text-[#B0B0C0] tracking-[1px] uppercase hidden sm:block">
              Plataforma Industrial
            </span>
          </div>

          {/* ── Search Bar — Desktop only (lg+) ─────────────────────────────── */}
          <div className="hidden lg:block flex-1 max-w-[480px] mx-4" ref={searchRef}>
            <div className="relative">
              <Search
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${search ? 'text-[#6C5CE7]' : 'text-[#C0C0D0]'}`}
                size={16}
              />
              <input
                type="text"
                placeholder="Pesquisar pedido, produto ou cliente..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FC] border border-[#EEEDF5] rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#6C5CE715] focus:border-[#6C5CE7] transition-all placeholder:text-[#C0C0D0]"
              />
            </div>

            {/* Search dropdown */}
            {showResults && search.length >= 2 && (
              <div
                className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[min(660px,90vw)] bg-white rounded-2xl overflow-hidden animate-in fade-in zoom-in-97 duration-150 z-[9999]"
                style={{ boxShadow: '0 32px 80px rgba(45,45,58,0.22), 0 0 0 1px rgba(0,0,0,0.06)' }}
              >
                <SearchResults
                  results={results}
                  search={search}
                  onSelect={(path) => { navigate(path); setShowResults(false); setSearch(''); }}
                />
              </div>
            )}
          </div>

          {/* ── Right Controls ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Search icon — visible below lg */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B80] bg-[#F8F7FC] border border-[#EEEDF5] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all"
              onClick={openMobileSearch}
              aria-label="Buscar"
            >
              <Search size={18} />
            </button>

            {/* Nav — Desktop (lg+) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`py-2 px-3 xl:px-4 rounded-xl border-none text-[12px] xl:text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.25)]'
                        : 'bg-transparent text-[#6B6B80] hover:bg-[#F4F3FD] hover:text-[#6C5CE7]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* CEO desktop */}
              <button
                onClick={() => navigate('/ceo')}
                className="ml-1 py-2 px-4 rounded-xl border-none text-white text-[12px] font-bold cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(26,26,46,0.2)] hover:shadow-[0_6px_20px_rgba(108,92,231,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #6C5CE7 100%)' }}
              >
                <span className="text-sm">📊</span>
                <span>CEO</span>
              </button>
            </nav>

            <div className="hidden lg:block w-px h-6 bg-[#E8E6F0] mx-1" />

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifPanel(!showNotifPanel); setNotifications(0); }}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg relative cursor-pointer transition-all duration-200 ${
                  showNotifPanel
                    ? 'bg-[#6C5CE7] border-[#6C5CE7]'
                    : 'bg-white border-[#E8E6F0] hover:border-[#6C5CE7]'
                }`}
              >
                <span className={showNotifPanel ? 'brightness-0 invert' : ''}>🔔</span>
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF4757] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-[0_2px_4px_rgba(255,71,87,0.3)]">
                    {notifications}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <div className="absolute top-12 right-0 w-[min(340px,90vw)] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#E8E6F0] overflow-hidden z-[200] animate-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-[#F0F0F5] font-black text-[11px] uppercase tracking-widest text-[#A0A0B0]">
                    Alertas do Sistema
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {pendingEvents.map(ev => (
                      <div key={ev.id} className="p-4 px-5 border-b border-[#F8F8FB] flex gap-4 items-start hover:bg-[#F8F7FC] transition-colors cursor-pointer">
                        <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 shadow-sm" style={{ background: typeConfig[ev.type].color }} />
                        <div>
                          <div className="text-[13px] font-bold text-[#2D2D3A] leading-tight">{ev.message}</div>
                          <div className="text-[11px] text-[#8B8BA0] font-medium mt-1 flex items-center gap-2">
                            <span>{ev.sector}</span>
                            <span className="w-1 h-1 rounded-full bg-[#C0C0D0]" />
                            <span>{ev.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Account Button */}
            <div className="relative user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                  showUserMenu
                    ? 'bg-[#1E1B4B] border-[#1E1B4B] text-white shadow-lg'
                    : 'bg-white border-[#E8E6F0] text-[#6B6B80] hover:border-[#1E1B4B] hover:text-[#1E1B4B]'
                }`}
              >
                <User size={18} />
              </button>

              {showUserMenu && (
                <div className="absolute top-12 right-0 w-[240px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[#E8E6F0] overflow-hidden z-[200] animate-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 bg-[#F8F7FC] border-b border-[#EEEDF5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1E1B4B] flex items-center justify-center text-white font-bold text-sm">
                        AD
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-[#2D2D3A]">Administrador</span>
                        <span className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-wider">Setor: Master</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#6B6B80] hover:bg-[#F4F3FD] hover:text-[#6C5CE7] transition-all">
                      <Shield size={14} />
                      Permissões de Acesso
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#6B6B80] hover:bg-[#F4F3FD] hover:text-[#6C5CE7] transition-all">
                      <Settings size={14} />
                      Configurações
                    </button>
                    <div className="h-px bg-[#EEEDF5] my-1 mx-2" />
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-[#FF4757] hover:bg-[#FF475708] transition-all">
                      <LogOut size={14} />
                      Sair do Sistema
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburguer — visible below lg */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#6B6B80] bg-[#F8F7FC] border border-[#EEEDF5] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search Bar ────────────────────────────────────────────── */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-[#E8E6F0] bg-white px-4 py-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C5CE7]" size={16} />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Buscar pedido, produto ou cliente..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                  className="w-full pl-10 pr-4 py-3 bg-[#F8F7FC] border border-[#6C5CE740] rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#6C5CE715] focus:border-[#6C5CE7] transition-all placeholder:text-[#C0C0D0]"
                />
              </div>
              <button onClick={closeMobileSearch} className="shrink-0 text-[#8B8BA0] font-bold text-sm px-2 py-2">
                Cancelar
              </button>
            </div>

            {showResults && search.length >= 2 && (
              <div className="mt-2 bg-white rounded-2xl overflow-hidden border border-[#E8E6F0] shadow-lg max-h-[70vh] overflow-y-auto">
                <SearchResults
                  results={results}
                  search={search}
                  onSelect={(path) => { navigate(path); closeMobileSearch(); }}
                />
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Mobile Menu Drawer ──────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-[#E8E6F0] z-50 lg:hidden animate-in slide-in-from-top-2 duration-200 shadow-xl rounded-b-2xl">
            <nav className="p-4 grid grid-cols-3 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-md'
                        : 'bg-[#F8F7FC] text-[#6B6B80] border-[#EEEDF5] hover:border-[#6C5CE7]'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="leading-tight">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => handleNavClick('/ceo')}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-bold text-white shadow-md transition-all col-span-3"
                style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #6C5CE7 100%)' }}
              >
                <span className="text-xl">📊</span>
                <span>Dashboard CEO</span>
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

// ─── Search Results (compartilhado desktop e mobile) ─────────────────────────
function SearchResults({
  results,
  search,
  onSelect,
}: {
  results: { task: SubTask; sectorId: string; subSector: string }[];
  search: string;
  onSelect: (path: string) => void;
}) {
  const toSlug = (name: string) =>
    name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <>
      {/* Header escuro */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #1E1B4B, #2D2D3A)' }}
      >
        <div className="flex items-center gap-2">
          <Search size={13} className="text-[#8B8BCC]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#8B8BCC]">
            Rastreando "{search}"
          </span>
        </div>
        <div className="flex items-center gap-3">
          {results.some(r => r.task.status === 'bloqueado' || r.task.status === 'atrasado') && (
            <span className="flex items-center gap-1 text-[9px] font-black text-[#FF6B7A] bg-[#FF475720] px-2 py-0.5 rounded-full">
              <AlertCircle size={9} />
              {results.filter(r => r.task.status === 'bloqueado' || r.task.status === 'atrasado').length} TRAVADO(S)
            </span>
          )}
          <span className="text-[9px] text-[#5555AA] font-bold">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="p-10 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <div className="text-sm font-bold text-[#A0A0B0]">Nenhum material encontrado</div>
          <div className="text-[11px] text-[#C0C0D0] mt-1">Tente o número do pedido (PED-0001) ou nome do produto.</div>
        </div>
      ) : (
        results.map(({ task, sectorId, subSector }) => {
          const isStuck = task.status === 'atrasado' || task.status === 'bloqueado';
          const chainIdx = PRODUCTION_CHAIN.findIndex(s =>
            s.subKey.toLowerCase().includes(subSector.toLowerCase()) ||
            subSector.toLowerCase().includes(s.label.toLowerCase())
          );
          const windowStart = Math.max(0, chainIdx - 2);
          const windowEnd = Math.min(PRODUCTION_CHAIN.length - 1, chainIdx + 2);
          const chainWindow = PRODUCTION_CHAIN.slice(windowStart, windowEnd + 1);
          const currentChain = chainIdx >= 0 ? PRODUCTION_CHAIN[chainIdx] : null;

          const STATUS_LABEL: Record<string, string> = {
            bloqueado: 'BLOQUEADO', atrasado: 'ATRASADO',
            em_execucao: 'EM EXECUÇÃO', aguardando: 'AGUARDANDO', concluido: 'CONCLUÍDO',
          };
          const STATUS_COLOR: Record<string, string> = {
            bloqueado: '#FF4757', atrasado: '#E17055',
            em_execucao: '#00B894', aguardando: '#0984E3', concluido: '#A0A0B0',
          };
          const stColor = STATUS_COLOR[task.status] ?? '#A0A0B0';

          return (
            <button
              key={`${task.ref}-${subSector}`}
              onClick={() => onSelect(`/setor/${sectorId}/${toSlug(subSector)}`)}
              className="w-full text-left border-b border-[#F4F3F8] last:border-none hover:bg-[#FAFAFE] transition-colors group"
            >
              <div className="flex items-center gap-3 px-4 md:px-5 pt-3 pb-2">
                <div
                  className="shrink-0 w-2.5 h-2.5 rounded-full mt-0.5"
                  style={{ background: stColor, boxShadow: isStuck ? `0 0 8px ${stColor}80` : 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] font-black text-[#1E1B4B]">{task.ref}</span>
                    <span className="text-xs font-semibold text-[#6B6B80]">{task.cliente}</span>
                    <span className="text-[11px] text-[#B0B0C0] truncate hidden sm:inline">{task.produto}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                      style={{ color: stColor, background: `${stColor}14` }}
                    >
                      {isStuck && '⚠ '}{STATUS_LABEL[task.status] ?? task.status}
                    </span>
                    <span className="text-[9px] text-[#C0C0D0]">em</span>
                    <span className="text-[9px] font-bold text-[#8B8BA0]">{subSector}</span>
                  </div>
                </div>
                <ArrowRight size={13} className="text-[#D0D0E0] shrink-0 group-hover:text-[#6C5CE7] group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Chain flow */}
              <div
                className={`mx-3 md:mx-4 mb-3 px-3 md:px-4 py-2.5 rounded-xl ${isStuck ? 'bg-[#FFF8F8]' : 'bg-[#F8F7FC]'}`}
                style={{ border: `1px solid ${isStuck ? '#FF475718' : '#E8E6F0'}` }}
              >
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1 h-1 rounded-full bg-[#C0C0D0]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#C0C0D0]">Fluxo Produtivo</span>
                </div>
                <div className="flex items-center overflow-x-auto gap-0">
                  {windowStart > 0 && <span className="text-[#C0C0D0] text-[10px] font-bold mr-2 shrink-0 select-none">···</span>}
                  {chainWindow.map((step, wIdx) => {
                    const absIdx = windowStart + wIdx;
                    const isCurrent = absIdx === chainIdx;
                    const isPast    = absIdx < chainIdx;
                    const isNext    = absIdx === chainIdx + 1;
                    return (
                      <div key={step.label} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={`px-2 py-1 rounded-lg text-[9px] font-black whitespace-nowrap ${isCurrent ? 'text-white' : ''}`}
                            style={
                              isCurrent
                                ? { background: isStuck ? '#FF4757' : step.color, boxShadow: isStuck ? '0 2px 10px rgba(255,71,87,0.35)' : `0 2px 10px ${step.color}50` }
                                : isPast
                                ? { background: `${step.color}28`, color: step.color }
                                : isNext
                                ? { border: `1.5px dashed ${step.color}80`, color: step.color, background: `${step.color}08` }
                                : { background: '#EEEDF5', color: '#C0C0D0' }
                            }
                          >
                            {isCurrent && isStuck ? '⚠ ' : isCurrent ? '▶ ' : isPast ? '✓ ' : ''}
                            {step.label}
                          </div>
                          <div
                            className="text-[7px] font-black mt-1 uppercase h-3"
                            style={{ color: isCurrent ? (isStuck ? '#FF4757' : step.color) : isNext ? '#C0C0D0' : 'transparent' }}
                          >
                            {isCurrent ? (isStuck ? 'TRAVADO' : 'AQUI') : isNext ? 'próximo' : ''}
                          </div>
                        </div>
                        {wIdx < chainWindow.length - 1 && (
                          <ChevronRight
                            size={11}
                            className="mx-1 shrink-0 -mt-3"
                            style={{ color: isPast ? step.color : '#D0D0E0', opacity: isPast ? 0.5 : 0.8 }}
                          />
                        )}
                      </div>
                    );
                  })}
                  {windowEnd < PRODUCTION_CHAIN.length - 1 && (
                    <span className="text-[#C0C0D0] text-[10px] font-bold ml-2 shrink-0 select-none">···</span>
                  )}
                </div>

                {/* Progress bar */}
                {chainIdx >= 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-[3px] bg-[#E8E6F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((chainIdx + 1) / PRODUCTION_CHAIN.length) * 100}%`,
                          background: isStuck
                            ? 'linear-gradient(90deg, #E17055, #FF4757)'
                            : `linear-gradient(90deg, ${currentChain?.color ?? '#6C5CE7'}88, ${currentChain?.color ?? '#6C5CE7'})`,
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-black shrink-0 tabular-nums" style={{ color: isStuck ? '#FF4757' : '#B0B0C0' }}>
                      {chainIdx + 1}/{PRODUCTION_CHAIN.length}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })
      )}
    </>
  );
}

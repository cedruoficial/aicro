import { useState } from "react";

const SECTORS = [
  {
    id: "pcp",
    name: "PCP",
    icon: "🏭",
    color: "#6C5CE7",
    description: "Planejamento e Controle de Produção",
    subSectors: [
      { name: "Corte", icon: "✂️", status: "ativo", tasks: 12 },
      { name: "Gravação de Tela", icon: "🖼️", status: "ativo", tasks: 8 },
      { name: "Impressão", icon: "🖨️", status: "ativo", tasks: 15 },
      { name: "Revisão", icon: "🔍", status: "alerta", tasks: 3 },
      { name: "Embalagem", icon: "📦", status: "ativo", tasks: 6 },
    ],
  },
  {
    id: "arte",
    name: "Arte / Design",
    icon: "🎨",
    color: "#E17055",
    description: "Criação e validação de artes",
    subSectors: [
      { name: "Criação", icon: "✏️", status: "ativo", tasks: 5 },
      { name: "Aprovação de Arte", icon: "✅", status: "ativo", tasks: 3 },
      { name: "Especificação", icon: "📋", status: "ativo", tasks: 7 },
    ],
  },
  {
    id: "pd",
    name: "P&D",
    icon: "🔬",
    color: "#00B894",
    description: "Pesquisa e Desenvolvimento",
    subSectors: [
      { name: "Desenvolvimento", icon: "⚙️", status: "ativo", tasks: 4 },
      { name: "Validação", icon: "🧪", status: "alerta", tasks: 2 },
      { name: "Escopo de Requisitos", icon: "📑", status: "ativo", tasks: 6 },
    ],
  },
  {
    id: "ctia",
    name: "Qualidade / CTIA",
    icon: "🛡️",
    color: "#0984E3",
    description: "Centro Tecnológico de Inteligência Aplicada",
    subSectors: [
      { name: "Ensaios", icon: "🧪", status: "ativo", tasks: 11 },
      { name: "Aprovação de Amostras", icon: "✅", status: "alerta", tasks: 4 },
      { name: "Ações Corretivas", icon: "🔧", status: "critico", tasks: 2 },
    ],
  },
  {
    id: "laboratorio",
    name: "Laboratório",
    icon: "🧫",
    color: "#FDCB6E",
    description: "Cores, tintas e formulações",
    subSectors: [
      { name: "Definição de Cores", icon: "🎯", status: "ativo", tasks: 3 },
      { name: "Preparação de Tinta", icon: "🪣", status: "ativo", tasks: 5 },
      { name: "Liberação p/ Produção", icon: "🚀", status: "ativo", tasks: 2 },
    ],
  },
  {
    id: "expedicao",
    name: "Expedição",
    icon: "🚚",
    color: "#E84393",
    description: "Logística e envio de pedidos",
    subSectors: [
      { name: "Separação", icon: "📋", status: "ativo", tasks: 8 },
      { name: "Nota Fiscal", icon: "🧾", status: "ativo", tasks: 4 },
      { name: "Envio", icon: "📬", status: "ativo", tasks: 6 },
    ],
  },
];

const FEED_EVENTS = [
  {
    id: 1,
    time: "10:32",
    type: "reprovado",
    sector: "Qualidade / CTIA",
    message: "Ensaio Bally #0847 — Amostra REPROVADA (Aniger)",
    detail: "Resistência à flexão abaixo do mínimo. Ação corretiva requerida.",
    notifyTo: ["pcp", "pd"],
  },
  {
    id: 2,
    time: "10:28",
    type: "aprovado",
    sector: "Qualidade / CTIA",
    message: "Ensaio Veslic #0846 — Amostra APROVADA (Dass)",
    detail: "Todos os parâmetros dentro da especificação.",
    notifyTo: [],
  },
  {
    id: 3,
    time: "10:15",
    type: "info",
    sector: "Laboratório",
    message: "Tinta lote #TK-229 liberada para produção",
    detail: "Cor Pantone 2728C — Cliente Bibi",
    notifyTo: ["pcp"],
  },
  {
    id: 4,
    time: "10:02",
    type: "alerta",
    sector: "PCP",
    message: "Gravação de tela atrasada — Pedido #1192",
    detail: "Cliente Dakota. Previsão original: 09:30. Novo ETA: 11:00.",
    notifyTo: ["expedicao"],
  },
  {
    id: 5,
    time: "09:55",
    type: "info",
    sector: "Arte / Design",
    message: "Arte aprovada — Ref. PMP-2026-041 (Pampili)",
    detail: "Especificação enviada para P&D.",
    notifyTo: ["pd"],
  },
  {
    id: 6,
    time: "09:48",
    type: "reprovado",
    sector: "Qualidade / CTIA",
    message: "Ensaio Hidrólise #0845 — Amostra REPROVADA (Pegada)",
    detail: "Degradação acima do tolerado após 72h. Refazer produção.",
    notifyTo: ["pcp", "laboratorio"],
  },
  {
    id: 7,
    time: "09:30",
    type: "aprovado",
    sector: "Expedição",
    message: "NF-e emitida — Pedido #1188 (Aniger)",
    detail: "7 caixas prontas para coleta. Transportadora: Jadlog.",
    notifyTo: [],
  },
  {
    id: 8,
    time: "09:15",
    type: "info",
    sector: "P&D",
    message: "Novo desenvolvimento registrado — Ref. DK-2026-012",
    detail: "Cliente Dakota. Requisitos definidos, aguardando arte.",
    notifyTo: ["arte"],
  },
];

const statusColor = {
  ativo: "#00B894",
  alerta: "#FDCB6E",
  critico: "#E84393",
};

const typeConfig = {
  reprovado: { color: "#FF4757", bg: "#FFF0F0", label: "REPROVADO", icon: "▼" },
  aprovado: { color: "#00B894", bg: "#F0FFF8", label: "APROVADO", icon: "▲" },
  alerta: { color: "#E17055", bg: "#FFF8F0", label: "ALERTA", icon: "●" },
  info: { color: "#0984E3", bg: "#F0F6FF", label: "INFO", icon: "→" },
};

export default function CTIAPainelGeral() {
  const [expandedSector, setExpandedSector] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState(null);

  const toggleSector = (id) => {
    setExpandedSector(expandedSector === id ? null : id);
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: "#F4F3F8",
      minHeight: "100vh",
      color: "#2D2D3A",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E8E6F0",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 8px rgba(108,92,231,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.2,
          }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: "#A0A0B0", letterSpacing: 1.5, textTransform: "uppercase" }}>Grupo Cromotransfer</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2D2D3A" }}>CTIA</span>
          </div>
          <div style={{ width: 1, height: 32, background: "#E8E6F0", margin: "0 8px" }} />
          <span style={{ fontSize: 13, color: "#8B8BA0", fontWeight: 500 }}>Centro Tecnológico de Inteligência Aplicada</span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["Painel Geral", "Dashboard", "P&D", "Kanban", "PCP", "Config"].map((item, i) => (
            <button key={item} style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: i === 0 ? "#6C5CE7" : "transparent",
              color: i === 0 ? "#FFF" : "#6B6B80",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}>
              {item}
            </button>
          ))}

          {/* CEO BUTTON */}
          <button style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #1A1A2E 0%, #6C5CE7 100%)",
            color: "#FFF",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 8,
            boxShadow: "0 2px 8px rgba(108,92,231,0.3)",
            transition: "all 0.2s",
            letterSpacing: 0.5,
          }}>
            <span style={{ fontSize: 14 }}>📊</span> CEO
          </button>

          {/* NOTIFICATION BELL */}
          <div style={{ position: "relative", marginLeft: 16 }}>
            <button
              onClick={() => { setShowNotifPanel(!showNotifPanel); setNotifications(0); }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid #E8E6F0",
                background: showNotifPanel ? "#6C5CE7" : "#FFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                position: "relative",
                transition: "all 0.2s",
              }}
            >
              <span style={{ filter: showNotifPanel ? "brightness(10)" : "none" }}>🔔</span>
              {notifications > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "#FF4757",
                  color: "#FFF",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #FFF",
                }}>
                  {notifications}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div style={{
                position: "absolute",
                top: 50,
                right: 0,
                width: 340,
                background: "#FFF",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                border: "1px solid #E8E6F0",
                overflow: "hidden",
                zIndex: 200,
              }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F5", fontWeight: 700, fontSize: 14 }}>
                  Notificações
                </div>
                {FEED_EVENTS.filter(e => e.type === "reprovado" || e.type === "alerta").slice(0, 4).map(ev => (
                  <div key={ev.id} style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid #F8F8FB",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      background: typeConfig[ev.type].color,
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#2D2D3A" }}>{ev.message}</div>
                      <div style={{ fontSize: 11, color: "#8B8BA0", marginTop: 2 }}>{ev.time} · {ev.sector}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 24,
        padding: "24px 32px",
        maxWidth: 1440,
        margin: "0 auto",
        minHeight: "calc(100vh - 64px)",
      }}>
        {/* LEFT — SECTOR CARDS */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#2D2D3A" }}>
              Painel Geral
            </h1>
            <p style={{ fontSize: 14, color: "#8B8BA0", margin: "4px 0 0", fontWeight: 500 }}>
              Visão integrada de todos os setores da cadeia produtiva
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {SECTORS.map((sector) => {
              const isExpanded = expandedSector === sector.id;
              const hasAlert = sector.subSectors.some(s => s.status !== "ativo");
              const totalTasks = sector.subSectors.reduce((sum, s) => sum + s.tasks, 0);

              return (
                <div
                  key={sector.id}
                  onClick={() => toggleSector(sector.id)}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    border: isExpanded ? `2px solid ${sector.color}` : "2px solid transparent",
                    boxShadow: isExpanded
                      ? `0 8px 32px ${sector.color}20`
                      : "0 2px 8px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflow: "hidden",
                    gridColumn: isExpanded ? "1 / -1" : "auto",
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: `${sector.color}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                      }}>
                        {sector.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#2D2D3A" }}>
                          {sector.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#8B8BA0", marginTop: 2, fontWeight: 500 }}>
                          {sector.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {hasAlert && (
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: "#FF4757",
                          boxShadow: "0 0 0 3px #FF475720",
                          animation: "pulse 2s infinite",
                        }} />
                      )}
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: `${sector.color}12`,
                        color: sector.color,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        {totalTasks} tarefas
                      </span>
                      <span style={{
                        fontSize: 18,
                        color: "#C0C0D0",
                        transition: "transform 0.3s",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        fontWeight: 700,
                      }}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {/* Expanded Sub-sectors */}
                  {isExpanded && (
                    <div style={{
                      padding: "0 24px 20px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                    }}>
                      {sector.subSectors.map((sub, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "16px 20px",
                            borderRadius: 12,
                            background: "#F8F7FC",
                            border: "1px solid #EEEDF5",
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${sector.color}08`;
                            e.currentTarget.style.borderColor = `${sector.color}40`;
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#F8F7FC";
                            e.currentTarget.style.borderColor = "#EEEDF5";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{sub.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#2D2D3A" }}>{sub.name}</div>
                            <div style={{ fontSize: 11, color: "#8B8BA0", marginTop: 2 }}>{sub.tasks} tarefas ativas</div>
                          </div>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background: statusColor[sub.status],
                            boxShadow: sub.status !== "ativo" ? `0 0 0 3px ${statusColor[sub.status]}30` : "none",
                          }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — REAL-TIME FEED */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "sticky",
          top: 88,
          height: "calc(100vh - 112px)",
        }}>
          {/* Feed Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #F0F0F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#2D2D3A" }}>
                Feed em Tempo Real
              </h2>
              <p style={{ fontSize: 12, color: "#8B8BA0", margin: "2px 0 0", fontWeight: 500 }}>
                Atualizações da cadeia produtiva
              </p>
            </div>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#00B894",
              boxShadow: "0 0 0 3px #00B89420",
            }} />
          </div>

          {/* Feed Items */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 0",
          }}>
            {FEED_EVENTS.map((event) => {
              const config = typeConfig[event.type];
              const isSelected = selectedFeedItem === event.id;

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedFeedItem(isSelected ? null : event.id)}
                  style={{
                    padding: "14px 24px",
                    borderLeft: `3px solid ${config.color}`,
                    margin: "0 0 1px",
                    background: isSelected ? config.bg : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#FAFAFE";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Time + Type Badge */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: "#A0A0B0",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {event.time}
                    </span>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: `${config.color}14`,
                      color: config.color,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                    }}>
                      {config.icon} {config.label}
                    </span>
                    <span style={{
                      fontSize: 10,
                      color: "#C0C0D0",
                      fontWeight: 500,
                    }}>
                      {event.sector}
                    </span>
                  </div>

                  {/* Message */}
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2D2D3A",
                    lineHeight: 1.4,
                  }}>
                    {event.message}
                  </div>

                  {/* Detail (expanded) */}
                  {isSelected && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{
                        fontSize: 12,
                        color: "#6B6B80",
                        lineHeight: 1.5,
                        padding: "8px 12px",
                        background: "#F8F7FC",
                        borderRadius: 8,
                      }}>
                        {event.detail}
                      </div>
                      {event.notifyTo.length > 0 && (
                        <div style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 8,
                          flexWrap: "wrap",
                        }}>
                          <span style={{ fontSize: 11, color: "#A0A0B0", fontWeight: 500 }}>
                            Notificar:
                          </span>
                          {event.notifyTo.map((sId) => {
                            const s = SECTORS.find(sec => sec.id === sId);
                            return s ? (
                              <span key={sId} style={{
                                padding: "2px 8px",
                                borderRadius: 6,
                                background: `${s.color}14`,
                                color: s.color,
                                fontSize: 10,
                                fontWeight: 700,
                              }}>
                                {s.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feed Footer */}
          <div style={{
            padding: "16px 24px",
            borderTop: "1px solid #F0F0F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 12, color: "#A0A0B0", fontWeight: 500 }}>
              {FEED_EVENTS.length} eventos hoje
            </span>
            <button style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#6C5CE7",
              color: "#FFF",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}>
              Ver Histórico
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0D0E0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #A0A0B0; }
      `}</style>
    </div>
  );
}

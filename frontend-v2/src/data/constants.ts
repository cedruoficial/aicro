import type { EventType, StatusType } from '../types';

export const statusColor: Record<StatusType, string> = {
  ativo: "#00B894",
  alerta: "#FDCB6E",
  critico: "#E84393",
};

export const typeConfig: Record<EventType, { color: string; bg: string; label: string; icon: string }> = {
  reprovado: { color: "#FF4757", bg: "#FFF0F0", label: "REPROVADO", icon: "▼" },
  aprovado: { color: "#00B894", bg: "#F0FFF8", label: "APROVADO", icon: "▲" },
  alerta: { color: "#E17055", bg: "#FFF8F0", label: "ALERTA", icon: "●" },
  info: { color: "#0984E3", bg: "#F0F6FF", label: "INFO", icon: "→" },
};

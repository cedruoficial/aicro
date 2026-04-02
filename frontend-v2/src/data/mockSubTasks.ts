// Tarefas mockadas por sub-setor
// Chave: "sectorId::subSectorName"

export type SubTaskStatus = 'bloqueado' | 'aguardando' | 'em_execucao' | 'atrasado' | 'concluido';

export interface SubTask {
  ref: string;
  cliente: string;
  produto: string;
  status: SubTaskStatus;
  origemSetor: string;
  iniciadoEm?: string; // ISO
  slaHoras: number;
}

const h = (hrs: number) => new Date(Date.now() - hrs * 3600000).toISOString();

export const SUBSECTOR_TASKS: Record<string, SubTask[]> = {
  // PRODUÇÃO
  'producao::Laboratório de Cores': [
    { ref: 'PED-0445', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',   status: 'em_execucao', origemSetor: 'P&D',      iniciadoEm: h(1.2), slaHoras: 2 },
    { ref: 'PED-0448', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'aguardando',  origemSetor: 'P&D',      slaHoras: 2 },
    { ref: 'PED-0449', cliente: 'Bibi',      produto: 'Verniz UV Baby',          status: 'bloqueado',   origemSetor: 'P&D',      slaHoras: 2 },
    { ref: 'PED-0450', cliente: 'Dass',      produto: 'Bally Flex Pro',          status: 'atrasado',    origemSetor: 'P&D',      iniciadoEm: h(3.8), slaHoras: 2 },
    { ref: 'PED-0444', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'concluido',   origemSetor: 'P&D',      slaHoras: 2 },
  ],
  'producao::PCP (Planejamento)': [
    { ref: 'PED-0460', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'em_execucao', origemSetor: 'Arte',     iniciadoEm: h(0.8), slaHoras: 1 },
    { ref: 'PED-0461', cliente: 'Olympikus', produto: 'Corrida Xtreme 2026',     status: 'em_execucao', origemSetor: 'Arte',     iniciadoEm: h(0.3), slaHoras: 1 },
    { ref: 'PED-0462', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 1 },
    { ref: 'PED-0463', cliente: 'Aniger',    produto: 'Nike Shox Retro',         status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 1 },
    { ref: 'PED-0464', cliente: 'Bibi',      produto: 'Etiqueta PU Alta Freq',   status: 'bloqueado',   origemSetor: 'Arte',     slaHoras: 1 },
    { ref: 'PED-0465', cliente: 'Dass',      produto: 'Film Matte',              status: 'atrasado',    origemSetor: 'Arte',     iniciadoEm: h(2.5), slaHoras: 1 },
  ],
  'producao::Corte': [
    { ref: 'PED-0470', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'em_execucao', origemSetor: 'PCP',      iniciadoEm: h(0.5), slaHoras: 1 },
    { ref: 'PED-0471', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'aguardando',  origemSetor: 'PCP',      slaHoras: 1 },
    { ref: 'PED-0472', cliente: 'Bibi',      produto: 'Linha Baby Confort 26',   status: 'bloqueado',   origemSetor: 'PCP',      slaHoras: 1 },
    { ref: 'PED-0473', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',    status: 'atrasado',    origemSetor: 'PCP',      iniciadoEm: h(2.1), slaHoras: 1 },
    { ref: 'PED-0474', cliente: 'Olympikus', produto: 'Film Matte Clamshell',    status: 'concluido',   origemSetor: 'PCP',      slaHoras: 1 },
    { ref: 'PED-0475', cliente: 'Vulcabras', produto: 'Transfer Refletivo',      status: 'concluido',   origemSetor: 'PCP',      slaHoras: 1 },
    { ref: 'PED-0476', cliente: 'Dass',      produto: 'Stamping Metálico',       status: 'em_execucao', origemSetor: 'PCP',      iniciadoEm: h(0.2), slaHoras: 1 },
    { ref: 'PED-0477', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'aguardando',  origemSetor: 'PCP',      slaHoras: 1 },
  ],
  'producao::Plotter': [
    { ref: 'PED-0480', cliente: 'Bibi',      produto: 'Etiqueta PU Alta Freq',   status: 'em_execucao', origemSetor: 'Arte',     iniciadoEm: h(1.1), slaHoras: 2 },
    { ref: 'PED-0481', cliente: 'Aniger',    produto: 'Nike Air Force Sub',      status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 2 },
    { ref: 'PED-0482', cliente: 'Dakota',    produto: 'Fila Disruptor GT',       status: 'bloqueado',   origemSetor: 'Arte',     slaHoras: 2 },
    { ref: 'PED-0483', cliente: 'Dass',      produto: 'Bally Test Mix',          status: 'atrasado',    origemSetor: 'Arte',     iniciadoEm: h(3.5), slaHoras: 2 },
    { ref: 'PED-0484', cliente: 'Pegada',    produto: 'Sola Vulcanizada',        status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 2 },
    { ref: 'PED-0485', cliente: 'Vulcabras', produto: 'Refletivo T2',            status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 2 },
  ],
  'producao::Impressão / Sakurai': [
    { ref: 'PED-0445', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',    status: 'em_execucao', origemSetor: 'Corte',    iniciadoEm: h(2.0), slaHoras: 3 },
    { ref: 'PED-0446', cliente: 'Bibi',      produto: 'Etiqueta PU 2c',          status: 'em_execucao', origemSetor: 'Corte',    iniciadoEm: h(0.9), slaHoras: 3 },
    { ref: 'PED-0447', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'aguardando',  origemSetor: 'Corte',    slaHoras: 3 },
    { ref: 'PED-0448', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'aguardando',  origemSetor: 'Corte',    slaHoras: 3 },
    { ref: 'PED-0449', cliente: 'Olympikus', produto: 'Corrida Xtreme',          status: 'bloqueado',   origemSetor: 'Corte',    slaHoras: 3 },
    { ref: 'PED-0450', cliente: 'Dass',      produto: 'Bally Flex',              status: 'atrasado',    origemSetor: 'Corte',    iniciadoEm: h(5.2), slaHoras: 3 },
  ],
  'producao::Revisão': [
    { ref: 'PED-0430', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',    status: 'em_execucao', origemSetor: 'Impressão', iniciadoEm: h(0.4), slaHoras: 1 },
    { ref: 'PED-0431', cliente: 'Bibi',      produto: 'Verniz UV Baby',          status: 'aguardando',  origemSetor: 'Impressão', slaHoras: 1 },
    { ref: 'PED-0432', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'atrasado',    origemSetor: 'Impressão', iniciadoEm: h(1.8), slaHoras: 1 },
    { ref: 'PED-0433', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'aguardando',  origemSetor: 'Impressão', slaHoras: 1 },
    { ref: 'PED-0434', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'concluido',   origemSetor: 'Impressão', slaHoras: 1 },
    { ref: 'PED-0435', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Impressão', slaHoras: 1 },
    { ref: 'PED-0436', cliente: 'Dass',      produto: 'Film Matte',              status: 'em_execucao', origemSetor: 'Impressão', iniciadoEm: h(0.1), slaHoras: 1 },
  ],
  'producao::Embalagem': [
    { ref: 'PED-0410', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',    status: 'em_execucao', origemSetor: 'Revisão',   iniciadoEm: h(0.3), slaHoras: 1 },
    { ref: 'PED-0411', cliente: 'Vulcabras', produto: 'Refletivo T2',            status: 'em_execucao', origemSetor: 'Revisão',   iniciadoEm: h(0.7), slaHoras: 1 },
    { ref: 'PED-0412', cliente: 'Bibi',      produto: 'Linha Baby Confort',      status: 'aguardando',  origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0413', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'aguardando',  origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0414', cliente: 'Olympikus', produto: 'Film Matte',              status: 'bloqueado',   origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0415', cliente: 'Dass',      produto: 'Bally Flex',              status: 'atrasado',    origemSetor: 'Revisão',   iniciadoEm: h(2.3), slaHoras: 1 },
    { ref: 'PED-0416', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0417', cliente: 'Pegada',    produto: 'Sola Vulcanizada',        status: 'concluido',   origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0418', cliente: 'Aniger',    produto: 'Nike Shox Retro',         status: 'aguardando',  origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0419', cliente: 'Bibi',      produto: 'Etiqueta PU',             status: 'aguardando',  origemSetor: 'Revisão',   slaHoras: 1 },
    { ref: 'PED-0420', cliente: 'Dakota',    produto: 'Film Metalizado',         status: 'em_execucao', origemSetor: 'Revisão',   iniciadoEm: h(0.5), slaHoras: 1 },
  ],
  'producao::Apontamento': [
    { ref: 'PED-0440', cliente: 'Aniger',    produto: 'Transfer TX-45',          status: 'em_execucao', origemSetor: 'Embalagem', iniciadoEm: h(0.2), slaHoras: 0.5 },
    { ref: 'PED-0441', cliente: 'Bibi',      produto: 'Linha Baby',              status: 'aguardando',  origemSetor: 'Embalagem', slaHoras: 0.5 },
    { ref: 'PED-0442', cliente: 'Dakota',    produto: 'Sublimação Premium',      status: 'bloqueado',   origemSetor: 'Embalagem', slaHoras: 0.5 },
    { ref: 'PED-0443', cliente: 'Dass',      produto: 'Bally Flex',              status: 'concluido',   origemSetor: 'Embalagem', slaHoras: 0.5 },
  ],
  'producao::TPU': [
    { ref: 'PED-0490', cliente: 'Vulcabras', produto: 'TPU Estrutural Mold.',    status: 'em_execucao', origemSetor: 'P&D',      iniciadoEm: h(1.5), slaHoras: 4 },
    { ref: 'PED-0491', cliente: 'Aniger',    produto: 'TPU Film Transparente',   status: 'aguardando',  origemSetor: 'P&D',      slaHoras: 4 },
    { ref: 'PED-0492', cliente: 'Olympikus', produto: 'TPU Espuma EVA',          status: 'bloqueado',   origemSetor: 'P&D',      slaHoras: 4 },
    { ref: 'PED-0493', cliente: 'Dass',      produto: 'TPU Injetado 2c',         status: 'atrasado',    origemSetor: 'P&D',      iniciadoEm: h(5.0), slaHoras: 4 },
    { ref: 'PED-0494', cliente: 'Bibi',      produto: 'TPU Baby Soft',           status: 'concluido',   origemSetor: 'P&D',      slaHoras: 4 },
    { ref: 'PED-0495', cliente: 'Pampili',   produto: 'TPU Metálico',            status: 'aguardando',  origemSetor: 'P&D',      slaHoras: 4 },
  ],
  'producao::Calçado': [
    { ref: 'PED-0500', cliente: 'Aniger',    produto: 'Sola Completa Nike Sub',  status: 'em_execucao', origemSetor: 'TPU',      iniciadoEm: h(2.0), slaHoras: 5 },
    { ref: 'PED-0501', cliente: 'Dass',      produto: 'Palmilha Bally',          status: 'aguardando',  origemSetor: 'TPU',      slaHoras: 5 },
    { ref: 'PED-0502', cliente: 'Vulcabras', produto: 'Conjunto Estrutural',     status: 'bloqueado',   origemSetor: 'TPU',      slaHoras: 5 },
    { ref: 'PED-0503', cliente: 'Bibi',      produto: 'Sandália Baby',           status: 'atrasado',    origemSetor: 'TPU',      iniciadoEm: h(6.5), slaHoras: 5 },
    { ref: 'PED-0504', cliente: 'Pampili',   produto: 'Tênis Holográfico',       status: 'aguardando',  origemSetor: 'TPU',      slaHoras: 5 },
    { ref: 'PED-0505', cliente: 'Olympikus', produto: 'Corrida Xtreme',          status: 'em_execucao', origemSetor: 'TPU',      iniciadoEm: h(1.0), slaHoras: 5 },
    { ref: 'PED-0506', cliente: 'Pegada',    produto: 'Sola Vulcanizada',        status: 'concluido',   origemSetor: 'TPU',      slaHoras: 5 },
    { ref: 'PED-0507', cliente: 'Dakota',    produto: 'Palmilha Corrida',        status: 'aguardando',  origemSetor: 'TPU',      slaHoras: 5 },
    { ref: 'PED-0508', cliente: 'Aniger',    produto: 'Bota Estrutural',         status: 'aguardando',  origemSetor: 'TPU',      slaHoras: 5 },
  ],
  'producao::Qualidade (CTIA)': [
    { ref: 'PED-0447', cliente: 'Dass',      produto: 'Bally Test Mix',          status: 'em_execucao', origemSetor: 'Revisão',   iniciadoEm: h(0.8), slaHoras: 2 },
    { ref: 'PED-0448', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'atrasado',    origemSetor: 'Embalagem', iniciadoEm: h(3.1), slaHoras: 2 },
    { ref: 'PED-0449', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'aguardando',  origemSetor: 'Impressão', slaHoras: 2 },
  ],
  'producao::Expedição': [
    { ref: 'PED-0420', cliente: 'Aniger',    produto: 'Nike Air Max Sub',        status: 'em_execucao', origemSetor: 'Qualidade', iniciadoEm: h(0.4), slaHoras: 1 },
    { ref: 'PED-0421', cliente: 'Bibi',      produto: 'Etiqueta PU Alta Freq',   status: 'em_execucao', origemSetor: 'Qualidade', iniciadoEm: h(0.6), slaHoras: 1 },
    { ref: 'PED-0422', cliente: 'Dakota',    produto: 'Fila Disruptor GT',       status: 'aguardando',  origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0423', cliente: 'Vulcabras', produto: 'Transfer Refletivo',      status: 'bloqueado',   origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0424', cliente: 'Olympikus', produto: 'Film Matte Clamshell',    status: 'concluido',   origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0425', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0426', cliente: 'Dass',      produto: 'Bally Flex Pro',          status: 'aguardando',  origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0427', cliente: 'Pegada',    produto: 'Sola Vulcanizada',        status: 'concluido',   origemSetor: 'Qualidade', slaHoras: 1 },
    { ref: 'PED-0428', cliente: 'Bibi',      produto: 'Linha Baby Confort',      status: 'aguardando',  origemSetor: 'Qualidade', slaHoras: 1 },
  ],

  // ARTE
  'arte::Criação e Design': [
    { ref: 'PED-0501', cliente: 'Aniger',    produto: 'Nike Air Max Sub',        status: 'em_execucao', origemSetor: 'Comercial', iniciadoEm: h(1.2), slaHoras: 4 },
    { ref: 'PED-0502', cliente: 'Bibi',      produto: 'Linha Baby Confort 26',   status: 'aguardando',  origemSetor: 'Comercial', slaHoras: 4 },
    { ref: 'PED-0503', cliente: 'Olympikus', produto: 'Corrida Xtreme 2026',     status: 'bloqueado',   origemSetor: 'Comercial', slaHoras: 4 },
    { ref: 'PED-0504', cliente: 'Dass',      produto: 'Bally Flex Pro',          status: 'atrasado',    origemSetor: 'Comercial', iniciadoEm: h(6.0), slaHoras: 4 },
    { ref: 'PED-0505', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Comercial', slaHoras: 4 },
  ],
  'arte::Especificação Técnica': [
    { ref: 'PED-0488', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'em_execucao', origemSetor: 'Criação',   iniciadoEm: h(0.5), slaHoras: 2 },
    { ref: 'PED-0489', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'em_execucao', origemSetor: 'Criação',   iniciadoEm: h(1.0), slaHoras: 2 },
    { ref: 'PED-0490', cliente: 'Aniger',    produto: 'Nike Air Force Sub',      status: 'aguardando',  origemSetor: 'Criação',   slaHoras: 2 },
  ],
  'arte::Gravação de Telas': [
    { ref: 'PED-0478', cliente: 'Aniger',    produto: 'Nike Air Max Sub',        status: 'em_execucao', origemSetor: 'Espec.',    iniciadoEm: h(1.8), slaHoras: 3 },
    { ref: 'PED-0479', cliente: 'Dakota',    produto: 'Fila Disruptor GT',       status: 'aguardando',  origemSetor: 'Espec.',    slaHoras: 3 },
    { ref: 'PED-0480', cliente: 'Bibi',      produto: 'Linha Baby Confort',      status: 'atrasado',    origemSetor: 'Espec.',    iniciadoEm: h(4.5), slaHoras: 3 },
    { ref: 'PED-0481', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Espec.',    slaHoras: 3 },
    { ref: 'PED-0482', cliente: 'Dass',      produto: 'Stamping Metálico',       status: 'aguardando',  origemSetor: 'Espec.',    slaHoras: 3 },
    { ref: 'PED-0483', cliente: 'Vulcabras', produto: 'Transfer Refletivo',      status: 'bloqueado',   origemSetor: 'Espec.',    slaHoras: 3 },
    { ref: 'PED-0484', cliente: 'Olympikus', produto: 'Film Matte',              status: 'aguardando',  origemSetor: 'Espec.',    slaHoras: 3 },
  ],

  // P&D
  'pd::Novos Projetos': [
    { ref: 'PED-0470', cliente: 'Dass',      produto: 'Bally Test Mix',          status: 'em_execucao', origemSetor: 'Arte',     iniciadoEm: h(6.0), slaHoras: 8 },
    { ref: 'PED-0471', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'em_execucao', origemSetor: 'Arte',     iniciadoEm: h(2.5), slaHoras: 8 },
    { ref: 'PED-0472', cliente: 'Aniger',    produto: 'Sublimação Premium',      status: 'aguardando',  origemSetor: 'Arte',     slaHoras: 8 },
    { ref: 'PED-0473', cliente: 'Bibi',      produto: 'Film Matte Clamshell',    status: 'bloqueado',   origemSetor: 'Arte',     slaHoras: 8 },
    { ref: 'PED-0474', cliente: 'Olympikus', produto: 'Corrida Xtreme',          status: 'concluido',   origemSetor: 'Arte',     slaHoras: 8 },
    { ref: 'PED-0475', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'atrasado',    origemSetor: 'Arte',     iniciadoEm: h(10.0), slaHoras: 8 },
  ],
  'pd::Homologação': [
    { ref: 'PED-0460', cliente: 'Dass',      produto: 'Bally Test Mix',          status: 'em_execucao', origemSetor: 'Proj.',    iniciadoEm: h(3.0), slaHoras: 4 },
    { ref: 'PED-0461', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'atrasado',    origemSetor: 'Proj.',    iniciadoEm: h(5.8), slaHoras: 4 },
  ],
  'pd::Aprovação de Materiais': [
    { ref: 'PED-0455', cliente: 'Aniger',    produto: 'Transfer TX-45 Verde',    status: 'em_execucao', origemSetor: 'Homolog.', iniciadoEm: h(1.0), slaHoras: 2 },
    { ref: 'PED-0456', cliente: 'Bibi',      produto: 'Linha Baby Confort',      status: 'aguardando',  origemSetor: 'Homolog.', slaHoras: 2 },
    { ref: 'PED-0457', cliente: 'Olympikus', produto: 'Film Matte',              status: 'bloqueado',   origemSetor: 'Homolog.', slaHoras: 2 },
    { ref: 'PED-0458', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'concluido',   origemSetor: 'Homolog.', slaHoras: 2 },
  ],

  // COMERCIAL
  'comercial::Recebimento de Pedidos': [
    { ref: 'PED-0501', cliente: 'Aniger',    produto: 'Nike Air Max Sub',        status: 'em_execucao', origemSetor: 'Cliente',  iniciadoEm: h(0.3), slaHoras: 1 },
    { ref: 'PED-0502', cliente: 'Bibi',      produto: 'Linha Baby Confort 26',   status: 'em_execucao', origemSetor: 'Cliente',  iniciadoEm: h(0.8), slaHoras: 1 },
    { ref: 'PED-0503', cliente: 'Olympikus', produto: 'Corrida Xtreme 2026',     status: 'aguardando',  origemSetor: 'Cliente',  slaHoras: 1 },
    { ref: 'PED-0504', cliente: 'Dass',      produto: 'Bally Flex Pro',          status: 'atrasado',    origemSetor: 'Cliente',  iniciadoEm: h(2.2), slaHoras: 1 },
    { ref: 'PED-0505', cliente: 'Dakota',    produto: 'Fila Disruptor GT',       status: 'aguardando',  origemSetor: 'Cliente',  slaHoras: 1 },
    { ref: 'PED-0506', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'aguardando',  origemSetor: 'Cliente',  slaHoras: 1 },
    { ref: 'PED-0507', cliente: 'Pegada',    produto: 'Sola Vulcanizada 2C',     status: 'concluido',   origemSetor: 'Cliente',  slaHoras: 1 },
    { ref: 'PED-0508', cliente: 'Vulcabras', produto: 'Transfer Refletivo',      status: 'concluido',   origemSetor: 'Cliente',  slaHoras: 1 },
  ],
  'comercial::Faturamento / NF': [
    { ref: 'PED-0400', cliente: 'Aniger',    produto: 'Nike Air Max Sub',        status: 'em_execucao', origemSetor: 'Expedição', iniciadoEm: h(0.2), slaHoras: 1 },
    { ref: 'PED-0401', cliente: 'Bibi',      produto: 'Etiqueta PU Alta Freq',   status: 'em_execucao', origemSetor: 'Expedição', iniciadoEm: h(0.5), slaHoras: 1 },
    { ref: 'PED-0402', cliente: 'Dakota',    produto: 'Fila Disruptor GT',       status: 'aguardando',  origemSetor: 'Expedição', slaHoras: 1 },
    { ref: 'PED-0403', cliente: 'Pampili',   produto: 'Holográfico Star',        status: 'concluido',   origemSetor: 'Expedição', slaHoras: 1 },
  ],
  'comercial::Gestão de Reclamações': [
    { ref: 'PED-0388', cliente: 'Vulcabras', produto: 'Transfer Refletivo T2',   status: 'em_execucao', origemSetor: 'Qualidade', iniciadoEm: h(4.0), slaHoras: 24 },
    { ref: 'PED-0389', cliente: 'Dass',      produto: 'Bally Test Mix',          status: 'atrasado',    origemSetor: 'Qualidade', iniciadoEm: h(30.0), slaHoras: 24 },
  ],
};

# 🚀 Estado do Projeto — Grupo Cromotransfer | Plataforma Industrial

Este documento centraliza todas as atualizações, melhorias e o status atual do sistema.

---

## 🛠️ Stack Tecnológica
- **Core**: React + TypeScript + Vite.
- **Estilização**: Tailwind CSS v4 (Design System moderno).
- **Ícones**: Lucide React.
- **Gráficos**: Recharts (Alta performance).
- **IA**: Google Gemini 2.0 Flash (Analista Estratégico).

---

## ✅ Funcionalidades Implementadas

### Fase 1: Setup Inicial (Vite + TS + Tailwind v4)
- Ambiente configurado para alto desempenho.
- Design System com cores corporativas e tipografia "Outfit".

### Fase 2: Painel Geral (Home)
- Cards de setores consolidados em **4 Pilares** (Comercial, Arte, P&D, Produção).
- Sub-setores do fluxograma distribuídos dentro de cada pilar.

### Fase 3: Dashboard P&D
- KPIs de faturamento e evolução de projetos.
- Tabela interativa com cálculo de Lead Time e status dinâmico.

### Fase 4: Notificações Detalhadas e Feed em Tempo Real
- Feed de eventos agora possui simulação de tempo real (animações injetando novos pushes ao vivo na view `FeedPanel`).
- Adicionado botão interativo e alerta visual para logs históricos.
- Rich Cards expansíveis no feed para eventos críticos, com alertas e botões de ação (Iniciar, Atribuir, Laudo).

### Fase 5: PCP (Agenda Macro Industrial Estilo Google Calendar)
- **Matriz Tempo vs Múltiplos Recursos**: Eixo-Y com Horários (06h às 20h) e Eixo-X estático divididos em 17 máquinas (Sakurai / Atima).
- Layout visual limpo usando *Chip UI* baseada em cores fiéis de branding da marca/cliente.
- "Linha do Agora" flutuante emulando linha temporal viva cruzando os equipamentos baseada na hora exata atual.
- Modal clínico com "Plano de Passadas & Colorimetria" para Serigrafia (Tintas, Telas/Mesh, Necessidade em KG e lógica de montagem).

### Fase 6: Painel Estratégico CEO & Relatório Accountability (PDF)
- Funcionalidade robusta `jspdf-autotable` gerando um "Memorando de Cobrança" com visual profissional.
- Gráficos integrados, Tracking do SLA, Níveis de Assinatura, SMART Targets para líderes de setor, log de ações corretivas.
- Implementado um *mock robusto* e determinístico para bypassar o limite de cota gratuito da API do Gemini, garantindo ambiente seguro de demonstração para o relatório de Accountability.
- Mapa da Cadeia Integrada com detecção visual de Gargalos (TOC).

### Fase 7: Integração de Dados
- [x] Configuração de Proxy no Vite.
- [ ] Criação das rotas API V2 no `server.js`.
- [ ] Mapeamento das tabelas SQLite para os novos dashboards.

### Fase 8: Analista Estratégico (IA) 🤖
- Botão "Analista IA" integrado na aba CEO.
- Geração de "Briefing de Guerra" focado em Lean Manufacturing e TOC.
- Exportação nativa e formatada do Relatório Estratégico via PDF embarcado local.

### Fase 9: Detalhamento por Departamento
- Página dedicada para cada setor (`/setor/:id`) e sub-setor (`/setor/:id/:subId`).
- KPIs de área, gestão de demandas, SLA ao vivo e reporte de impedimentos.

### Fase 10: Orquestração Comercial e Lead Time ⏱️
- **Tela Comercial**: Módulo de entrada de pedidos, triagem e envio para Arte/P&D.
- **Relógio de Setor**: Cronômetros individuais por pedido.

### Fase 11: Busca Global — Cadeia Produtiva Integrada 🔍
- **Barra de Pesquisa Global** no cabeçalho com inteligência visual unindo todos os blocos operacionais na barra de navegação.

### Fase 12: Módulo Insights (Unificação) e Financeiro 💰
- Relatórios Operacionais e **Análise Financeira** fundidos com análises gráficas.
- **Análise Financeira**: Tradução de dados operacionais em custos reais usando indicadores Lean.

### Fase 14: Mobile Excellence & Branding 📱
- **Otimização Responsiva**: Header totalmente adaptado para dispositivos móveis com menu hambúrguer (drawer) e busca em overlay.
- **Identidade Visual Oficial**: Substituição do logo genérico pelo logo real do **Grupo Cromotransfer**, elevando o nível de profissionalismo da plataforma.
- **Gestão de Perfil**: Adição de botão de conta com dropdown para visualização de setor e futura gestão de permissões.

### Fase 15: RH Estratégico (Inspirado YouRH) 👥
- **You Comunica (Mural)**: Widget de avisos internos, aniversariantes e alertas de segurança no topo do RH.
- **You Performa (Desempenho)**: Timeline cronológica de feedbacks, elogios, promoções e advertências por colaborador.
- **Recrutamento Inteligente**: Pipeline de contratação (Triagem até Contratação) conectado automaticamente à análise de gaps de competência dos setores.

### Fase 16: Monitoramento de Materiais (Transit Timeline) 🚚
- Implementação da **Timeline de Trânsito** em todas as páginas de processo (Arte, P&D, Produção), garantindo rastreabilidade do fluxo de materiais.

### Fase 17: Infraestrutura de Rede Local 🌐
- **Servidor V2**: Configuração de backend dedicado na porta 4000 para coexistência com sistema legado.
- **Deploy Facilitado**: Criação de script `PUBLICAR_NA_REDE.bat` para automação de build e distribuição na rede interna.

### Fase 18: Módulo de Produção TPU (Alta Frequência) 🏭
- **Visão por Material e Referência**: Implementação de um dashboard focado em agilidade logística para máquinas manuais e rotativas.
- **Smart Cards**: Cartões dinâmicos com progresso de produção (meta vs. real), identificação de operadora e alertas de notas técnicas.
- **Filtros Avançados**: Sistema de busca e filtragem por tipo de máquina (Manual/Rotativa) para gestão de carga.

---

## 🚧 Próximos Passos (Infraestrutura e Banco de Dados)

- [ ] **Migração Cloud**: Criação da base de dados e schemas via Supabase, descontinuando arquivos SQLite locais.
- [ ] **Deploy Vercel**: Realocar ambiente `frontend-v2` na nuvem integrando requisições Supabase.
- [ ] **Integração Real**: Puxar dados live em OEE.
- [ ] **Autenticação**: Construir JWT/RLS via gateway do Supabase.

---

## 📂 Estrutura do Projeto
- `organizador/frontend-v2/` — Sistema React (Vite + TS + Tailwind).
- `organizador/server-v2.js` — Servidor V2 (Porta 4000).
- `organizador/server.js` — Backend Node.js (API + proxy legado).
- `organizador/ctia.db` — Banco SQLite persistente (Atual).

---
*Última atualização: 07 de Abril de 2026 — Lançamento do Módulo TPU (PCP por Material/Referência).*

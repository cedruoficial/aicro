# PLANO DE IMPLEMENTAÇÃO — Sistema Integrado CTIA
## Grupo Cromotransfer · Centro Tecnológico de Inteligência Aplicada

---

## CONTEXTO

O Grupo Cromotransfer já possui um sistema CTIA com as seguintes telas funcionais:
- **Dashboard** — métricas de ensaios (aprovados/reprovados), gráficos por tipo de ensaio (Bally, Veslic, Dinamômetro, Hidrólise)
- **P&D** — gestão de pesquisa e desenvolvimento
- **Kanban** — gestão visual de tarefas
- **PCP** — Planejamento e Controle de Produção (antigo "Produção")
- **Config** — configurações do sistema
- **Tela de Clientes** — cards com logos das marcas (Aniger, Bibi, Dakota, Dass, Dilly Sports, Pampili, Pegada, Planet Shoes, Vulcabras, etc.)

O objetivo agora é **acrescentar novas telas** ao sistema existente para gerenciar toda a cadeia produtiva de forma integrada.

---

## FLUXO DA EMPRESA (Base do Sistema)

O fluxo integrado segue esta cadeia:

```
Comercial → P&D → Arte/Design → Laboratório (Cores/Tinta) → PCP (Produção) → CTIA (Qualidade) → Expedição
```

### Setores e Sub-setores:

1. **PCP (Planejamento e Controle de Produção)**
   - Corte
   - Gravação de Tela
   - Impressão
   - Revisão
   - Embalagem

2. **Arte / Design**
   - Criação de Arte
   - Aprovação de Arte
   - Especificação Técnica

3. **P&D (Pesquisa e Desenvolvimento)**
   - Desenvolvimento
   - Validação
   - Escopo de Requisitos

4. **Qualidade / CTIA**
   - Ensaios (Bally, Veslic, Dinamômetro, Hidrólise, Outros)
   - Aprovação de Amostras
   - Ações Corretivas

5. **Laboratório**
   - Definição de Cores
   - Preparação de Tinta
   - Liberação para Produção

6. **Expedição**
   - Separação de Pedidos
   - Emissão de Nota Fiscal
   - Envio / Logística

---

## TELA 1 — PAINEL GERAL (Nova Home do Sistema)

### Layout: Grid de 2 colunas

**COLUNA ESQUERDA (70%) — Cards de Setores:**
- 6 cards representando cada setor da cadeia produtiva
- Cada card mostra: ícone, nome do setor, descrição curta, contagem de tarefas ativas, indicador de alerta (bolinha pulsante vermelha se houver pendências)
- **Ao clicar no card**: ele expande ocupando a largura total e mostra os sub-setores como cards menores internos
- Cada sub-setor mostra: ícone, nome, quantidade de tarefas, status (verde=ativo, amarelo=alerta, vermelho=crítico)
- Os sub-setores são clicáveis e levarão futuramente à tela específica do departamento

**COLUNA DIREITA (30%) — Feed em Tempo Real:**
- Painel fixo estilo "home broker" com scroll vertical
- Cada evento mostra: horário, badge de tipo (APROVADO/REPROVADO/ALERTA/INFO), setor de origem, mensagem resumida
- Ao clicar num evento: expande mostrando detalhes e quais setores foram notificados
- Borda lateral colorida por tipo de evento (verde=aprovado, vermelho=reprovado, laranja=alerta, azul=info)
- Footer com contagem de eventos do dia + botão "Ver Histórico"

**HEADER:**
- Logo Grupo Cromotransfer + "CTIA"
- Navegação: Painel Geral (ativo), Dashboard, P&D, Kanban, PCP, Config
- **Botão "CEO"** — destaque visual separado dos outros botões (cor diferenciada, ícone de coroa ou gráfico), posicionado à esquerda do sino de notificação. Ao clicar, abre a Tela CEO (Painel Estratégico)
- Ícone de notificação (sino) com badge de contagem
- Ao clicar no sino: dropdown com as notificações pendentes (reprovações e alertas)

### Especificações de Design:
- **Paleta**: Roxo principal (#6C5CE7), fundo cinza claro (#F4F3F8), cards brancos
- **Cores dos setores**: PCP=#6C5CE7, Arte=#E17055, P&D=#00B894, CTIA=#0984E3, Laboratório=#FDCB6E, Expedição=#E84393
- **Tipografia**: DM Sans (ou equivalente limpa)
- **Cards**: border-radius 16px, sombras suaves, transição smooth ao expandir
- **Feed**: border-left colorida por tipo, animação pulse no indicador "ao vivo"

---

## DASHBOARD — INTELIGÊNCIA ANALÍTICA P&D

O Dashboard já existente deve ser expandido com uma seção de **Análise por Projeto de P&D**.
Essa seção fornece visão de desempenho de cada projeto desde o desenvolvimento até o retorno financeiro.

### KPIs por Projeto (cards no topo):
- **Total de Projetos Ativos** — quantos projetos estão em andamento
- **Em Produção** — quantos já passaram para a linha de produção
- **Em Desenvolvimento** — quantos ainda estão na fase de P&D
- **Ticket Médio de Retorno** — média de faturamento por projeto

### Tabela de Projetos com as seguintes colunas:
| Campo | Descrição |
|---|---|
| Referência | Código do projeto (ex: DK-2026-012) |
| Cliente | Nome do cliente (ex: Dakota, Aniger) |
| Status | Em Desenvolvimento / Em Produção / Concluído / Cancelado |
| Data de Início | Quando o projeto entrou no P&D |
| Data de Entrada em Produção | Quando saiu do P&D e foi para produção |
| Tempo de Desenvolvimento | Cálculo automático (dias entre início e entrada em produção) |
| Faturamento Realizado (R$) | Quanto já vendeu pro cliente desde que entrou em produção |
| Projeção de Faturamento (R$) | Estimativa de faturamento futuro baseada no ritmo de vendas atual |
| Margem de Retorno (%) | Percentual de retorno sobre o custo de desenvolvimento |

### Gráficos:
- **Tempo de Desenvolvimento por Projeto** — gráfico de barras horizontal mostrando quantos dias cada projeto levou
- **Faturamento Realizado vs Projeção** — gráfico de barras agrupado por projeto (barra cheia = realizado, barra transparente = projeção)
- **Evolução de Faturamento** — gráfico de linha por mês, agrupado por cliente
- **Top 5 Projetos por Retorno** — ranking dos projetos que mais geraram faturamento

### Filtros:
- Por cliente
- Por período (mês/trimestre/ano)
- Por status do projeto (todos, em desenvolvimento, em produção, concluído)

---

## TELA PCP — CALENDÁRIO DINÂMICO DE PRODUÇÃO

A tela de PCP (antigo "Produção") deve ser totalmente reformulada. O componente central é um **Calendário Dinâmico** estilo Google Calendar, que funciona como o coração do planejamento e controle de produção.

### Visão Principal — Calendário do Dia (Padrão)

A tela abre por padrão na **visão do dia atual**, mostrando toda a programação de produção daquela data.

**Layout do Calendário:**
- Estilo timeline vertical (igual Google Calendar), com horários na coluna esquerda (06:00 às 22:00)
- Cada máquina/linha de produção é uma coluna horizontal (ex: Máquina 1, Máquina 2, Máquina 3...)
- Os blocos de produção aparecem como cards posicionados no horário correto, com altura proporcional à duração
- Os blocos se movimentam/atualizam em tempo real conforme a produção avança

**Informações em cada bloco de produção:**
| Campo | Descrição |
|---|---|
| Referência do Pedido | Código do pedido (ex: PED-2026-0445) |
| Cliente | Nome do cliente (ex: Aniger) |
| Produto | Descrição do produto sendo produzido |
| Máquina | Qual máquina/linha está alocada |
| Horário Programado | Início e fim previstos (ex: 08:00 - 10:30) |
| Status | Programado / Em Preparação / Em Produção / Concluído / Atrasado |
| Progresso | Barra de progresso visual (%) |

**Cores dos blocos por status:**
- Cinza claro = Programado (futuro)
- Amarelo = Em Preparação (setup)
- Azul/Roxo = Em Produção (ativo)
- Verde = Concluído
- Vermelho = Atrasado

### Sistema de Notificações Automáticas Pré-Produção

**REGRA PRINCIPAL:** 30 minutos antes do horário programado de cada produção, o sistema dispara notificações automáticas para os setores de apoio prepararem tudo. Objetivo: **reduzir o tempo de setup de máquina**.

**Fluxo de notificação pré-produção:**
```
T-30min → Notificação automática disparada:
  → Laboratório/Tinta: "Preparar tinta [referência] para Máquina X às [horário]"
  → Preparação de Utensílios: "Separar utensílios para pedido [ref] — Máquina X às [horário]"
  → Gravação de Tela: "Tela [ref] precisa estar pronta para Máquina X às [horário]"

T-15min → Lembrete de confirmação:
  → Cada setor notificado deve confirmar que está pronto (botão "Pronto" na notificação)
  → Se não confirmar, alerta escala para supervisor

T-0 → Início programado:
  → Status do bloco muda para "Em Produção"
  → Cronômetro inicia
  → Se preparação não confirmada: bloco fica VERMELHO com alerta "Setup pendente"
```

**Dados da notificação pré-produção:**
| Campo | Exemplo |
|---|---|
| Tipo | ⏰ PREPARAÇÃO DE PRODUÇÃO |
| Pedido | PED-2026-0445 — Aniger |
| Produto | Transfer termocolante modelo XK-33 |
| Máquina | Máquina 2 |
| Horário Previsto | 10:00 |
| Tinta Necessária | Pantone 2728C — Lote TK-229 |
| Utensílios | Tela gravada ref. TL-0887, espátula 30cm, base magnética |
| Ação | Preparar setup completo até 09:45 |

### Navegação Temporal — Histórico e Programação Futura

O calendário mantém **todo o histórico** e permite **programação futura**:

**Controles de navegação:**
- Botões: ◀ Anterior | HOJE | Próximo ▶
- Seletor de visão: **Dia** (padrão) | Semana | Mês
- Campo de data para pular direto para uma data específica
- Busca por pedido, cliente ou referência

**Visão do Dia (padrão):**
- Timeline com todas as produções daquele dia
- Blocos em tempo real para o dia atual
- Blocos históricos com dados de conclusão para dias passados
- Blocos programados para dias futuros

**Visão da Semana:**
- 7 colunas (Seg-Dom), cada uma mostrando os blocos resumidos
- Indicadores visuais de carga (barra de ocupação por dia)
- Possibilidade de arrastar blocos entre dias para reprogramar

**Visão do Mês:**
- Grade mensal com indicadores de quantidade de produções por dia
- Código de cor: verde=dia tranquilo, amarelo=carga média, vermelho=carga alta
- Clicar num dia abre a visão de dia

### Histórico de Produção

Para cada produção concluída, o sistema armazena:
| Campo | Descrição |
|---|---|
| Horário Real de Início | Quando realmente começou (pode diferir do programado) |
| Horário Real de Fim | Quando realmente terminou |
| Tempo de Setup | Quanto tempo levou para preparar a máquina |
| Tempo de Produção Efetivo | Duração real da produção |
| Atraso (se houver) | Diferença entre programado e real |
| Motivo do Atraso | Classificação (setup, material, máquina, qualidade) |
| Operador | Quem operou a máquina |
| Quantidade Produzida | Unidades produzidas |
| Quantidade Programada | Unidades que deviam ser produzidas |
| Eficiência (%) | Produzido / Programado × 100 |

### KPIs do PCP (topo da tela):
- **Produções do Dia** — total programado vs concluído
- **Tempo Médio de Setup** — média do dia (meta: reduzir com as notificações antecipadas)
- **Eficiência Geral** — % de produção realizada vs programada
- **Atrasos** — quantas produções estão/ficaram atrasadas
- **Máquinas Ativas** — quantas máquinas estão operando agora

---

## TELA CEO — PAINEL ESTRATÉGICO DE GESTÃO INDUSTRIAL

Tela acessível pelo **botão "CEO"** no header. Visão estratégica completa da operação, baseada em metodologias de gestão industrial: Lean Manufacturing (Toyota Production System), Teoria das Restrições (TOC), OEE, Kanban e melhoria contínua (Kaizen). Esta tela é a "sala de guerra" do CEO — tudo que ele precisa saber sobre a saúde da empresa numa única visão.

### Layout: 4 áreas principais

---

### ÁREA 1 — INDICADORES-CHAVE (Topo da tela, cards grandes)

**6 KPIs estratégicos em cards com sparkline (mini-gráfico de tendência dos últimos 30 dias):**

| KPI | O que mede | Cálculo | Meta sugerida |
|---|---|---|---|
| **OEE (Eficiência Global)** | Performance geral das máquinas | Disponibilidade × Performance × Qualidade | ≥ 85% |
| **OTIF (On Time In Full)** | Entregas no prazo e completas | Pedidos entregues no prazo / Total de pedidos × 100 | ≥ 95% |
| **Lead Time Médio** | Tempo total do pedido até a entrega | Média de dias entre entrada do pedido e expedição | Reduzir mês a mês |
| **First Pass Yield** | Qualidade na primeira passada | Produtos aprovados na 1ª inspeção / Total produzido × 100 | ≥ 90% |
| **Custo da Não Qualidade (COPQ)** | Quanto custa os erros | Soma de retrabalho + refugo + devoluções + horas extras por correção (R$) | Reduzir mês a mês |
| **Faturamento vs Meta** | Performance comercial | Faturamento realizado / Meta do período × 100 | ≥ 100% |

Cada card mostra: valor atual, variação vs mês anterior (↑↓%), cor de status (verde/amarelo/vermelho), sparkline de tendência.

---

### ÁREA 2 — MAPA DA CADEIA PRODUTIVA (Centro-esquerda)

Diagrama visual interativo mostrando toda a cadeia como um fluxo horizontal:

```
[Comercial] → [P&D] → [Arte] → [Laboratório] → [PCP] → [CTIA] → [Expedição]
```

**Cada bloco do fluxo mostra em tempo real:**
| Informação | Descrição |
|---|---|
| Status do setor | Cor: Verde=fluindo / Amarelo=atenção / Vermelho=gargalo |
| WIP (Work in Progress) | Quantos itens estão naquele setor neste momento |
| Tempo médio de permanência | Quanto tempo os itens ficam naquele setor (média) |
| Throughput | Quantos itens saíram desse setor hoje |
| Gargalo (Bottleneck) | Se o WIP está acumulando ali, o bloco fica vermelho pulsante com ícone de alerta |

**Lógica de identificação de gargalo (Teoria das Restrições - TOC):**
- Se o WIP de um setor é > 2x a média histórica → setor é classificado como GARGALO
- Se o throughput de um setor é < 70% do setor anterior → setor é classificado como GARGALO
- Seta entre setores muda de cor: verde=fluxo normal, vermelho=acúmulo detectado

**Ao clicar em qualquer bloco do fluxo:** abre um painel lateral com detalhes daquele setor (top 5 itens parados, motivo, responsável).

---

### ÁREA 3 — ANÁLISES LEAN / TOYOTA (Centro-direita)

Seção com abas navegáveis, cada uma trazendo uma análise baseada em metodologia industrial:

#### Aba 1 — 7 Desperdícios (Muda) — Baseado no Toyota Production System

Gráfico de barras horizontal mostrando a quantidade/impacto de cada tipo de desperdício identificado no período:

| Desperdício (Muda) | O que rastrear no contexto da Cromotransfer |
|---|---|
| **Superprodução** | Produção acima do pedido / itens produzidos sem demanda confirmada |
| **Espera** | Tempo de máquina parada aguardando setup, tinta, tela ou material |
| **Transporte** | Movimentações desnecessárias de material entre setores |
| **Processamento excessivo** | Retrabalhos, produções refeitas, ajustes em arte/cor após início |
| **Estoque** | Material parado no WIP entre setores, tintas preparadas não utilizadas |
| **Movimentação** | Deslocamento desnecessário de operadores (mapeável futuramente com IoT) |
| **Defeitos** | Reprovações no CTIA, reclamações de cliente, devoluções |

Cada barra mostra: quantidade de ocorrências + custo estimado (R$) do desperdício.
Filtros: por período (semana/mês/trimestre) e por setor.

#### Aba 2 — Eficiência por Setor (OEE Detalhado)

Tabela com cada setor/máquina mostrando:

| Campo | Descrição |
|---|---|
| Disponibilidade (%) | Tempo que a máquina/setor esteve disponível vs tempo planejado |
| Performance (%) | Velocidade real vs velocidade ideal |
| Qualidade (%) | Itens bons na primeira vs total produzido |
| OEE (%) | Disponibilidade × Performance × Qualidade |
| Classificação | CLASSE MUNDIAL (≥85%) / BOM (65-84%) / REGULAR (40-64%) / CRÍTICO (<40%) |

Gráfico radar (spider chart) comparando os setores entre si.
Gráfico de evolução do OEE ao longo do tempo (linha por setor).

#### Aba 3 — Takt Time vs Cycle Time

Análise de ritmo da produção:

| Métrica | Descrição |
|---|---|
| **Takt Time** | Ritmo necessário para atender a demanda. Cálculo: Tempo disponível / Demanda do cliente |
| **Cycle Time** | Tempo real para produzir uma unidade em cada etapa |
| **Comparativo** | Se Cycle Time > Takt Time → setor não atende a demanda → GARGALO |

Gráfico de barras comparativo: Takt Time (linha horizontal de referência) vs Cycle Time de cada etapa.
Setas vermelhas nos setores onde Cycle Time ultrapassa o Takt Time.

#### Aba 4 — Kanban Visual da Cadeia

Visão estilo Kanban com colunas representando cada setor da cadeia:

```
| Comercial | P&D | Arte | Laboratório | PCP | CTIA | Expedição | ENTREGUE |
| (cards)   | ... | ...  | ...         | ... | ...  | ...       | ...      |
```

Cada card é um pedido/projeto que se move pelas colunas conforme avança na cadeia.
Cards mostram: referência, cliente, dias naquela etapa, prioridade.
Cards vermelhos = parados há mais tempo que o limite (configurável).
Limite WIP por coluna (se excedido, coluna fica com borda vermelha — princípio Kanban).

#### Aba 5 — Kaizen (Melhoria Contínua)

Painel de acompanhamento de melhorias implementadas:

| Campo | Descrição |
|---|---|
| Problema identificado | Descrição do problema (ex: "Setup médio de 45min na Máquina 2") |
| Causa raiz | Análise (ex: "Tinta chegava atrasada do laboratório") |
| Ação implementada | O que foi feito (ex: "Notificação T-30min para laboratório") |
| Data de implementação | Quando a melhoria entrou em vigor |
| Resultado antes | Métrica antes da melhoria (ex: "Setup médio: 45min") |
| Resultado depois | Métrica após a melhoria (ex: "Setup médio: 18min") |
| Impacto (R$) | Economia ou ganho estimado (ex: "R$ 12.400/mês") |
| Status | Em observação / Confirmado / Revertido |

Gráfico de evolução: timeline de melhorias implementadas com impacto acumulado (R$).

---

### ÁREA 4 — ALERTAS ESTRATÉGICOS E AÇÕES (Coluna direita ou rodapé)

Painel de inteligência que cruza dados e gera alertas automaticamente para o CEO:

**Tipos de alertas automáticos:**

| Alerta | Gatilho | Exemplo |
|---|---|---|
| 🔴 **Gargalo Crítico** | WIP acumulando em setor > 3x a média | "PCP com 23 itens parados — média é 7. Investigar causa." |
| 🟡 **OEE em Queda** | OEE de setor caiu > 10% vs semana anterior | "Máquina 3: OEE caiu de 82% para 68%. Verificar disponibilidade." |
| 🔴 **OTIF em Risco** | Previsão de entregas atrasadas > 5% | "4 pedidos com risco de atraso esta semana. Priorizar expedição." |
| 🟡 **Custo de Não Qualidade Alto** | COPQ > 5% do faturamento do período | "Não qualidade custou R$ 18.200 este mês (6,2% do faturamento)." |
| 🟢 **Melhoria Confirmada** | Kaizen com resultado positivo confirmado | "Setup médio reduziu 60% após implementação de notificação T-30min." |
| 🔴 **Reclamação Recorrente** | Mesmo cliente reclamou > 2x no trimestre | "Aniger: 3ª reclamação de qualidade. Agendar reunião com CTIA." |
| 🟡 **Lead Time Crescente** | Lead Time médio subiu > 15% vs mês anterior | "Lead Time subiu de 5,2 para 6,8 dias. Analisar gargalos." |
| 🟢 **Meta Batida** | Faturamento atingiu ou superou meta | "Faturamento de março atingiu 108% da meta. Parabéns!" |

Cada alerta tem: ícone de prioridade, descrição, setor envolvido, botão "Ver Detalhes" e botão "Atribuir Ação".

### Especificações de Design da Tela CEO:
- **Fundo**: Escuro/dark mode (#1A1A2E ou #0F0F1A) para diferenciar das demais telas e dar aspecto de "war room"
- **Acento**: Roxo (#6C5CE7) como cor principal de destaque
- **KPI cards**: Fundo translúcido com glassmorphism sutil, sparklines em cor de acento
- **Mapa da cadeia**: Blocos conectados por setas animadas, pulso visual nos gargalos
- **Gráficos**: Estilo clean com cores vibrantes sobre fundo escuro (recharts ou d3)
- **Alertas**: Cards com borda lateral colorida por prioridade, fundo sutilmente colorido
- **Botão CEO no header**: Fundo gradiente escuro (#1A1A2E → #6C5CE7), texto branco, ícone de gráfico de barras, destaque visual separado dos outros botões de nav

---

## TELA 2 — DETALHES POR DEPARTAMENTO (A definir)

Será construída após definição dos campos específicos de cada departamento. Estrutura prevista:
- Header com nome do setor e breadcrumb de volta ao Painel Geral
- KPIs específicos do setor
- Tabela/Kanban de tarefas do setor
- Filtros por cliente, período, status
- Integração com o feed de notificações

---

## SISTEMA DE NOTIFICAÇÕES (Lógica)

### Regras de notificação por evento:
| Evento | Quem é notificado |
|---|---|
| Amostra REPROVADA pelo CTIA | PCP, P&D |
| Tinta liberada pelo Laboratório | PCP |
| Gravação atrasada no PCP | Expedição |
| Arte aprovada pelo Design | P&D |
| Ensaio reprovado (Hidrólise, Bally, etc.) | PCP, Laboratório |
| NF emitida pela Expedição | — (registro apenas) |
| Novo desenvolvimento registrado no P&D | Arte/Design |
| Reclamação de cliente registrada | CTIA, PCP |
| **Produção programada em 30min** | **Laboratório (Tinta), Preparação de Utensílios** |
| **Produção iniciada** | **Expedição, CTIA** |
| **Produção concluída** | **CTIA (Qualidade), Expedição** |

### Comportamento:
- Cada setor vê apenas as notificações relevantes para ele
- Badge numérico no ícone de sino
- Notificações novas aparecem automaticamente no feed
- Notificações podem ser marcadas como "lidas"

### DETALHAMENTO DE NOTIFICAÇÕES — Eventos Críticos (Reprovações)

Quando um material é REPROVADO, a notificação expandida no feed deve exibir um card detalhado com TODOS os dados necessários para ação imediata. Campos obrigatórios:

| Campo | Descrição | Exemplo |
|---|---|---|
| **Responsáveis (Quem deve atuar)** | Setores e pessoas responsáveis pela ação | PCP (João Silva), P&D (Maria Santos) |
| **Onde Atuar** | Setor/etapa da cadeia onde a correção deve ser feita | Gravação de Tela → Impressão |
| **Identificação do Material** | Referência, lote, cliente e descrição do material | Ref: ANI-2026-033, Lote: #LT-0847, Cliente: Aniger |
| **Tipo de Problema** | Classificação do defeito encontrado | Resistência à flexão abaixo do mínimo (Ensaio Bally) |
| **Ação Corretiva Requerida** | O que deve ser feito para corrigir | Refazer produção com nova tinta lote TK-230. Ajustar pressão de gravação. |
| **Prazo para Correção** | Deadline para resolver | 48h — Vencimento: 03/04/2026 |
| **Prioridade** | Nível de urgência | ALTA / MÉDIA / BAIXA |

### Layout visual da notificação expandida:
- Card com borda vermelha à esquerda (para reprovação)
- Header: badge "REPROVADO" + horário + referência do material
- Corpo dividido em seções: Identificação → Problema → Ação → Responsáveis
- Botões de ação: "Iniciar Correção", "Atribuir Responsável", "Ver Ensaio Completo"
- Indicador de prazo com cor dinâmica (verde=dentro do prazo, amarelo=próximo, vermelho=vencido)

---

## INSTRUÇÕES PARA O ANTIGRAVITY

### Passo 1 — Setup Inicial
```
Crie este projeto como uma aplicação web moderna usando React + TypeScript.
Use Tailwind CSS para estilização.
A estrutura de pastas deve seguir:
/src
  /components
    /layout (Header, Sidebar)
    /painel-geral (SectorCard, SubSectorCard, FeedPanel, FeedItem, NotificationBell, NotificationDetail)
    /dashboard (KPICard, ProjectTable, DevTimeChart, RevenueChart, RevenueEvolution, TopProjects, Filters)
    /pcp (DynamicCalendar, ProductionBlock, TimelineView, WeekView, MonthView, SetupNotification, ProductionHistory, MachineColumn)
    /ceo (StrategicKPI, SupplyChainMap, MudaChart, OEETable, OEERadar, TaktCycleChart, KanbanChain, KaizenTracker, StrategicAlerts, BottleneckDetector)
    /shared (Badge, StatusDot, Card, PriorityBadge, DeadlineIndicator, ProgressBar, DateNavigator, SparkLine, GlassCard)
  /data (sectors.ts, feedEvents.ts, notifications.ts, projects.ts, productions.ts, machines.ts, ceoMetrics.ts, kaizen.ts)
  /types (sector.ts, event.ts, notification.ts, project.ts, production.ts, machine.ts, ceoMetric.ts, kaizen.ts)
  /pages (PainelGeral.tsx, Dashboard.tsx, PCP.tsx, CEO.tsx)
```

### Passo 2 — Implementar Tela "Painel Geral"
```
Implemente a tela conforme o protótipo React fornecido no arquivo ctia-painel-geral.jsx.
Mantenha o layout de 2 colunas: cards de setores à esquerda, feed em tempo real à direita.
Os cards de setor devem expandir ao clicar mostrando sub-setores.
O feed deve ter scroll independente e border colorida por tipo de evento.
O sino de notificação deve abrir um dropdown com alertas pendentes.
```

### Passo 3 — Implementar Dashboard P&D (Análise por Projeto)
```
Expanda o Dashboard existente com uma seção "Inteligência P&D".
Adicione 4 KPI cards no topo: Total de Projetos Ativos, Em Produção, Em Desenvolvimento, Ticket Médio de Retorno.
Crie uma tabela de projetos com colunas: Referência, Cliente, Status, Data Início, Data Produção,
Tempo de Desenvolvimento (calculado), Faturamento Realizado, Projeção de Faturamento, Margem de Retorno.
Adicione gráficos: Tempo de Desenvolvimento por Projeto (barras), Faturamento Realizado vs Projeção (barras agrupadas),
Evolução de Faturamento mensal (linha), Top 5 Projetos por Retorno (ranking).
Adicione filtros por: cliente, período, status do projeto.
Use dados mockados mas com estrutura pronta para API.
```

### Passo 4 — Implementar Notificações Detalhadas (Reprovações)
```
Quando um evento do tipo REPROVADO for clicado no feed da Home, o card expandido deve mostrar:
- Responsáveis: quem deve atuar (setor + pessoa)
- Onde Atuar: etapa da cadeia produtiva
- Identificação do Material: referência, lote, cliente
- Tipo de Problema: classificação do defeito
- Ação Corretiva: o que fazer para resolver
- Prazo para Correção: deadline com indicador visual de urgência
- Prioridade: ALTA / MÉDIA / BAIXA com badge colorido
Adicione botões de ação: "Iniciar Correção", "Atribuir Responsável", "Ver Ensaio Completo".
```

### Passo 5 — Implementar Tela PCP (Calendário Dinâmico)
```
Substitua a tela "Produção" por "PCP" na navegação.
Implemente um calendário dinâmico estilo Google Calendar com:

VISÃO DO DIA (padrão):
- Timeline vertical com horários (06:00-22:00) na coluna esquerda
- Cada máquina/linha de produção como uma coluna
- Blocos de produção posicionados por horário, com altura proporcional à duração
- Blocos mostram: referência, cliente, produto, máquina, horário, status e barra de progresso
- Cores por status: cinza=programado, amarelo=preparação, azul/roxo=em produção, verde=concluído, vermelho=atrasado
- Blocos se atualizam em tempo real

NAVEGAÇÃO TEMPORAL:
- Botões Anterior/Hoje/Próximo para navegar entre dias
- Seletor de visão: Dia | Semana | Mês
- Visão Semana: 7 colunas com blocos resumidos e barra de ocupação
- Visão Mês: grade com indicadores de carga por dia (verde/amarelo/vermelho)
- Busca por pedido, cliente ou referência
- Manter todo o histórico navegável para trás

NOTIFICAÇÕES PRÉ-PRODUÇÃO:
- T-30min: notificação automática para Laboratório (tinta), Preparação (utensílios), Gravação (tela)
- T-15min: lembrete de confirmação — cada setor deve clicar "Pronto"
- T-0: status muda para "Em Produção", cronômetro inicia
- Se preparação não confirmada: bloco fica vermelho com alerta "Setup pendente"

HISTÓRICO:
- Cada produção concluída armazena: horários reais, tempo de setup, atraso, motivo, operador, quantidade, eficiência
- Dados acessíveis ao navegar para datas passadas

KPIs NO TOPO:
- Produções do Dia (programado vs concluído)
- Tempo Médio de Setup
- Eficiência Geral (%)
- Atrasos
- Máquinas Ativas

Use dados mockados com estrutura pronta para API em tempo real (WebSocket futuramente).
```

### Passo 6 — Implementar Tela CEO (Painel Estratégico)
```
Crie a tela CEO acessível pelo botão "CEO" no header.
IMPORTANTE: Esta tela usa DARK MODE (fundo #1A1A2E) para diferenciar das demais.

ÁREA 1 — KPIs ESTRATÉGICOS (topo):
6 cards com glassmorphism: OEE Geral, OTIF, Lead Time Médio, First Pass Yield, COPQ, Faturamento vs Meta.
Cada card mostra: valor, variação vs mês anterior (↑↓%), sparkline de 30 dias, cor de status.

ÁREA 2 — MAPA DA CADEIA (centro-esquerda):
Diagrama horizontal interativo: Comercial → P&D → Arte → Laboratório → PCP → CTIA → Expedição.
Cada bloco mostra: status (cor), WIP, tempo médio, throughput.
Lógica de gargalo: se WIP > 2x média → bloco fica vermelho pulsante.
Setas entre blocos mudam de cor conforme fluxo (verde=ok, vermelho=acúmulo).
Clicar no bloco abre painel lateral com top 5 itens parados.

ÁREA 3 — ANÁLISES LEAN (centro-direita, abas):
Aba 1: 7 Desperdícios (Muda) — gráfico de barras: superprodução, espera, transporte,
processamento excessivo, estoque, movimentação, defeitos. Cada barra com quantidade + custo R$.
Aba 2: OEE Detalhado — tabela por setor/máquina (disponibilidade, performance, qualidade, OEE).
Spider chart comparativo + evolução temporal.
Aba 3: Takt Time vs Cycle Time — barras com linha de referência do Takt. Destaque vermelho onde
Cycle > Takt.
Aba 4: Kanban da Cadeia — colunas por setor com cards de pedidos que se movem. Limite WIP por coluna.
Cards vermelhos se parados além do limite.
Aba 5: Kaizen — tabela de melhorias (problema, causa raiz, ação, resultado antes/depois,
impacto R$). Timeline com impacto acumulado.

ÁREA 4 — ALERTAS ESTRATÉGICOS (coluna direita):
Cards de alertas automáticos: Gargalo Crítico, OEE em Queda, OTIF em Risco, COPQ Alto,
Reclamação Recorrente, Lead Time Crescente, Meta Batida, Melhoria Confirmada.
Cada alerta: prioridade, descrição, setor, botões "Ver Detalhes" e "Atribuir Ação".

Use recharts para gráficos. Dados mockados com estrutura para API.
```

### Passo 7 — Conectar ao Sistema Existente
```
Integre a nova tela "Painel Geral" como a home page do sistema CTIA existente.
Adicione "Painel Geral" como primeiro item na navegação do header.
Adicione o botão "CEO" com destaque visual (gradiente escuro, ícone de gráfico) à esquerda do sino.
Mantenha todas as telas existentes (Dashboard, P&D, Kanban, PCP, Config) funcionando normalmente.
```

### Passo 8 — Preparar para Backend
```
Crie interfaces TypeScript para todos os dados (Sector, SubSector, FeedEvent, Notification, Project, Production, Machine, CEOMetric, KaizenEntry, StrategicAlert, BottleneckStatus).
Use dados mockados por enquanto, mas estruture o código para fácil substituição por chamadas de API.
Para o PCP, prepare a estrutura para WebSocket (atualizações em tempo real do calendário).
Para o CEO, prepare a estrutura para cálculos automáticos de OEE, gargalos e alertas.
Cada card de setor deve ter um onClick que futuramente navegará para a tela de detalhe do departamento.
```

---

## PROTÓTIPO DE REFERÊNCIA

O arquivo `ctia-painel-geral.jsx` contém o protótipo funcional completo da Tela 1.
Use-o como referência visual e de comportamento. O Antigravity deve replicar este design
convertendo para TypeScript e Tailwind, mantendo a identidade visual.

---

*Documento gerado para guiar implementação no Google Antigravity.*
*Grupo Cromotransfer — CTIA — Abril 2026*

-- ============================================
-- Sistema de Gestão CTIA — Schema do Banco
-- ============================================

-- Tabela de Clientes (pastas)
CREATE TABLE IF NOT EXISTS clientes (
    id          TEXT PRIMARY KEY,
    nome        TEXT NOT NULL UNIQUE,
    logo_url    TEXT NOT NULL DEFAULT '',
    criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabela de Usuários (Login)
CREATE TABLE IF NOT EXISTS usuarios (
    id          TEXT PRIMARY KEY,
    nome        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    cargo       TEXT NOT NULL DEFAULT 'Analista',
    ativo       INTEGER NOT NULL DEFAULT 1,
    permissoes  TEXT NOT NULL DEFAULT '{"dashboard":true,"ped":true,"kanban":true,"producao":true}',
    criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);


-- Tabela de Ensaios
CREATE TABLE IF NOT EXISTS ensaios (
    id               TEXT PRIMARY KEY,
    cliente_id       TEXT    NOT NULL,
    cliente          TEXT    NOT NULL,
    data_ensaio      TEXT    NOT NULL,
    tipo_teste       TEXT    NOT NULL DEFAULT 'Completo',
    projeto          TEXT    NOT NULL DEFAULT '',
    modelo           TEXT    NOT NULL DEFAULT '',
    cor              TEXT    NOT NULL DEFAULT '',
    fornecedor       TEXT    NOT NULL DEFAULT 'Cromotransfer',
    substrato        TEXT    NOT NULL DEFAULT '',
    tecnologia       TEXT    NOT NULL DEFAULT '',
    categoria        TEXT    NOT NULL DEFAULT '',
    finalidade       TEXT    NOT NULL DEFAULT '',
    ap               TEXT    NOT NULL DEFAULT '',
    referencia       TEXT    NOT NULL DEFAULT '',
    loc_armario      TEXT    NOT NULL DEFAULT '',
    loc_prateleira   TEXT    NOT NULL DEFAULT '',
    loc_caixa        TEXT    NOT NULL DEFAULT '',
    caminho_rede     TEXT    NOT NULL DEFAULT '',
    url_capa         TEXT    NOT NULL DEFAULT '',
    
    -- Legacy/Simple fields
    resultado_ciclos      TEXT    NOT NULL DEFAULT '',
    resultado_ciclos_umido TEXT   NOT NULL DEFAULT '',
    resultado_transferencia TEXT  NOT NULL DEFAULT '',
    resultado_solidez     TEXT    NOT NULL DEFAULT '',
    resultado_visual      TEXT    NOT NULL DEFAULT '',
    resultado_forca       TEXT    NOT NULL DEFAULT '',
    
    -- Vulcabras Extended AM1/AM2 fields
    resultado_ciclos_am1 TEXT NOT NULL DEFAULT '',
    resultado_ciclos_am2 TEXT NOT NULL DEFAULT '',
    resultado_ciclos_umido_am1 TEXT NOT NULL DEFAULT '',
    resultado_ciclos_umido_am2 TEXT NOT NULL DEFAULT '',
    resultado_forca_am1  TEXT NOT NULL DEFAULT '',
    resultado_forca_am2  TEXT NOT NULL DEFAULT '',
    
    -- Vulcabras Specific Selects
    condicao_stress     TEXT NOT NULL DEFAULT '',
    falha_dinamometro   TEXT NOT NULL DEFAULT '',

    conclusao             TEXT    NOT NULL DEFAULT '',
    observacoes           TEXT    NOT NULL DEFAULT '',
    codigo_rastreio       TEXT    NOT NULL UNIQUE,
    criado_em             TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    atualizado_em         TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    retirado              INTEGER NOT NULL DEFAULT 0,
    status                TEXT    NOT NULL DEFAULT 'Amostras Recebidas',
    etiquetas             TEXT    NOT NULL DEFAULT '',
    descricao             TEXT    NOT NULL DEFAULT '',
    
    -- Parâmetros de Aplicação
    param_temperatura   TEXT    NOT NULL DEFAULT '',
    param_tempo         TEXT    NOT NULL DEFAULT '',
    param_pressao       TEXT    NOT NULL DEFAULT '',
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela de Imagens do Ensaio (galeria)
CREATE TABLE IF NOT EXISTS ensaio_imagens (
    id          TEXT PRIMARY KEY,
    ensaio_id   TEXT NOT NULL,
    url         TEXT NOT NULL,
    nome        TEXT NOT NULL DEFAULT '',
    categoria_foto TEXT NOT NULL DEFAULT 'Outra',
    ordem       INTEGER NOT NULL DEFAULT 0,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (ensaio_id) REFERENCES ensaios(id) ON DELETE CASCADE
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_ensaios_cliente_id   ON ensaios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ensaios_cliente      ON ensaios(cliente);
CREATE INDEX IF NOT EXISTS idx_ensaios_tipo_teste   ON ensaios(tipo_teste);
CREATE INDEX IF NOT EXISTS idx_ensaios_data_ensaio  ON ensaios(data_ensaio);
CREATE INDEX IF NOT EXISTS idx_ensaios_rastreio     ON ensaios(codigo_rastreio);
CREATE INDEX IF NOT EXISTS idx_ensaios_ap            ON ensaios(ap);
CREATE INDEX IF NOT EXISTS idx_ensaios_referencia    ON ensaios(referencia);
CREATE INDEX IF NOT EXISTS idx_imagens_ensaio       ON ensaio_imagens(ensaio_id);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    analista_nome     TEXT NOT NULL DEFAULT 'Lúcio Monteiro',
    analista_cargo    TEXT NOT NULL DEFAULT 'Analista de Laboratório',
    gerente_nome      TEXT NOT NULL DEFAULT 'Jeferson Bueno',
    gerente_cargo     TEXT NOT NULL DEFAULT 'Gerente de Processos',
    empresa_nome      TEXT NOT NULL DEFAULT 'CTIA — CROMOTRANSFER',
    empresa_endereco  TEXT NOT NULL DEFAULT 'R. Kesser Zattar, 162 - João Costa, Joinville - SC',
    empresa_email     TEXT NOT NULL DEFAULT 'ctia.lab@cromotransfer.com',
    empresa_logo      TEXT NOT NULL DEFAULT '',
    senha_admin       TEXT NOT NULL DEFAULT '',
    kanban_colunas    TEXT NOT NULL DEFAULT 'Amostras Recebidas,Em Ensaio,Laudo Gerado',
    etiquetas_config  TEXT NOT NULL DEFAULT '[{"cor":"#4BCE97","nome":"Concluído"},{"cor":"#F5CD47","nome":"Atenção"},{"cor":"#FEA362","nome":"Prioridade"},{"cor":"#F87168","nome":"Urgente"},{"cor":"#9F8FEF","nome":"Aguardando"},{"cor":"#579DFF","nome":"Em Análise"}]',
    analistas_lista   TEXT NOT NULL DEFAULT '["Lúcio Monteiro", "Jeferson Bueno"]',
    atualizado_em     TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabela de Desenvolvimentos (P&D)
CREATE TABLE IF NOT EXISTS desenvolvimentos (
    id          TEXT PRIMARY KEY,
    cliente     TEXT NOT NULL,
    projeto     TEXT NOT NULL,
    descricao   TEXT NOT NULL DEFAULT '',
    foto_url    TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'Em Andamento',
    forn_nome   TEXT NOT NULL DEFAULT '',
    forn_contato TEXT NOT NULL DEFAULT '',
    forn_referencia TEXT NOT NULL DEFAULT '',
    forn_rep    TEXT NOT NULL DEFAULT '',
    forn_email  TEXT NOT NULL DEFAULT '',
    forn_obs    TEXT NOT NULL DEFAULT '',
    criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Índices para desenvolvimentos
CREATE INDEX IF NOT EXISTS idx_desenv_cliente ON desenvolvimentos(cliente);
CREATE INDEX IF NOT EXISTS idx_desenv_projeto ON desenvolvimentos(projeto);

-- Inserir registro padrão se não existir na configuracoes
INSERT INTO configuracoes (id)
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM configuracoes);

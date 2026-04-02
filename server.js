require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, saveDatabase } = require('./database/connection');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const os = require('os');

function getLocalIp() {
    // ... mantendo ip helper ...
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// ─── Uploads directory ───────────────────────────────────────────────────────
const UPLOADS_DIR = process.env.UPLOADS_DIR || 'Y:/Producao/CTIA/sistema/uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Multer config ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname);
        cb(null, `img-${unique}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado.'));
        }
    }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── Inicializar banco e iniciar servidor ────────────────────────────────────
(async function start() {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    const db = await getDatabase();

    const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
        db.run(stmt);
    }

    // --- Início: Migração Segura (ALTER TABLE para colunas novas) ---
    try {
        const tableInfo = db.exec("PRAGMA table_info(ensaios)");
        if (tableInfo && tableInfo.length > 0) {
            const columns = tableInfo[0].values.map(r => r[1]);

            const expectedColumns = {
                'projeto': "TEXT NOT NULL DEFAULT ''",
                'modelo': "TEXT NOT NULL DEFAULT ''",
                'cor': "TEXT NOT NULL DEFAULT ''",
                'fornecedor': "TEXT NOT NULL DEFAULT 'Cromotransfer'",
                'substrato': "TEXT NOT NULL DEFAULT ''",
                'tecnologia': "TEXT NOT NULL DEFAULT ''",
                'categoria': "TEXT NOT NULL DEFAULT ''",
                'finalidade': "TEXT NOT NULL DEFAULT ''",
                'ap': "TEXT NOT NULL DEFAULT ''",
                'referencia': "TEXT NOT NULL DEFAULT ''",
                'loc_armario': "TEXT NOT NULL DEFAULT ''",
                'loc_prateleira': "TEXT NOT NULL DEFAULT ''",
                'loc_caixa': "TEXT NOT NULL DEFAULT ''",
                'caminho_rede': "TEXT NOT NULL DEFAULT ''",
                'url_capa': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos_umido': "TEXT NOT NULL DEFAULT ''",
                'resultado_transferencia': "TEXT NOT NULL DEFAULT ''",
                'resultado_solidez': "TEXT NOT NULL DEFAULT ''",
                'resultado_visual': "TEXT NOT NULL DEFAULT ''",
                'resultado_forca': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos_am1': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos_am2': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos_umido_am1': "TEXT NOT NULL DEFAULT ''",
                'resultado_ciclos_umido_am2': "TEXT NOT NULL DEFAULT ''",
                'resultado_forca_am1': "TEXT NOT NULL DEFAULT ''",
                'resultado_forca_am2': "TEXT NOT NULL DEFAULT ''",
                'condicao_stress': "TEXT NOT NULL DEFAULT ''",
                'falha_dinamometro': "TEXT NOT NULL DEFAULT ''",
                'conclusao': "TEXT NOT NULL DEFAULT ''",
                'observacoes': "TEXT NOT NULL DEFAULT ''",
                'retirado': "INTEGER NOT NULL DEFAULT 0",
                'status': "TEXT NOT NULL DEFAULT 'Amostras Recebidas'",
                'etiquetas': "TEXT NOT NULL DEFAULT ''",
                'descricao': "TEXT NOT NULL DEFAULT ''",
                'param_temperatura': "TEXT NOT NULL DEFAULT ''",
                'param_tempo': "TEXT NOT NULL DEFAULT ''",
                'param_pressao': "TEXT NOT NULL DEFAULT ''"
            };

            for (const [colName, colDef] of Object.entries(expectedColumns)) {
                if (!columns.includes(colName)) {
                    db.run(`ALTER TABLE ensaios ADD COLUMN ${colName} ${colDef};`);
                    console.log(`🛠️ Migração: Coluna '${colName}' adicionada à tabela 'ensaios'.`);
                }
            }
        }
    } catch (err) {
        console.error("⚠️ Erro durante a migração do banco (ALTER TABLE):", err);
    }

    // --- Migração: Senha Admin em Configuracoes ---
    try {
        const confInfo = db.exec("PRAGMA table_info(configuracoes)");
        if (confInfo && confInfo.length > 0) {
            const columns = confInfo[0].values.map(r => r[1]);
            if (!columns.includes('senha_admin')) {
                db.run("ALTER TABLE configuracoes ADD COLUMN senha_admin TEXT NOT NULL DEFAULT '';");
                console.log("🛠️ Migração: Coluna 'senha_admin' adicionada à tabela 'configuracoes'.");
            }
            if (!columns.includes('kanban_colunas')) {
                db.run("ALTER TABLE configuracoes ADD COLUMN kanban_colunas TEXT NOT NULL DEFAULT 'Amostras Recebidas,Em Ensaio,Laudo Gerado';");
                console.log("🛠️ Migração: Coluna 'kanban_colunas' adicionada à tabela 'configuracoes'.");
            }
        }
    } catch (err) {
        console.error("⚠️ Erro migrando tabela configuracoes:", err);
    }

    // --- Migração: Usuário Admin Padrão ---
    try {
        const checkUsr = db.prepare("SELECT COUNT(*) AS count FROM usuarios");
        if (checkUsr.step()) {
            const count = checkUsr.getAsObject().count;
            checkUsr.free();
            if (count === 0) {
                // Criar primeiro usuário admin master
                const senhaHash = await bcrypt.hash('ctiaLC@lc2026#', 10);
                const idAdmin = uuidv4();
                const stmt = db.prepare("INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, ?, ?, ?)");
                stmt.run([idAdmin, 'Administrador Master', 'laboratorio.ctia@cromotransfer.com.br', senhaHash, 'Gestor', 1]);
                stmt.free();
                console.log("✅ Usuário administrador master criado. (laboratorio.ctia@cromotransfer.com.br)");
            }
        }
    } catch (err) {
        console.error("⚠️ Erro criando usuário admin padrão:", err);
    }
    
    // --- Migração Extra: Forçar mudança do admin antigo ou atualizar senha do Master ---
    try {
        const stmtOld = db.prepare("SELECT id FROM usuarios WHERE email = 'admin@ctia.com'");
        const masterHash = await bcrypt.hash('ctiaLC@lc2026#', 10);
        
        if (stmtOld.step()) {
            db.run("UPDATE usuarios SET email = 'laboratorio.ctia@cromotransfer.com.br', senha_hash = ?, nome = 'Administrador Master', cargo = 'Gestor' WHERE email = 'admin@ctia.com'", [masterHash]);
            stmtOld.free();
            console.log("✅ Admin antigo migrado para a conta Master: laboratorio.ctia@cromotransfer.com.br");
        } else {
            stmtOld.free();
            // Atualizar senha por via das dúvidas se a conta master já existir
            db.run("UPDATE usuarios SET senha_hash = ?, cargo = 'Gestor', ativo = 1 WHERE email = 'laboratorio.ctia@cromotransfer.com.br'", [masterHash]);
        }
    } catch (err) {
        console.error("⚠️ Erro migrando admin Master:", err);
    }
    // --- Migração: Tabela de Atividades ---
    try {
        // Garantir tabela ensaio_atividades
        db.exec(`CREATE TABLE IF NOT EXISTS ensaio_atividades (
        id          TEXT PRIMARY KEY,
        ensaio_id   TEXT NOT NULL,
        texto       TEXT NOT NULL,
        usuario     TEXT NOT NULL DEFAULT 'Sistema',
        criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (ensaio_id) REFERENCES ensaios(id) ON DELETE CASCADE
    )`);
        console.log("🛠️ Migração: Tabela 'ensaio_atividades' garantida.");

        // Migração para etiquetas_config
        const hasEtiquetasConfig = db.exec("PRAGMA table_info(configuracoes)").some(res =>
            res.values.some(v => v[1] === 'etiquetas_config')
        );
        if (!hasEtiquetasConfig) {
            db.run("ALTER TABLE configuracoes ADD COLUMN etiquetas_config TEXT NOT NULL DEFAULT '[{\"cor\":\"#4BCE97\",\"nome\":\"Concluído\"},{\"cor\":\"#F5CD47\",\"nome\":\"Atenção\"},{\"cor\":\"#FEA362\",\"nome\":\"Prioridade\"},{\"cor\":\"#F87168\",\"nome\":\"Urgente\"},{\"cor\":\"#9F8FEF\",\"nome\":\"Aguardando\"},{\"cor\":\"#579DFF\",\"nome\":\"Em Análise\"}]'");
            console.log("🛠️ Migração: Coluna 'etiquetas_config' adicionada.");
        }

        // Migração para analistas_lista
        try {
            const info = db.exec("PRAGMA table_info(configuracoes)");
            const hasAnalistasLista = info[0].values.some(v => v[1] === 'analistas_lista');
            if (!hasAnalistasLista) {
                db.exec("ALTER TABLE configuracoes ADD COLUMN analistas_lista TEXT NOT NULL DEFAULT '[\"Lúcio Monteiro\", \"Jeferson Bueno\"]'");
                console.log("🛠️ Migração: Coluna 'analistas_lista' adicionada via exec.");
            }
        } catch (err) {
            console.error("⚠️ Erro migrando analistas_lista:", err);
        }
        // --- Migração: Tabela de Desenvolvimentos (P&D) ---
        try {
            db.exec(`CREATE TABLE IF NOT EXISTS desenvolvimentos (
                id          TEXT PRIMARY KEY,
                cliente     TEXT NOT NULL,
                projeto     TEXT NOT NULL,
                descricao   TEXT NOT NULL DEFAULT '',
                foto_url    TEXT NOT NULL DEFAULT '',
                status      TEXT NOT NULL DEFAULT 'Em Andamento',
                criado_em   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            )`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_desenv_cliente ON desenvolvimentos(cliente)`);
            db.exec(`CREATE INDEX IF NOT EXISTS idx_desenv_projeto ON desenvolvimentos(projeto)`);
            console.log("🛠️ Migração: Tabela 'desenvolvimentos' verificada/garantida.");
        } catch (err) {
            console.error("⚠️ Erro migrando tabela desenvolvimentos:", err);
        }

        // --- Migração: Adicionar coluna categoria_foto em ensaio_imagens ---
        try {
            const imgCols = db.exec("PRAGMA table_info(ensaio_imagens)");
            if (imgCols && imgCols.length > 0) {
                const colNames = imgCols[0].values.map(r => r[1]);
                if (!colNames.includes('categoria_foto')) {
                    db.exec("ALTER TABLE ensaio_imagens ADD COLUMN categoria_foto TEXT NOT NULL DEFAULT 'Outra'");
                    console.log("🛠️ Migração: Coluna 'categoria_foto' adicionada à tabela 'ensaio_imagens'.");
                }
            }
        } catch (err) {
            console.error("⚠️ Erro adicionando categoria_foto:", err);
        }

        // --- Migração: Adicionar coluna url_publica em configuracoes ---
        try {
            const confCols = db.exec("PRAGMA table_info(configuracoes)");
            if (confCols && confCols.length > 0) {
                const colNames = confCols[0].values.map(r => r[1]);
                if (!colNames.includes('url_publica')) {
                    db.exec("ALTER TABLE configuracoes ADD COLUMN url_publica TEXT NOT NULL DEFAULT ''");
                    console.log("🛠️ Migração: Coluna 'url_publica' adicionada à tabela 'configuracoes'.");
                }
            }
        } catch (err) {
            console.error("⚠️ Erro adicionando url_publica:", err);
        }

        // --- Migração: Remover CHECK constraint de tipo_teste ---
        try {
            const schemaRes = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='ensaios'");
            if (schemaRes && schemaRes.length > 0 && schemaRes[0].values && schemaRes[0].values.length > 0) {
                const createSql = schemaRes[0].values[0][0];
                if (createSql && createSql.includes('CHECK (tipo_teste IN')) {
                    console.log("🛠️ Migração: Removendo constraint CHECK de 'tipo_teste' reconstruindo tabela 'ensaios'...");
                    // Get existing column names to build safe INSERT
                    const colInfo = db.exec("PRAGMA table_info(ensaios)");
                    const existingCols = colInfo[0].values.map(r => r[1]);
                    const colList = existingCols.join(', ');
                    
                    db.exec("PRAGMA foreign_keys=off;");
                    db.exec(`CREATE TABLE ensaios_new (
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
                        resultado_ciclos      TEXT    NOT NULL DEFAULT '',
                        resultado_ciclos_umido TEXT   NOT NULL DEFAULT '',
                        resultado_transferencia TEXT  NOT NULL DEFAULT '',
                        resultado_solidez     TEXT    NOT NULL DEFAULT '',
                        resultado_visual      TEXT    NOT NULL DEFAULT '',
                        resultado_forca       TEXT    NOT NULL DEFAULT '',
                        resultado_ciclos_am1 TEXT NOT NULL DEFAULT '',
                        resultado_ciclos_am2 TEXT NOT NULL DEFAULT '',
                        resultado_ciclos_umido_am1 TEXT NOT NULL DEFAULT '',
                        resultado_ciclos_umido_am2 TEXT NOT NULL DEFAULT '',
                        resultado_forca_am1  TEXT NOT NULL DEFAULT '',
                        resultado_forca_am2  TEXT NOT NULL DEFAULT '',
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
                        param_temperatura   TEXT    NOT NULL DEFAULT '',
                        param_tempo         TEXT    NOT NULL DEFAULT '',
                        param_pressao       TEXT    NOT NULL DEFAULT '',
                        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
                    );`);
                    db.exec(`INSERT INTO ensaios_new (${colList}) SELECT ${colList} FROM ensaios;`);
                    db.exec("DROP TABLE ensaios;");
                    db.exec("ALTER TABLE ensaios_new RENAME TO ensaios;");
                    db.exec("PRAGMA foreign_keys=on;");
                    console.log("✅ Migração de schema da tabela 'ensaios' concluída.");
                }
            }
        } catch (err) {
            console.error("⚠️ Erro removendo constraint de tipo_teste:", err);
            // Try to clean up if ensaios_new was created
            try { db.exec("DROP TABLE IF EXISTS ensaios_new;"); } catch (e) {}
        }

        // --- Migração: Corrigir URLs de imagens com espaços ---
        try {
            db.exec("UPDATE ensaio_imagens SET url = REPLACE(REPLACE(url, '/ uploads / ', '/uploads/'), '/ uploads /', '/uploads/') WHERE url LIKE '%/ uploads /%'");
            console.log("🛠️ Migração: URLs de imagens corrigidas.");
        } catch (err) {
            // Tabela pode não existir ainda, tudo bem
        }

        // --- Migração: Adicionar campo pcp_spreadsheet_path em configuracoes ---
        try {
            const confCols = db.exec("PRAGMA table_info(configuracoes)");
            if (confCols.length > 0) {
                const hasCol = confCols[0].values.some(r => r[1] === 'pcp_spreadsheet_path');
                if (!hasCol) {
                    db.exec("ALTER TABLE configuracoes ADD COLUMN pcp_spreadsheet_path TEXT NOT NULL DEFAULT ''");
                    console.log("✅ Migração: Adicionado campo pcp_spreadsheet_path em configuracoes.");
                }
            }
        } catch (err) {
            console.warn("⚠️ Migração pcp_spreadsheet_path:", err.message);
        }

        // --- Fim: Migração Segura ---

        saveDatabase();
        console.log('✅ Banco de dados pronto.');

        // ─── Rotas da API ────────────────────────────────────────────────────
        const authRouter = require('./routes/auth');
        const clientesRouter = require('./routes/clientes');
        const ensaiosRouter = require('./routes/ensaios');
        const configuracoesRouter = require('./routes/configuracoes');
        const desenvolvimentosRouter = require('./routes/desenvolvimentos');
        const usuariosRouter = require('./routes/usuarios');
        const producaoRouter = require('./routes/producao');
        const aiRouter = require('./routes/ai');

        // Rotas Públicas (Auth e Portal)
        app.use('/api/auth', authRouter);

        // ─── Portal de Consulta Pública (Rastreio) e Config ───────────────────
        app.get('/consulta/:codigo_rastreio', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'consulta.html'));
        });

        app.get('/api/public/consulta/:codigo_rastreio', async (req, res) => {
            console.log(`🔍 [Public Portal] Buscando rastreio: ${req.params.codigo_rastreio}`);
            try {
                const db = await getDatabase();
                const codigo = req.params.codigo_rastreio;

                const stmt = db.prepare("SELECT * FROM ensaios WHERE codigo_rastreio = ? LIMIT 1");
                stmt.bind([codigo]);

                if (stmt.step()) {
                    const ensaio = stmt.getAsObject();
                    stmt.free();
                    console.log(`✅ [Public Portal] Ensaio encontrado: ${ensaio.id}`);
                    res.json(ensaio);
                } else {
                    stmt.free();
                    console.warn(`⚠️ [Public Portal] Rastreio não encontrado: ${codigo}`);
                    res.status(404).json({ error: 'Ensaio não encontrado.' });
                }
            } catch (err) {
                console.error(`❌ [Public Portal] Erro: ${err.message}`);
                res.status(500).json({ error: 'Erro ao buscar ensaio.' });
            }
        });

        app.get('/api/public/config', async (req, res) => {
            console.log(`🔍 [Public Portal] Buscando config pública`);
            try {
                const db = await getDatabase();
                const result = db.exec("SELECT empresa_logo, empresa_nome FROM configuracoes LIMIT 1");
                if (result && result.length > 0 && result[0].values.length > 0) {
                    const row = result[0].values[0];
                    res.json({ empresa_logo: row[0], empresa_nome: row[1] });
                } else {
                    res.json({ empresa_logo: null, empresa_nome: 'CTIA' });
                }
            } catch (err) {
                console.error(`❌ [Public Portal] Erro config: ${err.message}`);
                res.status(500).json({ error: 'Erro ao buscar config.' });
            }
        });

        // Aplica o Middleware de Autenticação em TODAS as outras rotas `api/`
        app.use('/api', verifyToken);

        app.use('/api/clientes', clientesRouter);
        app.use('/api/configuracoes', configuracoesRouter);
        app.use('/api/desenvolvimentos', desenvolvimentosRouter);
        app.use('/api/usuarios', usuariosRouter);
        app.use('/api/producao', producaoRouter);
        app.use('/api/ai', aiRouter);

        // Upload de config logo
        app.post('/api/upload-logo', upload.single('logo'), (req, res) => {
            if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            res.json({ url: `/uploads/${req.file.filename}` });
        });

        // Apply multer to upload route at app level, before ensaios router
        app.post('/api/ensaios/:id/upload', upload.array('imagens', 20));
        app.use('/api/ensaios', ensaiosRouter);

        app.get('/api/network-info', (req, res) => {
            res.json({ ip: getLocalIp(), port: PORT });
        });



        // Fallback para APIs não encontradas (Para evitar retornar HTML no json)
        app.use('/api/*', (req, res) => {
            res.status(404).json({ error: 'Endpoint da API não encontrado.' });
        });

        // SPA catch-all (apenas para rotas que não começam com /api)
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(PORT, '0.0.0.0', () => {
            const localIp = getLocalIp();
            console.log(`🚀 Servidor CTIA rodando em http://localhost:${PORT}`);
            console.log(`🌐 Acesso na Rede Local: http://${localIp}:${PORT}`);
        });
    } catch (err) {
        console.error("⚠️ Erro na inicialização do servidor:", err);
    }
})();

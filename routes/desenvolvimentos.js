const express = require('express');
const router = express.Router();
const { getDatabase, saveDatabase } = require('../database/connection');
const multer = require('multer');
const path = require('path');

// Re-use multer upload from server.js for P&D photos
const UPLOADS_DIR = process.env.UPLOADS_DIR || 'Y:/Producao/CTIA/sistema/uploads';
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        const ext = path.extname(file.originalname);
        cb(null, `dev-${unique}${ext}`);
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

// GET /api/desenvolvimentos - List all developments
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const stmt = db.prepare("SELECT * FROM desenvolvimentos ORDER BY criado_em DESC");
        const list = [];
        while (stmt.step()) {
            list.push(stmt.getAsObject());
        }
        stmt.free();
        res.json(list);
    } catch (err) {
        console.error("Erro ao listar desenvolvimentos:", err);
        res.status(500).json({ error: 'Erro ao listar desenvolvimentos.' });
    }
});

// GET /api/desenvolvimentos/:id - Get specific development
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const stmt = db.prepare("SELECT * FROM desenvolvimentos WHERE id = ?");
        stmt.bind([req.params.id]);
        if (stmt.step()) {
            const dev = stmt.getAsObject();
            stmt.free();
            res.json(dev);
        } else {
            stmt.free();
            res.status(404).json({ error: 'Desenvolvimento não encontrado.' });
        }
    } catch (err) {
        console.error("Erro ao buscar desenvolvimento:", err);
        res.status(500).json({ error: 'Erro ao buscar desenvolvimento.' });
    }
});

// POST /api/desenvolvimentos - Create a new development (with image upload)
router.post('/', upload.single('foto'), async (req, res) => {
    try {
        const db = await getDatabase();
        const { cliente, projeto, descricao, forn_nome, forn_contato, forn_referencia, forn_rep, forn_email, forn_obs } = req.body;

        if (!cliente || !projeto) {
            return res.status(400).json({ error: 'Cliente e Projeto são obrigatórios.' });
        }

        const id = 'DEV-' + Date.now().toString(36).toUpperCase();
        let foto_url = '';

        if (req.file) {
            foto_url = `/uploads/${req.file.filename}`;
        }

        db.run(
            `INSERT INTO desenvolvimentos (id, cliente, projeto, descricao, foto_url, forn_nome, forn_contato, forn_referencia, forn_rep, forn_email, forn_obs) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, cliente, projeto, descricao || '', foto_url, forn_nome || '', forn_contato || '', forn_referencia || '', forn_rep || '', forn_email || '', forn_obs || '']
        );

        saveDatabase();

        res.status(201).json({
            message: 'Desenvolvimento criado com sucesso.',
            id,
            cliente,
            projeto,
            descricao,
            foto_url
        });
    } catch (err) {
        console.error("Erro ao criar desenvolvimento:", err);
        res.status(500).json({ error: 'Erro ao criar desenvolvimento.' });
    }
});

// PUT /api/desenvolvimentos/:id - Update development fully (with optional image)
router.put('/:id', upload.single('foto'), async (req, res) => {
    try {
        const db = await getDatabase();
        const { cliente, projeto, descricao, forn_nome, forn_contato, forn_referencia, forn_rep, forn_email, forn_obs } = req.body;
        const id = req.params.id;

        if (!cliente || !projeto) {
            return res.status(400).json({ error: 'Cliente e Projeto são obrigatórios.' });
        }

        const stmt = db.prepare("SELECT foto_url FROM desenvolvimentos WHERE id = ?");
        stmt.bind([id]);
        let currentDev = null;
        if (stmt.step()) {
            currentDev = stmt.getAsObject();
        }
        stmt.free();

        if (!currentDev) {
            return res.status(404).json({ error: 'Desenvolvimento não encontrado.' });
        }

        let foto_url = currentDev.foto_url;

        if (req.file) {
            foto_url = `/uploads/${req.file.filename}`;
            if (currentDev.foto_url && currentDev.foto_url.startsWith('/uploads/')) {
                const fs = require('fs');
                const path = require('path');
                const oldFileName = path.basename(currentDev.foto_url);
                const actualFilePath = path.join(UPLOADS_DIR, oldFileName);
                if (fs.existsSync(actualFilePath)) {
                    try { fs.unlinkSync(actualFilePath); } catch (e) { console.error("Erro deletar arquivo", e); }
                }
            }
        }

        db.run(
            `UPDATE desenvolvimentos SET cliente = ?, projeto = ?, descricao = ?, foto_url = ?, forn_nome = ?, forn_contato = ?, forn_referencia = ?, forn_rep = ?, forn_email = ?, forn_obs = ? WHERE id = ?`,
            [cliente, projeto, descricao || '', foto_url, forn_nome || '', forn_contato || '', forn_referencia || '', forn_rep || '', forn_email || '', forn_obs || '', id]
        );

        saveDatabase();
        res.json({ message: 'Desenvolvimento atualizado com sucesso.', id, cliente, projeto, descricao, foto_url });
    } catch (err) {
        console.error("Erro ao atualizar desenvolvimento:", err);
        res.status(500).json({ error: 'Erro ao atualizar desenvolvimento.' });
    }
});

// PUT /api/desenvolvimentos/:id/status - Update status only
router.put('/:id/status', express.json(), async (req, res) => {
    try {
        const db = await getDatabase();
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status é obrigatório.' });
        }

        db.run(
            `UPDATE desenvolvimentos SET status = ? WHERE id = ?`,
            [status, req.params.id]
        );

        saveDatabase();
        res.json({ message: 'Status atualizado com sucesso.' });
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        res.status(500).json({ error: 'Erro ao atualizar status.' });
    }
});

// DELETE /api/desenvolvimentos/:id
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const id = req.params.id;

        // Find foto_url to delete file if it exists
        const stmt = db.prepare("SELECT foto_url FROM desenvolvimentos WHERE id = ?");
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            if (row.foto_url && row.foto_url.startsWith('/uploads/')) {
                const fs = require('fs');
                const filePath = path.join(__dirname, '..', row.foto_url);
                if (fs.existsSync(filePath)) {
                    try { fs.unlinkSync(filePath); } catch (e) { console.error("Erro ao deletar arquivo", e); }
                }
            }
        }
        stmt.free();

        // Delete activities too!
        db.run("DELETE FROM ensaio_atividades WHERE ensaio_id = ?", [id]);
        db.run("DELETE FROM desenvolvimentos WHERE id = ?", [id]);
        saveDatabase();

        res.json({ message: 'Desenvolvimento removido com sucesso.' });
    } catch (err) {
        console.error("Erro ao deletar desenvolvimento:", err);
        res.status(500).json({ error: 'Erro ao deletar desenvolvimento.' });
    }
});

// ─── Atividades (Comentários) ──────────────────────────────────────────────

// GET /api/desenvolvimentos/:id/atividades
router.get('/:id/atividades', async (req, res) => {
    try {
        const db = await getDatabase();
        const stmt = db.prepare("SELECT * FROM ensaio_atividades WHERE ensaio_id = ? ORDER BY criado_em ASC");
        stmt.bind([req.params.id]);
        const list = [];
        while (stmt.step()) {
            list.push(stmt.getAsObject());
        }
        stmt.free();
        res.json(list);
    } catch (err) {
        console.error("Erro ao listar atividades P&D:", err);
        res.status(500).json({ error: 'Erro ao listar atividades.' });
    }
});

// POST /api/desenvolvimentos/:id/atividades
router.post('/:id/atividades', express.json(), async (req, res) => {
    try {
        const { texto, usuario } = req.body;
        if (!texto) return res.status(400).json({ error: 'Texto é obrigatório.' });

        const db = await getDatabase();
        const id = 'ACT-' + Date.now().toString(36).toUpperCase();

        db.run(
            'INSERT INTO ensaio_atividades (id, ensaio_id, texto, usuario) VALUES (?, ?, ?, ?)',
            [id, req.params.id, texto, usuario || 'Analista']
        );
        saveDatabase();

        res.status(201).json({ id, texto, usuario, criado_em: new Date().toISOString() });
    } catch (err) {
        console.error("Erro ao criar atividade P&D:", err);
        res.status(500).json({ error: 'Erro ao criar atividade.' });
    }
});

// POST /api/desenvolvimentos/:id/transferir-atividades
router.post('/:id/transferir-atividades', express.json(), async (req, res) => {
    try {
        const db = await getDatabase();
        const { newEnsaioId } = req.body;

        if (!newEnsaioId) {
            return res.status(400).json({ error: 'ID do novo ensaio é obrigatório.' });
        }

        // Update all activities linked to this development to the new Ensaio ID
        db.run(
            `UPDATE ensaio_atividades SET ensaio_id = ? WHERE ensaio_id = ?`,
            [newEnsaioId, req.params.id]
        );

        saveDatabase();
        res.json({ message: 'Atividades transferidas com sucesso.' });
    } catch (err) {
        console.error("Erro ao transferir atividades:", err);
        res.status(500).json({ error: 'Erro ao transferir atividades.' });
    }
});

module.exports = router;

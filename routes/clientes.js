const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, saveDatabase } = require('../database/connection');

const router = express.Router();

// Helper: convert sql.js result to array of objects
function resultToArray(res) {
    if (!res || res.length === 0) return [];
    const result = res[0];
    return result.values.map(row => {
        const obj = {};
        result.columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
    });
}

// ─── POST /api/clientes — Criar cliente ──────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { nome, logo_url } = req.body;

        if (!nome || !nome.trim()) {
            return res.status(400).json({ erro: 'Campo obrigatório: nome' });
        }

        const db = await getDatabase();

        // Check if already exists
        const existing = resultToArray(db.exec('SELECT * FROM clientes WHERE nome = ?', [nome.trim()]));
        if (existing.length > 0) {
            return res.status(409).json({ erro: 'Cliente já existe.', cliente: existing[0] });
        }

        const id = uuidv4();
        db.run(
            'INSERT INTO clientes (id, nome, logo_url) VALUES (?, ?, ?)',
            [id, nome.trim(), logo_url || '']
        );
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM clientes WHERE id = ?', [id]));
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao criar cliente:', err);
        res.status(500).json({ erro: 'Erro interno ao criar cliente.' });
    }
});

// ─── GET /api/clientes — Listar todos (com contagem de ensaios) ──────────────
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const rows = resultToArray(db.exec(`
            SELECT c.*, COUNT(e.id) as total_ensaios
            FROM clientes c
            LEFT JOIN ensaios e ON e.cliente_id = c.id
            GROUP BY c.id
            ORDER BY c.nome ASC
        `));
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar clientes:', err);
        res.status(500).json({ erro: 'Erro interno ao listar clientes.' });
    }
});

// ─── GET /api/clientes/busca — Busca global (clientes + ensaios) ─────────────
router.get('/busca', async (req, res) => {
    try {
        const db = await getDatabase();
        const q = (req.query.q || '').trim();

        if (!q) {
            // No search term: return all clients with counts
            const rows = resultToArray(db.exec(`
                SELECT c.*, COUNT(e.id) as total_ensaios
                FROM clientes c
                LEFT JOIN ensaios e ON e.cliente_id = c.id
                GROUP BY c.id
                ORDER BY c.nome ASC
            `));
            return res.json(rows);
        }

        const termo = `%${q}%`;
        const rows = resultToArray(db.exec(`
            SELECT c.*, COUNT(DISTINCT e.id) as total_ensaios
            FROM clientes c
            LEFT JOIN ensaios e ON e.cliente_id = c.id
            WHERE c.nome LIKE ?
               OR e.ap LIKE ?
               OR e.referencia LIKE ?
               OR e.tipo_teste LIKE ?
            GROUP BY c.id
            ORDER BY c.nome ASC
        `, [termo, termo, termo, termo]));

        res.json(rows);
    } catch (err) {
        console.error('Erro na busca global:', err);
        res.status(500).json({ erro: 'Erro interno na busca.' });
    }
});

// ─── GET /api/clientes/:id — Buscar por ID ──────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const rows = resultToArray(db.exec('SELECT * FROM clientes WHERE id = ?', [req.params.id]));

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar cliente:', err);
        res.status(500).json({ erro: 'Erro interno ao buscar cliente.' });
    }
});

// ─── PUT /api/clientes/:id — Atualizar ──────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM clientes WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        const old = existing[0];
        const { nome, logo_url } = req.body;

        db.run(
            'UPDATE clientes SET nome = ?, logo_url = ? WHERE id = ?',
            [nome ?? old.nome, logo_url ?? old.logo_url, req.params.id]
        );
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM clientes WHERE id = ?', [req.params.id]));
        res.json(rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar cliente:', err);
        res.status(500).json({ erro: 'Erro interno ao atualizar cliente.' });
    }
});

// ─── DELETE /api/clientes/:id — Excluir ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM clientes WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado.' });
        }

        const clienteNome = existing[0].nome;

        // Exclusão em Cascata (Cascade Delete)
        // 1. Apagar todas as atividades vinculadas aos ensaios desse cliente
        db.run(`
            DELETE FROM ensaio_atividades 
            WHERE ensaio_id IN (SELECT id FROM ensaios WHERE cliente_id = ?)
        `, [req.params.id]);

        // 2. Apagar todas as imagens vinculadas aos ensaios desse cliente
        db.run(`
            DELETE FROM ensaio_imagens 
            WHERE ensaio_id IN (SELECT id FROM ensaios WHERE cliente_id = ?)
        `, [req.params.id]);

        // 3. Apagar todos os ensaios desse cliente
        db.run('DELETE FROM ensaios WHERE cliente_id = ?', [req.params.id]);

        // 4. Apagar todos os P&D (desenvolvimentos) desse cliente
        // Primeiro apaga atividades dos P&D
        db.run(`
            DELETE FROM ensaio_atividades 
            WHERE ensaio_id IN (SELECT id FROM desenvolvimentos WHERE cliente = ?)
        `, [clienteNome]);
        // Depois apaga os P&D
        db.run('DELETE FROM desenvolvimentos WHERE cliente = ?', [clienteNome]);

        // 5. Finalmente, apagar o cliente
        db.run('DELETE FROM clientes WHERE id = ?', [req.params.id]);

        saveDatabase();

        res.json({ mensagem: 'Cliente e todos os seus ensaios excluídos com sucesso.', id: req.params.id });
    } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        res.status(500).json({ erro: 'Erro interno ao excluir cliente.' });
    }
});

module.exports = router;

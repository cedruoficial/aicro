const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, saveDatabase } = require('../database/connection');

// Middleware para verificar se o usuário é Gestor/Admin
function requireAdmin(req, res, next) {
    if (!req.usuario || (req.usuario.cargo !== 'Gestor' && req.usuario.cargo !== 'Administrador')) {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    next();
}

// Middleware para verificar se o usuário é o Master Admin
function requireMasterAdmin(req, res, next) {
    if (!req.usuario || req.usuario.email !== 'laboratorio.ctia@cromotransfer.com.br') {
        return res.status(403).json({ error: 'Acesso negado. Apenas a conta Master (laboratorio.ctia@cromotransfer.com.br) pode gerenciar usuários.' });
    }
    next();
}

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

// ─── GET /api/usuarios — Listar todos os usuários ─────────────────────────
router.get('/', requireAdmin, async (req, res) => {
    try {
        const db = await getDatabase();
        const rows = resultToArray(db.exec('SELECT id, nome, email, cargo, ativo, permissoes, criado_em FROM usuarios ORDER BY criado_em ASC'));
        // Parse permissoes de String para Objeto
        rows.forEach(r => {
            try { r.permissoes = JSON.parse(r.permissoes); }
            catch(err) { r.permissoes = { dashboard: true, ped: true, kanban: true, producao: true }; }
        });
        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ error: 'Erro ao listar usuários.' });
    }
});

// ─── POST /api/usuarios — Criar um novo usuário ───────────────────────────
router.post('/', requireMasterAdmin, async (req, res) => {
    try {
        const { nome, email, senha, cargo, permissoes } = req.body;
        
        if (!nome || !email || !senha || !cargo) {
            return res.status(400).json({ error: 'Nome, email, senha e cargo são obrigatórios.' });
        }

        const defaultPerms = { dashboard: true, ped: true, kanban: true, producao: true };
        const permsStr = permissoes ? JSON.stringify(permissoes) : JSON.stringify(defaultPerms);

        const db = await getDatabase();
        
        // Verificar se e-mail já existe
        const existing = resultToArray(db.exec('SELECT id FROM usuarios WHERE email = ?', [email]));
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }

        const id = uuidv4();
        const senhaHash = await bcrypt.hash(senha, 10);
        
        db.run(
            'INSERT INTO usuarios (id, nome, email, senha_hash, cargo, ativo, permissoes) VALUES (?, ?, ?, ?, ?, 1, ?)',
            [id, nome, email, senhaHash, cargo, permsStr]
        );
        saveDatabase();

        const newUser = resultToArray(db.exec('SELECT id, nome, email, cargo, ativo, permissoes FROM usuarios WHERE id = ?', [id]))[0];
        try { newUser.permissoes = JSON.parse(newUser.permissoes); } catch { /* ignore */ }
        res.status(201).json(newUser);
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
});

// ─── PUT /api/usuarios/:id — Atualizar um usuário ─────────────────────────
router.put('/:id', requireMasterAdmin, async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM usuarios WHERE id = ?', [req.params.id]));
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const old = existing[0];
        const { nome, email, cargo, senha, ativo, permissoes } = req.body;

        // Se o email foi alterado, checar se já não existe outro com o mesmo email
        if (email && email !== old.email) {
            const checkEmail = resultToArray(db.exec('SELECT id FROM usuarios WHERE email = ?', [email]));
            if (checkEmail.length > 0) {
                return res.status(400).json({ error: 'Este e-mail já está em uso por outro usuário.' });
            }
        }

        let senhaHash = old.senha_hash;
        if (senha && senha.trim().length > 0) {
            senhaHash = await bcrypt.hash(senha, 10);
        }

        const permsStr = permissoes ? JSON.stringify(permissoes) : old.permissoes;

        db.run(
            'UPDATE usuarios SET nome = ?, email = ?, cargo = ?, senha_hash = ?, ativo = ?, permissoes = ? WHERE id = ?',
            [nome ?? old.nome, email ?? old.email, cargo ?? old.cargo, senhaHash, ativo !== undefined ? ativo : old.ativo, permsStr, req.params.id]
        );
        saveDatabase();
        
        const updatedUser = resultToArray(db.exec('SELECT id, nome, email, cargo, ativo, permissoes FROM usuarios WHERE id = ?', [req.params.id]))[0];
        try { updatedUser.permissoes = JSON.parse(updatedUser.permissoes); } catch { /* ignore */ }
        res.json(updatedUser);
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});

// ─── DELETE /api/usuarios/:id — Desativar/Excluir usuário ─────────────────
router.delete('/:id', requireMasterAdmin, async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT id, cargo FROM usuarios WHERE id = ?', [req.params.id]));
        
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Prevenir deletar a si mesmo
        if (req.params.id === req.usuario.id) {
             return res.status(400).json({ error: 'Você não pode excluir a sua própria conta.' });
        }

        // Excluir ou apenas desativar. Vamos optar por excluir fisicamente para manter limpo, 
        // ou desativar se houver muitas amarrações. O schema atual não amarra log severo.
        db.run('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
        saveDatabase();

        res.json({ message: 'Usuário excluído com sucesso.', id: req.params.id });
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
});

module.exports = router;

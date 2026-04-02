const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/connection');
const { SECRET_KEY, verifyToken } = require('../middleware/authMiddleware');

// Rota de Login: POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const db = await getDatabase();

        // Buscar usuário pelo e-mail
        const stmt = db.prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1 LIMIT 1");
        stmt.bind([email]);

        if (!stmt.step()) {
            stmt.free();
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        const usuario = stmt.getAsObject();
        stmt.free();

        // Verificar a senha usando bcrypt
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }

        // Gerar Token JWT (Expira em 24 horas)
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        let userPerms = { dashboard: true, ped: true, kanban: true, producao: true };
        try { if (usuario.permissoes) userPerms = JSON.parse(usuario.permissoes); } catch(e){}

        res.json({
            message: 'Login realizado com sucesso',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                cargo: usuario.cargo,
                permissoes: userPerms
            }
        });

    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ error: 'Erro interno no servidor de autenticação.' });
    }
});

// Rota para validar sessão atual e retornar os dados do usuário (usando JWT do Auth Header)
// Requer o authMiddleware, portanto se chegar aqui é porque o token é válido
router.get('/me', verifyToken, async (req, res) => {
    // req.usuario vem do middleware `verifyToken`
    if (!req.usuario) {
        return res.status(401).json({ error: 'Sessão inválida.' });
    }

    try {
        const db = await getDatabase();
        const stmt = db.prepare("SELECT id, nome, email, cargo, ativo, permissoes FROM usuarios WHERE id = ? LIMIT 1");
        stmt.bind([req.usuario.id]);

        if (!stmt.step()) {
            stmt.free();
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const userDb = stmt.getAsObject();
        stmt.free();

        if (userDb.ativo !== 1) {
            return res.status(403).json({ error: 'Sua conta foi desativada.' });
        }

        let userPerms = { dashboard: true, ped: true, kanban: true, producao: true };
        try { if (userDb.permissoes) userPerms = JSON.parse(userDb.permissoes); } catch(e){}
        userDb.permissoes = userPerms;

        res.json({ usuario: userDb });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }
});

module.exports = router;

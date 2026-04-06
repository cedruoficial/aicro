const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'ctia-super-secret-key-2026';

function verifyToken(req, res, next) {
    // Permitir acesso às rotas públicas (ex: login, consulta) usando originalUrl
    const url = req.originalUrl || req.path;
    console.log(`[MIDDLEWARE] Verificando URL: originalUrl=${req.originalUrl}, path=${req.path}`);

    if (url.startsWith('/api/auth/login') || url.startsWith('/api/public') || url === '/api/network-info' || url.startsWith('/api/ai')) {
        console.log(`[MIDDLEWARE] Rota pública liberada: ${url}`);
        return next();
    }

    // Permitir uploads sem token para retrocompatibilidade por enquanto
    // if (url.startsWith('/api/upload-logo')) return next();

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // Formato: Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded; // Adiciona os dados do usuário na requisição
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
    }
}

module.exports = { verifyToken, SECRET_KEY };

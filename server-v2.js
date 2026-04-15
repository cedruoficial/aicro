/**
 * server-v2.js — Servidor dedicado para o novo sistema (frontend-v2)
 * Porta: 4000  →  http://cr128:4000
 *
 * Serve o build do frontend-v2 e faz proxy das chamadas /api para o
 * servidor principal (server.js) que continua rodando na porta 3000.
 */

require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const http    = require('http');
const os      = require('os');

const app  = express();
const PORT = process.env.PORT_V2 || 4000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLocalIp() {
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

// ─── Proxy /api → server.js na porta 3000 ────────────────────────────────────
// Todas as chamadas de API do novo frontend são encaminhadas para o backend
// original sem precisar duplicar nenhuma lógica de banco de dados.
app.use('/api', (req, res) => {
    const options = {
        hostname: 'localhost',
        port:     3000,
        path:     `/api${req.url}`,
        method:   req.method,
        headers:  {
            ...req.headers,
            host: 'localhost:3000',
        },
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('❌ Proxy error:', err.message);
        res.status(502).json({ error: 'Backend indisponível. Certifique-se de que server.js está rodando na porta 3000.' });
    });

    req.pipe(proxyReq, { end: true });
});

// ─── Também proxy para /uploads (imagens) ────────────────────────────────────
app.use('/uploads', (req, res) => {
    const options = {
        hostname: 'localhost',
        port:     3000,
        path:     `/uploads${req.url}`,
        method:   'GET',
        headers:  req.headers,
    };
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });
    proxyReq.on('error', () => res.status(404).end());
    proxyReq.end();
});

// ─── Serve o build do frontend-v2 ─────────────────────────────────────────────
const distPath = path.join(__dirname, 'frontend-v2', 'dist');

if (!fs.existsSync(distPath)) {
    console.error('⚠️  Build do frontend-v2 não encontrado em frontend-v2/dist/');
    console.error('   Execute primeiro:  cd frontend-v2 && npm run build');
    process.exit(1);
}

app.use(express.static(distPath));

// SPA catch-all — React Router precisa disso
app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    const ip = getLocalIp();
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   AICRO — Novo Sistema (v2)                      ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║   Local:       http://localhost:${PORT}              ║`);
    console.log(`║   Rede:        http://${ip}:${PORT}       ║`);
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║   API via proxy → http://localhost:3000          ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
});

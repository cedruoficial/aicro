const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase, saveDatabase } = require('../database/connection');

const router = express.Router();

// Tipo de teste agora é descritivo — registros unificados usam 'Completo'

// ─── Gerar código de rastreio único ──────────────────────────────────────────
function gerarCodigoRastreio() {
    const agora = new Date();
    const ano = agora.getFullYear().toString().slice(-2);
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CTIA-${ano}${mes}${dia}-${aleatorio}`;
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

// Helper: attach images to an ensaio object
function attachImages(db, ensaio) {
    if (!ensaio) return ensaio;
    const imgs = resultToArray(db.exec(
        'SELECT * FROM ensaio_imagens WHERE ensaio_id = ? ORDER BY ordem ASC, criado_em ASC',
        [ensaio.id]
    ));
    ensaio.imagens = imgs;
    return ensaio;
}

// ─── POST /api/ensaios — Criar novo ensaio ───────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const {
            cliente_id, cliente, data_ensaio, tipo_teste,
            projeto, modelo, cor, fornecedor, substrato, tecnologia, categoria, finalidade,
            ap, referencia,
            loc_armario, loc_prateleira, loc_caixa,
            caminho_rede, url_capa,
            resultado_ciclos, resultado_ciclos_umido,
            resultado_transferencia, resultado_solidez,
            resultado_visual, resultado_forca,
            resultado_ciclos_am1, resultado_ciclos_am2,
            resultado_ciclos_umido_am1, resultado_ciclos_umido_am2,
            resultado_forca_am1, resultado_forca_am2,
            condicao_stress, falha_dinamometro,
            conclusao, observacoes, status,
            etiquetas, descricao,
            param_temperatura, param_tempo, param_pressao
        } = req.body;

        if (!cliente || !data_ensaio) {
            return res.status(400).json({
                erro: 'Campos obrigatórios: cliente, data_ensaio'
            });
        }

        const db = await getDatabase();

        // Auto-create client if cliente_id not provided
        let resolvedClienteId = cliente_id;
        if (!resolvedClienteId) {
            const existing = resultToArray(db.exec('SELECT id FROM clientes WHERE nome = ?', [cliente.trim()]));
            if (existing.length > 0) {
                resolvedClienteId = existing[0].id;
            } else {
                resolvedClienteId = uuidv4();
                db.run('INSERT INTO clientes (id, nome) VALUES (?, ?)', [resolvedClienteId, cliente.trim()]);
            }
        }

        const id = uuidv4();
        const codigo_rastreio = gerarCodigoRastreio();

        db.run(`
            INSERT INTO ensaios
                (id, cliente_id, cliente, data_ensaio, tipo_teste, 
                 projeto, modelo, cor, fornecedor, substrato, tecnologia, categoria, finalidade,
                 ap, referencia,
                 loc_armario, loc_prateleira, loc_caixa, caminho_rede, url_capa,
                 resultado_ciclos, resultado_ciclos_umido, resultado_transferencia,
                 resultado_solidez, resultado_visual, resultado_forca, 
                 resultado_ciclos_am1, resultado_ciclos_am2,
                 resultado_ciclos_umido_am1, resultado_ciclos_umido_am2,
                 resultado_forca_am1, resultado_forca_am2,
            condicao_stress, falha_dinamometro,
                 conclusao, observacoes, codigo_rastreio, retirado, status,
                 etiquetas, descricao,
                 param_temperatura, param_tempo, param_pressao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
        `, [
            id, resolvedClienteId, cliente.trim(), data_ensaio, tipo_teste,
            projeto || '', modelo || '', cor || '', fornecedor || 'Cromotransfer', substrato || '', tecnologia || '', categoria || '', finalidade || '',
            ap || '', referencia || '',
            loc_armario || '', loc_prateleira || '', loc_caixa || '',
            caminho_rede || '', url_capa || '',
            resultado_ciclos || '', resultado_ciclos_umido || '',
            resultado_transferencia || '', resultado_solidez || '',
            resultado_visual || '', resultado_forca || '',
            resultado_ciclos_am1 || '', resultado_ciclos_am2 || '',
            resultado_ciclos_umido_am1 || '', resultado_ciclos_umido_am2 || '',
            resultado_forca_am1 || '', resultado_forca_am2 || '',
            condicao_stress || '', falha_dinamometro || '',
            conclusao || '', observacoes || '', codigo_rastreio, status || 'Amostras Recebidas',
            etiquetas || '', descricao || '',
            param_temperatura || '', param_tempo || '', param_pressao || ''
        ]);
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [id]));
        const ensaio = attachImages(db, rows[0]);
        res.status(201).json(ensaio);
    } catch (err) {
        console.error('Erro ao criar ensaio:', err);
        res.status(500).json({ erro: 'Erro interno ao criar ensaio.' });
    }
});

// ─── GET /api/ensaios — Listar todos (opcionalmente filtrar por cliente) ─────
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const { busca, cliente_id } = req.query;

        let rows;
        if (cliente_id) {
            if (busca) {
                const termo = `%${busca}%`;
                rows = resultToArray(db.exec(
                    `SELECT * FROM ensaios WHERE cliente_id = ? AND (cliente LIKE ? OR tipo_teste LIKE ? OR ap LIKE ? OR referencia LIKE ? OR codigo_rastreio LIKE ?) ORDER BY data_ensaio DESC`,
                    [cliente_id, termo, termo, termo, termo, termo]
                ));
            } else {
                rows = resultToArray(db.exec(
                    'SELECT * FROM ensaios WHERE cliente_id = ? ORDER BY data_ensaio DESC',
                    [cliente_id]
                ));
            }
        } else if (busca) {
            const termo = `%${busca}%`;
            rows = resultToArray(db.exec(
                `SELECT * FROM ensaios WHERE cliente LIKE ? OR tipo_teste LIKE ? OR ap LIKE ? OR referencia LIKE ? OR codigo_rastreio LIKE ? ORDER BY data_ensaio DESC`,
                [termo, termo, termo, termo, termo]
            ));
        } else {
            rows = resultToArray(db.exec('SELECT * FROM ensaios ORDER BY data_ensaio DESC'));
        }

        // Attach images to each ensaio
        rows.forEach(e => attachImages(db, e));

        res.json(rows);
    } catch (err) {
        console.error('Erro ao listar ensaios:', err);
        res.status(500).json({ erro: 'Erro interno ao listar ensaios.' });
    }
});

// ─── GET /api/ensaios/:id — Buscar por ID ────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const rows = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));

        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        const ensaio = attachImages(db, rows[0]);
        res.json(ensaio);
    } catch (err) {
        console.error('Erro ao buscar ensaio:', err);
        res.status(500).json({ erro: 'Erro interno ao buscar ensaio.' });
    }
});

// ─── PUT /api/ensaios/:id — Atualizar ────────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        const old = existing[0];
        const {
            cliente, data_ensaio, tipo_teste,
            projeto, modelo, cor, fornecedor, substrato, tecnologia, categoria, finalidade,
            ap, referencia,
            loc_armario, loc_prateleira, loc_caixa,
            caminho_rede, url_capa,
            resultado_ciclos, resultado_ciclos_umido,
            resultado_transferencia, resultado_solidez,
            resultado_visual, resultado_forca,
            resultado_ciclos_am1, resultado_ciclos_am2,
            resultado_ciclos_umido_am1, resultado_ciclos_umido_am2,
            resultado_forca_am1, resultado_forca_am2,
            condicao_stress, falha_dinamometro,
            conclusao, observacoes, retirado, status,
            etiquetas, descricao,
            param_temperatura, param_tempo, param_pressao
        } = req.body;

        // Se for um patch parou apenas pro status (arraste de Kanban), 
        // a gente não deve validar tipo_teste obrigatório e os defaults caem no operador ?? old
        // tipo_teste agora é livre — registros unificados usam 'Completo'

        db.run(`
            UPDATE ensaios
            SET cliente = ?, data_ensaio = ?, tipo_teste = ?,
            projeto = ?, modelo = ?, cor = ?, fornecedor = ?, substrato = ?, tecnologia = ?, categoria = ?, finalidade = ?,
            ap = ?, referencia = ?,
            loc_armario = ?, loc_prateleira = ?, loc_caixa = ?,
            caminho_rede = ?, url_capa = ?,
            resultado_ciclos = ?, resultado_ciclos_umido = ?,
            resultado_transferencia = ?, resultado_solidez = ?,
            resultado_visual = ?, resultado_forca = ?,
            resultado_ciclos_am1 = ?, resultado_ciclos_am2 = ?,
            resultado_ciclos_umido_am1 = ?, resultado_ciclos_umido_am2 = ?,
            resultado_forca_am1 = ?, resultado_forca_am2 = ?,
            condicao_stress = ?, falha_dinamometro = ?,
            conclusao = ?, observacoes = ?, retirado = ?, status = ?,
            etiquetas = ?, descricao = ?,
            param_temperatura = ?, param_tempo = ?, param_pressao = ?,
            atualizado_em = datetime('now', 'localtime')
            WHERE id = ?
            `, [
            cliente ?? old.cliente,
            data_ensaio ?? old.data_ensaio,
            tipo_teste ?? old.tipo_teste,
            projeto ?? old.projeto,
            modelo ?? old.modelo,
            cor ?? old.cor,
            fornecedor ?? old.fornecedor,
            substrato ?? old.substrato,
            tecnologia ?? old.tecnologia,
            categoria ?? old.categoria,
            finalidade ?? old.finalidade,
            ap ?? old.ap,
            referencia ?? old.referencia,
            loc_armario ?? old.loc_armario,
            loc_prateleira ?? old.loc_prateleira,
            loc_caixa ?? old.loc_caixa,
            caminho_rede ?? old.caminho_rede,
            url_capa ?? old.url_capa,
            resultado_ciclos ?? old.resultado_ciclos,
            resultado_ciclos_umido ?? old.resultado_ciclos_umido,
            resultado_transferencia ?? old.resultado_transferencia,
            resultado_solidez ?? old.resultado_solidez,
            resultado_visual ?? old.resultado_visual,
            resultado_forca ?? old.resultado_forca,
            resultado_ciclos_am1 ?? old.resultado_ciclos_am1,
            resultado_ciclos_am2 ?? old.resultado_ciclos_am2,
            resultado_ciclos_umido_am1 ?? old.resultado_ciclos_umido_am1,
            resultado_ciclos_umido_am2 ?? old.resultado_ciclos_umido_am2,
            resultado_forca_am1 ?? old.resultado_forca_am1,
            resultado_forca_am2 ?? old.resultado_forca_am2,
            condicao_stress ?? old.condicao_stress,
            falha_dinamometro ?? old.falha_dinamometro,
            conclusao ?? old.conclusao,
            observacoes ?? old.observacoes,
            retirado ?? old.retirado,
            status ?? old.status,
            etiquetas ?? old.etiquetas,
            descricao ?? old.descricao,
            param_temperatura ?? old.param_temperatura,
            param_tempo ?? old.param_tempo,
            param_pressao ?? old.param_pressao,
            req.params.id
        ]);
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));
        const ensaio = attachImages(db, rows[0]);
        res.json(ensaio);
    } catch (err) {
        console.error('Erro ao atualizar ensaio:', err);
        res.status(500).json({ erro: 'Erro interno ao atualizar ensaio.' });
    }
});

// ─── PUT /api/ensaios/:id/retirar — Marcar como retirado ─────────────────────
router.put('/:id/retirar', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        db.run(`
            UPDATE ensaios SET
                retirado = 1,
            loc_armario = '',
            loc_prateleira = '',
            loc_caixa = '',
            atualizado_em = datetime('now', 'localtime')
            WHERE id = ?
            `, [req.params.id]);
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));
        const ensaio = attachImages(db, rows[0]);
        res.json(ensaio);
    } catch (err) {
        console.error('Erro ao marcar como retirado:', err);
        res.status(500).json({ erro: 'Erro interno ao retirar amostra.' });
    }
});

// ─── DELETE /api/ensaios/:id — Excluir ───────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT * FROM ensaios WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        // Delete linked records first
        db.run('DELETE FROM ensaio_imagens WHERE ensaio_id = ?', [req.params.id]);
        db.run('DELETE FROM ensaio_atividades WHERE ensaio_id = ?', [req.params.id]);
        db.run('DELETE FROM ensaios WHERE id = ?', [req.params.id]);
        saveDatabase();

        res.json({ mensagem: 'Ensaio excluído com sucesso.', id: req.params.id });
    } catch (err) {
        console.error('Erro ao excluir ensaio:', err);
        res.status(500).json({ erro: 'Erro interno ao excluir ensaio.' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Imagens do Ensaio
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POST /api/ensaios/:id/imagens — Adicionar imagens (URLs) ────────────────
router.post('/:id/imagens', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT id FROM ensaios WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        const { urls } = req.body; // Array of { url, nome? }
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ erro: 'Forneça um array de urls.' });
        }

        const inserted = [];
        for (let i = 0; i < urls.length; i++) {
            const item = typeof urls[i] === 'string' ? { url: urls[i] } : urls[i];
            const imgId = uuidv4();
            const cat = item.categoria_foto || 'Outra';
            db.run(
                'INSERT INTO ensaio_imagens (id, ensaio_id, url, nome, ordem, categoria_foto) VALUES (?, ?, ?, ?, ?, ?)',
                [imgId, req.params.id, item.url, item.nome || '', i, cat]
            );
            inserted.push({ id: imgId, ensaio_id: req.params.id, url: item.url, nome: item.nome || '', ordem: i, categoria_foto: cat });
        }
        saveDatabase();

        res.status(201).json(inserted);
    } catch (err) {
        console.error('Erro ao adicionar imagens:', err);
        res.status(500).json({ erro: 'Erro interno ao adicionar imagens.' });
    }
});

// ─── DELETE /api/ensaios/:id/imagens/:imgId — Excluir imagem ─────────────────
router.delete('/:id/imagens/:imgId', async (req, res) => {
    try {
        const db = await getDatabase();
        db.run('DELETE FROM ensaio_imagens WHERE id = ? AND ensaio_id = ?', [req.params.imgId, req.params.id]);
        saveDatabase();
        res.json({ mensagem: 'Imagem excluída.', id: req.params.imgId });
    } catch (err) {
        console.error('Erro ao excluir imagem:', err);
        res.status(500).json({ erro: 'Erro interno ao excluir imagem.' });
    }
});

// ─── POST /api/ensaios/:id/upload — Upload de arquivos ───────────────────────
router.post('/:id/upload', async (req, res) => {
    try {
        const db = await getDatabase();
        const existing = resultToArray(db.exec('SELECT id FROM ensaios WHERE id = ?', [req.params.id]));

        if (existing.length === 0) {
            return res.status(404).json({ erro: 'Ensaio não encontrado.' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        const categoria_foto = req.body.categoria_foto || 'Outra';

        const inserted = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const imgId = uuidv4();
            const url = `/uploads/${file.filename}`;
            db.run(
                'INSERT INTO ensaio_imagens (id, ensaio_id, url, nome, ordem, categoria_foto) VALUES (?, ?, ?, ?, ?, ?)',
                [imgId, req.params.id, url, file.originalname, i, categoria_foto]
            );
            inserted.push({ id: imgId, ensaio_id: req.params.id, url, nome: file.originalname, ordem: i, categoria_foto });
        }
        saveDatabase();

        res.status(201).json(inserted);
    } catch (err) {
        console.error('Erro ao fazer upload:', err);
        res.status(500).json({ erro: 'Erro interno ao fazer upload.' });
    }
});

// ─── Atividades (Comentários) ──────────────────────────────────────────────

// GET /api/ensaios/:id/atividades
router.get('/:id/atividades', async (req, res) => {
    try {
        const db = await getDatabase();
        const rows = resultToArray(db.exec(
            'SELECT * FROM ensaio_atividades WHERE ensaio_id = ? ORDER BY criado_em ASC',
            [req.params.id]
        ));
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar atividades:', err);
        res.status(500).json({ erro: 'Erro ao buscar atividades.' });
    }
});

// PATCH /api/ensaios/:id/etiquetas (Quick Label Edit sem senha)
router.patch('/:id/etiquetas', async (req, res) => {
    try {
        const db = await getDatabase();
        const { etiquetas } = req.body;

        db.run(
            'UPDATE ensaios SET etiquetas = ?, atualizado_em = datetime("now", "localtime") WHERE id = ?',
            [etiquetas, req.params.id]
        );
        saveDatabase();
        res.json({ mensagem: 'Etiquetas atualizadas', id: req.params.id, etiquetas });
    } catch (err) {
        console.error('Erro ao atualizar as etiquetas via quick edit:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ensaios/:id/atividades
router.post('/:id/atividades', async (req, res) => {
    try {
        const { texto, usuario } = req.body;
        if (!texto) return res.status(400).json({ erro: 'Texto é obrigatório.' });

        const db = await getDatabase();
        const id = uuidv4();
        db.run(
            'INSERT INTO ensaio_atividades (id, ensaio_id, texto, usuario) VALUES (?, ?, ?, ?)',
            [id, req.params.id, texto, usuario || 'Analista']
        );
        saveDatabase();

        const rows = resultToArray(db.exec('SELECT * FROM ensaio_atividades WHERE id = ?', [id]));
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Erro ao criar atividade:', err);
        res.status(500).json({ erro: 'Erro ao criar atividade.' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getDatabase, saveDatabase } = require('../database/connection');

// GET /api/configuracoes
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const config = db.exec('SELECT * FROM configuracoes WHERE id = 1');

        if (config.length > 0 && config[0].values.length > 0) {
            const cols = config[0].columns;
            const vals = config[0].values[0];
            const obj = {};
            cols.forEach((col, i) => obj[col] = vals[i]);
            res.json(obj);
        } else {
            res.status(404).json({ error: 'Configurações não encontradas.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/configuracoes (Single update of ID 1)
router.put('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const {
            analista_nome, analista_cargo,
            gerente_nome, gerente_cargo,
            empresa_nome, empresa_endereco, empresa_email, empresa_logo, senha_admin, kanban_colunas,
            etiquetas_config, analistas_lista, url_publica, pcp_spreadsheet_path
        } = req.body;

        console.log("Recebendo configurações para salvar:", {
            analistas_lista,
            etiquetas_config,
            kanban_colunas_present: !!kanban_colunas,
            pcp_spreadsheet_path
        });

        // Use as colunas atuais se não vierem no payload para evitar resetar o kanban
        const row = db.exec('SELECT kanban_colunas, pcp_spreadsheet_path FROM configuracoes WHERE id = 1');
        const currentCols = (row.length > 0 && row[0].values.length > 0) ? row[0].values[0][0] : 'Amostras Recebidas,Em Ensaio,Laudo Gerado';
        const currentPcp = (row.length > 0 && row[0].values.length > 0) ? row[0].values[0][1] : '';

        db.run(`
            UPDATE configuracoes SET 
                analista_nome = ?, analista_cargo = ?, 
                gerente_nome = ?, gerente_cargo = ?, 
                empresa_nome = ?, empresa_endereco = ?, empresa_email = ?, empresa_logo = ?, senha_admin = ?, kanban_colunas = ?, etiquetas_config = ?, analistas_lista = ?, url_publica = ?, pcp_spreadsheet_path = ?
            WHERE id = 1
        `, [
            analista_nome, analista_cargo,
            gerente_nome, gerente_cargo,
            empresa_nome, empresa_endereco, empresa_email, empresa_logo || '', senha_admin || '',
            kanban_colunas || currentCols,
            etiquetas_config || '[{"cor":"#4BCE97","nome":"Concluído"},{"cor":"#F5CD47","nome":"Atenção"},{"cor":"#FEA362","nome":"Prioridade"},{"cor":"#F87168","nome":"Urgente"},{"cor":"#9F8FEF","nome":"Aguardando"},{"cor":"#579DFF","nome":"Em Análise"}]',
            (analistas_lista !== undefined && analistas_lista !== null) ? analistas_lista : '["Lúcio Monteiro", "Jeferson Bueno"]',
            url_publica || '',
            (pcp_spreadsheet_path !== undefined && pcp_spreadsheet_path !== null) ? pcp_spreadsheet_path : currentPcp
        ]);


        saveDatabase();
        console.log("Configurações salvas com sucesso no banco.");
        res.json({ message: 'Configurações atualizadas com sucesso' });
    } catch (err) {
        console.error("Erro ao salvar configurações no server:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const fs = require('fs');
const { getDatabase } = require('../database/connection');

// Helper to get system settings
async function getSystemSettings() {
    const db = await getDatabase();
    const result = db.exec('SELECT * FROM configuracoes LIMIT 1');
    if (!result || result.length === 0) return {};
    const cols = result[0].columns;
    const row = result[0].values[0];
    const obj = {};
    cols.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
}

router.get('/buscar', async (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase().trim();
        if (!query) {
            return res.status(400).json({ error: 'Termo de busca vazio.' });
        }

        if (query === 'fake') {
            return res.json([
                {
                    aba: 'Agendamento Semanal',
                    maquina: 'ATMA 01 (Digital)',
                    linha_match: 10,
                    coluna_match: 2,
                    valor_encontrado: 'fake',
                    data: '26/03/2026',
                    status: 'FINALIZADA',
                    detalhes: ['🎯 [ALVO] AP 4021 - Filme Transfer', 'Quantidade: 5.000 fls', 'Operador: Carlos Silva']
                },
                {
                    aba: 'Agendamento Semanal',
                    maquina: 'SAKURAI 02',
                    linha_match: 15,
                    coluna_match: 3,
                    valor_encontrado: 'fake',
                    data: '27/03/2026',
                    status: 'EM ANDAMENTO',
                    detalhes: ['🎯 [ALVO] AP 4055 - Verniz Localizado', 'Quantidade: 12.000 fls', 'Operador: João Pedro', 'Prioridade Alta']
                },
                {
                    aba: 'Agendamento Mensal',
                    maquina: 'ESTUFA CONTÍNUA',
                    linha_match: 22,
                    coluna_match: 4,
                    valor_encontrado: 'fake',
                    data: '28/03/2026',
                    status: 'AGUARDANDO',
                    detalhes: ['🎯 [ALVO] AP 4060 - Secagem Tinta Branca', 'Quantidade: 8.500 fls', 'Tempo Est.: 4h']
                },
                {
                    aba: 'Agendamento Semanal',
                    maquina: 'ATMA 03',
                    linha_match: 5,
                    coluna_match: 2,
                    valor_encontrado: 'fake',
                    data: '29/03/2026',
                    status: 'LIBERADA',
                    detalhes: ['🎯 [ALVO] AP 4099 - Brilho Extra', 'Quantidade: 3.000 fls', 'Material reservado no estoque']
                },
                {
                    aba: 'Revisão e CTIA',
                    maquina: 'BANCADA DE INSPEÇÃO',
                    linha_match: 30,
                    coluna_match: 5,
                    valor_encontrado: 'fake',
                    data: '30/03/2026',
                    status: 'Pendente',
                    detalhes: ['🎯 [ALVO] Inspeção Final AP 4021', 'Amostragem: 100 fls', 'Testes de Aderência']
                }
            ]);
        }

        const config = await getSystemSettings();
        const pcpFilePath = config.pcp_spreadsheet_path;

        if (!pcpFilePath || !fs.existsSync(pcpFilePath)) {
            return res.status(400).json({ error: 'Caminho da planilha PCP ("Programação") não configurado nas Configurações, ou arquivo não foi encontrado no servidor.' });
        }

        const workbook = xlsx.readFile(pcpFilePath);
        const resultados = [];

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });
            
            for (let r = 0; r < data.length; r++) {
                const row = data[r] || [];
                for (let c = 0; c < row.length; c++) {
                    const cellVal = (row[c] || '').toString().toLowerCase();
                    if (cellVal.includes(query)) {
                        
                        // Encontrou um match! Extrair o "bloco"
                        const nomeMaquina = (data[0] && data[0][c]) || (data[1] && data[1][c]) || `Desconhecida (Col ${c+1})`;
                        
                        const start = Math.max(0, r - 11);
                        const end = Math.min(data.length - 1, r + 11);
                        
                        const detalhes = [];
                        let dataAgendamento = null;
                        let statusPrincipal = null;

                        for (let i = start; i <= end; i++) {
                            const val = (data[i] && data[i][c] || '').toString().trim();
                            if (val) {
                                let label = '';
                                if (i === r) label = '🎯 [ALVO] ';
                                
                                // Detectar data no formato dd/mm/yyyy hh:mm ou similar
                                if (val.match(/\d{2}\/\d{2}\/\d{4}/)) dataAgendamento = val;
                                
                                const upVal = val.toUpperCase();
                                if (upVal === 'LIBERADA' || upVal === 'EM ANDAMENTO' || upVal === 'FINALIZADA' || upVal === 'AGUARDANDO') {
                                    if(!statusPrincipal) statusPrincipal = upVal;
                                }

                                if (i > 1 && !val.match(/\d{2}\/\d{2}\/\d{4}/)) { // Pula nome de maq e a propria linha data
                                    detalhes.push(label + val);
                                }
                            }
                        }

                        // Se a data não for achada nesse alcance, tenta achar nas celulas fixas acima (ex linha 1/2)
                        if (!dataAgendamento) {
                            if (data[1] && data[1][c] && data[1][c].toString().match(/\d{2}\/\d{2}\/\d{4}/)) {
                                dataAgendamento = data[1][c].toString();
                            }
                        }

                        resultados.push({
                            aba: sheetName,
                            maquina: nomeMaquina.trim(),
                            linha_match: r + 1,
                            coluna_match: c + 1,
                            valor_encontrado: row[c],
                            data: dataAgendamento || 'Data Indefinida',
                            status: statusPrincipal || 'Pendente',
                            detalhes: detalhes
                        });
                    }
                }
            }
        }

        // Removed duplicatas simples do mesmo bloco (mesma coluna, aba e data de bloco)
        const filterKey = r => `${r.aba}-${r.maquina}-${r.data}`;
        const map = new Map();
        resultados.forEach(r => map.set(filterKey(r), r));
        const cleanResults = Array.from(map.values());

        // Ordenar os resultados pelas datas por segurança (mesclando a string local em date object)
        cleanResults.sort((a, b) => {
            const pa = parseBRDate(a.data);
            const pb = parseBRDate(b.data);
            return pa - pb;
        });

        res.json(cleanResults);
    } catch (err) {
        console.error('Erro na busca PCP:', err);
        res.status(500).json({ error: 'Erro interno ao ler a planilha: ' + err.message });
    }
});

// Helper para sort
function parseBRDate(str) {
    if (!str) return new Date(0);
    const m = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) {
        return new Date(m[3], m[2]-1, m[1]);
    }
    return new Date(0);
}

module.exports = router;

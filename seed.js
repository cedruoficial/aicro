// Seed script — popula dados de teste no banco
const { getDatabase, saveDatabase } = require('./database/connection');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

function gerarCodigoRastreio() {
    const agora = new Date();
    const ano = agora.getFullYear().toString().slice(-2);
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CTIA-${ano}${mes}${dia}-${aleatorio}`;
}

const CLIENTES = [
    { nome: 'Calçados Silva', logo_url: 'https://ui-avatars.com/api/?name=Calcados+Silva&background=6366F1&color=fff&size=200&bold=true' },
    { nome: 'Couro Nobre Ltda', logo_url: 'https://ui-avatars.com/api/?name=Couro+Nobre&background=22C55E&color=fff&size=200&bold=true' },
    { nome: 'TechSole Indústria', logo_url: 'https://ui-avatars.com/api/?name=TechSole&background=8B5CF6&color=fff&size=200&bold=true' },
    { nome: 'Palmilhas Premium SA', logo_url: 'https://ui-avatars.com/api/?name=Palmilhas+Premium&background=F97316&color=fff&size=200&bold=true' },
    { nome: 'Fábrica de Botas Horizonte', logo_url: 'https://ui-avatars.com/api/?name=Botas+Horizonte&background=EF4444&color=fff&size=200&bold=true' },
];

const ENSAIOS = [
    {
        clienteNome: 'Calçados Silva',
        data_ensaio: '2026-02-23',
        tipo_teste: 'Bally',
        ap: 'AP-2026-001',
        referencia: 'REF-CS-0045',
        loc_armario: 'Armário A',
        loc_prateleira: 'Prateleira 2',
        loc_caixa: 'Caixa 10',
        caminho_rede: '\\\\servidor\\ensaios\\silva',
        url_capa: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        resultado_ciclos: '35000', resultado_ciclos_umido: '', resultado_transferencia: '', resultado_solidez: '', resultado_visual: '',
        conclusao: 'Aprovado'
    },
    {
        clienteNome: 'Couro Nobre Ltda',
        data_ensaio: '2026-02-20',
        tipo_teste: 'Veslic',
        ap: 'AP-2026-002',
        referencia: 'REF-CN-0112',
        loc_armario: 'Armário B',
        loc_prateleira: 'Prateleira 1',
        loc_caixa: 'Caixa 5',
        caminho_rede: '\\\\servidor\\ensaios\\couro-nobre',
        url_capa: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
        resultado_ciclos: '28000', resultado_ciclos_umido: '14000', resultado_transferencia: '4', resultado_solidez: '4', resultado_visual: '',
        conclusao: 'Aprovado'
    },
    {
        clienteNome: 'TechSole Indústria',
        data_ensaio: '2026-02-18',
        tipo_teste: 'Dinamômetro',
        ap: 'AP-2026-003',
        referencia: 'REF-TS-0078',
        loc_armario: 'Armário C',
        loc_prateleira: 'Prateleira 3',
        loc_caixa: 'Caixa 2',
        caminho_rede: '\\\\servidor\\ensaios\\techsole',
        url_capa: '',
        resultado_ciclos: '', resultado_ciclos_umido: '', resultado_transferencia: '', resultado_solidez: '', resultado_visual: '',
        conclusao: 'Aprovado'
    },
    {
        clienteNome: 'Palmilhas Premium SA',
        data_ensaio: '2026-02-15',
        tipo_teste: 'Hidrólise',
        ap: 'AP-2026-004',
        referencia: 'REF-PP-0203',
        loc_armario: 'Armário A',
        loc_prateleira: 'Prateleira 4',
        loc_caixa: 'Caixa 8',
        caminho_rede: '\\\\servidor\\ensaios\\palmilhas',
        url_capa: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
        resultado_ciclos: '', resultado_ciclos_umido: '', resultado_transferencia: '', resultado_solidez: '', resultado_visual: 'Danos Severos',
        conclusao: 'Reprovado'
    },
    {
        clienteNome: 'Calçados Silva',
        data_ensaio: '2026-02-10',
        tipo_teste: 'Veslic',
        ap: 'AP-2026-005',
        referencia: 'REF-CS-0046',
        loc_armario: 'Armário A',
        loc_prateleira: 'Prateleira 1',
        loc_caixa: 'Caixa 3',
        caminho_rede: '\\\\servidor\\ensaios\\silva-2',
        url_capa: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600',
        resultado_ciclos: '20000', resultado_ciclos_umido: '10000', resultado_transferencia: '2', resultado_solidez: '2', resultado_visual: '',
        conclusao: 'Reprovado'
    },
    {
        clienteNome: 'Fábrica de Botas Horizonte',
        data_ensaio: '2026-02-05',
        tipo_teste: 'Outros',
        ap: 'AP-2026-006',
        referencia: 'REF-BH-0015',
        loc_armario: 'Armário D',
        loc_prateleira: 'Prateleira 1',
        loc_caixa: 'Caixa 3',
        caminho_rede: '',
        url_capa: 'https://images.unsplash.com/photo-1605733160310-da7894f9aef1?w=600',
        resultado_ciclos: '', resultado_ciclos_umido: '', resultado_transferencia: '', resultado_solidez: '', resultado_visual: '',
        conclusao: 'Aprovado'
    }
];

async function seed() {
    // Delete old DB to start fresh
    const dbPath = path.join(__dirname, 'ctia.db');
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️  Banco antigo removido.');
    }

    const db = await getDatabase();

    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
    const stmts = schema.split(';').map(s => s.trim()).filter(Boolean);
    for (const s of stmts) db.run(s);

    // Insert clientes
    const clienteMap = {};
    for (const c of CLIENTES) {
        const id = uuidv4();
        db.run('INSERT INTO clientes (id, nome, logo_url) VALUES (?, ?, ?)', [id, c.nome, c.logo_url]);
        clienteMap[c.nome] = id;
    }
    console.log(`✅ ${CLIENTES.length} clientes inseridos.`);

    // Insert ensaios
    for (const e of ENSAIOS) {
        const id = uuidv4();
        const codigo = gerarCodigoRastreio();
        const clienteId = clienteMap[e.clienteNome];
        db.run(
            `INSERT INTO ensaios (id, cliente_id, cliente, data_ensaio, tipo_teste, ap, referencia,
             loc_armario, loc_prateleira, loc_caixa, caminho_rede, url_capa,
             resultado_ciclos, resultado_ciclos_umido, resultado_transferencia,
             resultado_solidez, resultado_visual, conclusao, codigo_rastreio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, clienteId, e.clienteNome, e.data_ensaio, e.tipo_teste, e.ap, e.referencia,
                e.loc_armario, e.loc_prateleira, e.loc_caixa, e.caminho_rede, e.url_capa,
                e.resultado_ciclos, e.resultado_ciclos_umido, e.resultado_transferencia,
                e.resultado_solidez, e.resultado_visual, e.conclusao, codigo]
        );
    }
    console.log(`✅ ${ENSAIOS.length} ensaios inseridos.`);

    saveDatabase();
    console.log('🎉 Seed completo!');
}

seed();

const { getDatabase, saveDatabase } = require('./database/connection');
const fs = require('fs');
const path = require('path');

async function migrate() {
    console.log('Iniciando migração: Adicionando coluna empresa_logo...');

    const db = await getDatabase();

    try {
        // Tenta adicionar a coluna. Vai falhar silenciosamente se já existir.
        db.run('ALTER TABLE configuracoes ADD COLUMN empresa_logo TEXT NOT NULL DEFAULT ""');
        console.log('✓ Coluna "empresa_logo" adicionada com sucesso.');
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log('✓ Coluna "empresa_logo" já existe. Nenhuma alteração necessária.');
        } else {
            console.error('Erro ao adicionar coluna:', e.message);
        }
    }

    saveDatabase();

    // Update schema.sql as well for new setups
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    if (!schema.includes('empresa_logo')) {
        schema = schema.replace(
            "empresa_email     TEXT NOT NULL DEFAULT 'ctia.lab@cromotransfer.com',",
            "empresa_email     TEXT NOT NULL DEFAULT 'ctia.lab@cromotransfer.com',\n    empresa_logo      TEXT NOT NULL DEFAULT '',"
        );
        fs.writeFileSync(schemaPath, schema);
        console.log('✓ schema.sql atualizado.');
    } else {
        console.log('✓ schema.sql já atualizado.');
    }

    console.log('Migração concluída!');
}

migrate().catch(console.error);

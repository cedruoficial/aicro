const fs = require('fs');
const path = require('path');
const { getDatabase, saveDatabase } = require('./connection');

async function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    const db = await getDatabase();
    db.run(schema);

    // Migration pass: Ensure 'permissoes' column exists in 'usuarios'
    try {
        db.exec(`ALTER TABLE usuarios ADD COLUMN permissoes TEXT NOT NULL DEFAULT '{"dashboard":true,"ped":true,"kanban":true,"producao":true}'`);
        console.log('Migração efetuada: Coluna [permissoes] adicionada em [usuarios]');
    } catch (err) {
        // Table probably already has the column, ignore
    }

    saveDatabase();

    console.log('✅ Banco de dados CTIA inicializado com sucesso!');
    console.log(`   Arquivo: ${path.join(__dirname, '..', 'ctia.db')}`);
}

initializeDatabase();

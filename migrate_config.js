const { getDatabase, saveDatabase } = require('./database/connection');

async function migrateConfig() {
    try {
        const db = await getDatabase();
        console.log("Adding 'configuracoes' table...");

        db.run(`
            CREATE TABLE IF NOT EXISTS configuracoes (
                id INTEGER PRIMARY KEY DEFAULT 1,
                analista_nome TEXT NOT NULL DEFAULT 'Lúcio Monteiro',
                analista_cargo TEXT NOT NULL DEFAULT 'Analista de Laboratório',
                gerente_nome TEXT NOT NULL DEFAULT 'Jeferson Bueno',
                gerente_cargo TEXT NOT NULL DEFAULT 'Gerente de Processos',
                empresa_nome TEXT NOT NULL DEFAULT 'CTIA — CROMOTRANSFER',
                empresa_endereco TEXT NOT NULL DEFAULT 'R. Kesser Zattar, 162 - João Costa, Joinville - SC',
                empresa_email TEXT NOT NULL DEFAULT 'ctia.lab@cromotransfer.com'
            );
        `);

        // Insert default row if empty
        const config = db.exec(`SELECT * FROM configuracoes WHERE id = 1`);
        if (!config || config.length === 0 || config[0].values.length === 0) {
            db.run(`
                INSERT INTO configuracoes (id, analista_nome, analista_cargo, gerente_nome, gerente_cargo, empresa_nome, empresa_endereco, empresa_email)
                VALUES (1, 'Lúcio Monteiro', 'Analista de Laboratório', 'Jeferson Bueno', 'Gerente de Processos', 'CTIA — CROMOTRANSFER', 'R. Kesser Zattar, 162 - João Costa, Joinville - SC', 'ctia.lab@cromotransfer.com')
            `);
        }

        saveDatabase();
        console.log("Database update finished.");
    } catch (err) {
        console.error("Critical error:", err);
    }
}

migrateConfig();

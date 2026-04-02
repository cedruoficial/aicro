// migrate_status.js
const { getDatabase, saveDatabase } = require('./database/connection');

(async () => {
    try {
        console.log('Iniciando migração: Adicionando coluna status...');
        const db = await getDatabase();

        // Verifica se a coluna já existe (para ser idempotente)
        let hasColumn = false;
        try {
            const result = db.exec("PRAGMA table_info(ensaios)");
            if (result.length > 0) {
                const columns = result[0].values.map(row => row[1]); // índice 1 é o nome da coluna no PRAGMA
                if (columns.includes('status')) {
                    hasColumn = true;
                }
            }
        } catch (e) {
            console.error("Erro ao verificar colunas:", e);
        }

        if (!hasColumn) {
            db.run(`ALTER TABLE ensaios ADD COLUMN status TEXT NOT NULL DEFAULT 'Amostras Recebidas'`);
            saveDatabase();
            console.log('✅ Migração concluída com sucesso! Coluna "status" adicionada.');
        } else {
            console.log('A coluna "status" já existe. Nenhuma alteração foi feita.');
        }

    } catch (err) {
        console.error('❌ Erro durante a migração:', err);
    }
})();

const { getDatabase, saveDatabase } = require('./database/connection');

async function migrateVulca() {
    try {
        const db = await getDatabase();
        console.log("Adding Vulcabras columns to 'ensaios'...");

        const cols = [
            "projeto TEXT NOT NULL DEFAULT ''",
            "modelo TEXT NOT NULL DEFAULT ''",
            "cor TEXT NOT NULL DEFAULT ''",
            "fornecedor TEXT NOT NULL DEFAULT 'Cromotransfer'",
            "substrato TEXT NOT NULL DEFAULT ''",
            "tecnologia TEXT NOT NULL DEFAULT ''",
            "categoria TEXT NOT NULL DEFAULT ''",
            "finalidade TEXT NOT NULL DEFAULT ''",

            // Novos campos de resultados estendidos (AM1 e AM2)
            "resultado_ciclos_am1 TEXT NOT NULL DEFAULT ''",
            "resultado_ciclos_am2 TEXT NOT NULL DEFAULT ''",
            "resultado_ciclos_umido_am1 TEXT NOT NULL DEFAULT ''",
            "resultado_ciclos_umido_am2 TEXT NOT NULL DEFAULT ''",
            "resultado_forca_am1 TEXT NOT NULL DEFAULT ''",
            "resultado_forca_am2 TEXT NOT NULL DEFAULT ''",

            "condicao_stress TEXT NOT NULL DEFAULT ''",
            "falha_dinamometro TEXT NOT NULL DEFAULT ''"
        ];

        let changed = false;
        for (const colDef of cols) {
            try {
                db.run(`ALTER TABLE ensaios ADD COLUMN ${colDef};`);
                console.log(`Column added: ${colDef.split(' ')[0]}`);
                changed = true;
            } catch (e) {
                if (e.message && e.message.includes("duplicate column name")) {
                    console.log(`Column already exists: ${colDef.split(' ')[0]}`);
                } else {
                    console.error(`Error migrating column ${colDef}:`, e.message);
                }
            }
        }

        if (changed) saveDatabase();
        console.log("Database update finished.");
    } catch (err) {
        console.error("Critical error:", err);
    }
}

migrateVulca();

const { getDatabase, saveDatabase } = require('./database/connection');

async function migrateCat() {
    try {
        const db = await getDatabase();
        console.log("Adding 'categoria_foto' column to 'ensaio_imagens' if it doesn't exist...");

        try {
            db.run("ALTER TABLE ensaio_imagens ADD COLUMN categoria_foto TEXT NOT NULL DEFAULT 'Outra';");
            console.log("Column 'categoria_foto' added successfully.");
        } catch (e) {
            if (e.message && e.message.includes("duplicate column name")) {
                console.log("Column 'categoria_foto' already exists.");
            } else {
                console.error("Error migrating:", e.message);
                process.exit(1);
            }
        }

        saveDatabase();
        console.log("Database saved.");
    } catch (err) {
        console.error("Critical error:", err);
    }
}

migrateCat();

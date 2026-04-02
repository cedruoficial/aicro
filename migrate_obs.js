const { getDatabase, saveDatabase } = require('./database/connection');

async function migrateCat() {
    try {
        const db = await getDatabase();
        console.log("Adding 'observacoes' column to 'ensaios' if it doesn't exist...");

        try {
            db.run("ALTER TABLE ensaios ADD COLUMN observacoes TEXT NOT NULL DEFAULT '';");
            console.log("Column 'observacoes' added successfully.");
        } catch (e) {
            if (e.message && e.message.includes("duplicate column name")) {
                console.log("Column 'observacoes' already exists.");
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

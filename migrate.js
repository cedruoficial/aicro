const { getDatabase, saveDatabase } = require('./database/connection');

async function migrate() {
    try {
        const db = await getDatabase();
        console.log("Adding 'retirado' column if it doesn't exist...");

        try {
            db.run('ALTER TABLE ensaios ADD COLUMN retirado INTEGER NOT NULL DEFAULT 0;');
            console.log("Column 'retirado' added successfully.");
        } catch (e) {
            if (e.message && e.message.includes("duplicate column name")) {
                console.log("Column 'retirado' already exists.");
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

migrate();

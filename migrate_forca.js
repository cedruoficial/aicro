const { getDatabase, saveDatabase } = require('./database/connection');

async function migrateForca() {
    try {
        const db = await getDatabase();
        console.log("Adding 'resultado_forca' column if it doesn't exist...");

        try {
            db.run("ALTER TABLE ensaios ADD COLUMN resultado_forca TEXT NOT NULL DEFAULT '';");
            console.log("Column 'resultado_forca' added successfully.");
        } catch (e) {
            if (e.message && e.message.includes("duplicate column name")) {
                console.log("Column 'resultado_forca' already exists.");
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

migrateForca();

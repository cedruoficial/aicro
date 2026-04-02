const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || 'Y:/Producao/CTIA/sistema/ctia.db';

let db = null;
let SQL = null;

async function getDatabase() {
    if (db) return db;

    SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
        
        // Auto-migration on boot
        try {
            db.exec(`ALTER TABLE usuarios ADD COLUMN permissoes TEXT NOT NULL DEFAULT '{"dashboard":true,"ped":true,"kanban":true,"producao":true}'`);
            const data = db.export();
            fs.writeFileSync(DB_PATH, Buffer.from(data));
            console.log("Migration: Added [permissoes] column to [usuarios]");
        } catch (err) {}

        try {
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_nome TEXT DEFAULT ''`);
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_contato TEXT DEFAULT ''`);
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_referencia TEXT DEFAULT ''`);
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_rep TEXT DEFAULT ''`);
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_email TEXT DEFAULT ''`);
            db.exec(`ALTER TABLE desenvolvimentos ADD COLUMN forn_obs TEXT DEFAULT ''`);
            const data = db.export();
            fs.writeFileSync(DB_PATH, Buffer.from(data));
            console.log("Migration: Added [fornecedor] columns to [desenvolvimentos]");
        } catch (err) {}
        
    } else {
        db = new SQL.Database();
    }

    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

module.exports = { getDatabase, saveDatabase, DB_PATH };

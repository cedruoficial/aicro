const { getDatabase } = require('./database/connection');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const db = await getDatabase();
        const email = 'laboratorio.ctia@cromotransfer.com.br';
        const senha = 'ctiaLC@lc2026#';

        const stmt = db.prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1 LIMIT 1");
        stmt.bind([email]);

        if (!stmt.step()) {
            console.log("Not found or not active.");
            stmt.free();
            return;
        }

        const usuario = stmt.getAsObject();
        stmt.free();
        
        console.log("Found user:", usuario.email, usuario.senha_hash);
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        console.log("senhaValida:", senhaValida);
        
    } catch (e) {
        console.error(e);
    }
}
run();

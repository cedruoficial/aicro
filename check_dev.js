const { getDatabase } = require('./database/connection');
async function run() {
    try {
        const db = await getDatabase();
        const res = db.exec("SELECT projeto, foto_url FROM desenvolvimentos ORDER BY criado_em DESC LIMIT 5;");
        console.log(JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();

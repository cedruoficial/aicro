const { getDatabase } = require('./database/connection');

async function testarLogo() {
    const db = await getDatabase();
    const res = db.exec("SELECT empresa_logo, empresa_nome FROM configuracoes LIMIT 1");
    if (res.length > 0) {
        console.log("Configurações atuais no DB:", res[0].values[0]);
    } else {
        console.log("Sem configuracoes no DB.");
    }
}
testarLogo().then(() => process.exit(0));

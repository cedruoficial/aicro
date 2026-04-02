const { getDatabase } = require('./database/connection');

async function check() {
    const db = await getDatabase();
    const res = db.exec("SELECT status, COUNT(*) as total FROM ensaios GROUP BY status");
    if (res && res.length > 0) {
        console.log(JSON.stringify(res[0].values, null, 2));
    } else {
        console.log("No data");
    }
}
check();

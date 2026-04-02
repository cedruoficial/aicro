const fs = require('fs');
const path = require('path');
const file = path.join('c:/Users/laboratorio.calcado/organizador/uploads', 'dev-1774462257158-100530.jpg');
try {
    const stats = fs.statSync(file);
    console.log("Size:", stats.size);
    const buffer = fs.readFileSync(file);
    console.log("First 10 bytes:", buffer.slice(0, 10).toString('hex'));
} catch (e) {
    console.error(e);
}

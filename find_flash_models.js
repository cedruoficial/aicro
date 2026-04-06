require('dotenv').config();

async function findModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        const flashModels = data.models.filter(m => m.name.includes('flash'));
        console.log('Flash Models Found:');
        flashModels.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

findModels();

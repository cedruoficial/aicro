require('dotenv').config();

async function findModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.error) {
            console.error('❌ Erro na API:', JSON.stringify(data.error, null, 2));
            return;
        }
        console.log('Available Models for this Key:');
        data.models.forEach(m => {
            console.log(`- ${m.name}`);
        });
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

findModels();

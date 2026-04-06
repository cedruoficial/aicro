require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    try {
        console.log('📡 Listando modelos disponíveis...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

listModels();

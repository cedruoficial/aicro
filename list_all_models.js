require('dotenv').config();

async function listAllModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log('--- ALL MODELS ---');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('No models found, error:', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

listAllModels();

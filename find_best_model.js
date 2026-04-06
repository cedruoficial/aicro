require('dotenv').config();

async function findBestModel() {
    const apiKey = process.env.GOOGLE_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Erro na API:', JSON.stringify(data.error, null, 2));
            return;
        }

        const models = data.models.map(m => m.name);
        
        // Priority list
        const candidates = [
            'models/gemini-1.5-pro-latest',
            'models/gemini-1.5-flash-latest',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro',
            'models/gemini-1.5-flash-8b-latest'
        ];

        for (const candidate of candidates) {
            if (models.includes(candidate)) {
                console.log(`✅ FOUND CANDIDATE: ${candidate}`);
                return;
            }
        }

        console.log('❌ No classic flash/pro models found in list. Available names:');
        models.forEach(m => console.log(`- ${m}`));
    } catch (err) {
        console.error('❌ Erro:', err);
    }
}

findBestModel();

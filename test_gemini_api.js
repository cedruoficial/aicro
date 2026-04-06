require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('❌ GOOGLE_API_KEY não encontrada no .env');
        return;
    }

    const prompt = "Diga 'Olá, sistema funcional' em português brasileiro.";

    try {
        console.log('📡 Chamando Gemini API (v1beta)...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Resposta de Erro da Gemini API:', JSON.stringify(data.error, null, 2));
            return;
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            console.log('✅ Resposta Sucesso:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('❓ Resposta inesperada:', JSON.stringify(data, null, 2));
        }

    } catch (err) {
        console.error('❌ Erro no teste:', err);
    }
}

testGemini();

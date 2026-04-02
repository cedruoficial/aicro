const express = require('express');
const router = express.Router();

router.post('/analyze-ceo', async (req, res) => {
    try {
        const { metrics, supplyChain } = req.body;
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Chave de API do Google não configurada no servidor.' });
        }

        // Montagem do Prompt Especialista (Lean + TOC) - Curto e Direto
        const prompt = `
            Você é um consultor Sênior em Lean Manufacturing e Teoria das Restrições (TOC). 
            Analise os dados industriais fictícios abaixo da fábrica CTIA e forneça uma análise CURTA, DIRETA e EM TÓPICOS.
            FOCO: Ações práticas para melhorar a vazão e reduzir o Lead Time.

            MÉTRICAS:
            ${metrics.map(m => `- ${m.title}: ${m.value} (Tendência: ${m.trend}%)`).join('\n')}

            MAPA DA CADEIA:
            ${supplyChain.map(n => `- ${n.title}: WIP ${n.wip}/${n.wipLimit}, Status: ${n.status}`).join('\n')}

            Responda em PORTUGUÊS brasileiro, usando Markdown. Seja incisivo. 
            Priorize o gargalo identificado no mapa da cadeia.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
            console.error('Gemini API Error:', data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        res.json({ analysis: aiResponse });

    } catch (err) {
        console.error('Erro na análise IA:', err);
        res.status(500).json({ error: 'Falha ao processar análise de IA: ' + err.message });
    }
});

module.exports = router;

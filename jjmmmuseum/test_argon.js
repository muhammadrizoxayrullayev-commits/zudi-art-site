// Gemini 4 Argon test skripti
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-4-argon';

async function testArgon() {
  console.log(`🤖 Model: ${model} bilan ulanish tekshirilmoqda...`);
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Salom! Gemini 4 Argon modeli ishlashga tayyormi?" }] }]
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Muvaffaqiyatli javob:');
      console.log(data.candidates?.[0]?.content?.parts?.[0]?.text || data);
    } else {
      console.error('❌ Xatolik yuz berdi:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Tarmoq xatosi:', err.message);
  }
}

testArgon();


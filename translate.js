const fs = require('fs');
const path = require('path');

const API_KEY = 'AIzaSyAf6Xa53OCVh6nwa288qPoCK4HS9y0thxE';
const LANGUAGES = ['en', 'es', 'it', 'ru', 'de', 'uk', 'ar'];

async function translateText(text, targetLang) {
  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'fr',
        target: targetLang,
        format: 'text'
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // fallback to original
  }
}

async function translateObject(obj, targetLang) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = await translateObject(obj[key], targetLang);
    } else {
      console.log(`Translating: ${obj[key]} -> ${targetLang}`);
      result[key] = await translateText(obj[key], targetLang);
    }
  }
  return result;
}

async function main() {
  const frPath = path.join(__dirname, 'messages', 'fr.json');
  const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

  for (const lang of LANGUAGES) {
    console.log(`\n--- Starting translation for ${lang} ---`);
    const translated = await translateObject(frContent, lang);
    fs.writeFileSync(
      path.join(__dirname, 'messages', `${lang}.json`),
      JSON.stringify(translated, null, 2)
    );
    console.log(`Saved ${lang}.json`);
  }
}

main();
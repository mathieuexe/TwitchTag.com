interface GenerateOptions {
  keywords: string[];
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  easyToRemember: boolean;
  length: number;
  count: number;
}

export async function generatePseudos(options: GenerateOptions): Promise<string[]> {
  const { keywords, includeNumbers, includeSpecialChars, easyToRemember, length, count } = options;
  const targetCount = Math.min(count, 20);

  const apiKey = process.env.MISTRAL_API_KEY;
  
  if (!apiKey) {
    console.error("MISTRAL_API_KEY is not defined, falling back to basic generation (empty array)");
    return [];
  }

  const prompt = `En tant qu'expert en branding et création de pseudonymes pour des streamers Twitch, génère ${targetCount} pseudos Twitch de qualité "premium", uniques et très accrocheurs en respectant **strictement** ces critères :

- Mots-clés de base à utiliser, mixer ou dont il faut s'inspirer : ${keywords.length > 0 ? keywords.map(k => `"${k}"`).join(', ') : 'Aucun mot-clé imposé, sois créatif (univers gaming/streaming)'}
- Inclure des nombres : ${includeNumbers ? 'OUI' : 'NON'}
- Inclure des caractères spéciaux (uniquement _ ou -) : ${includeSpecialChars ? 'OUI' : 'NON'}
- Facile à retenir (clair, prononçable, pas une suite de lettres au hasard) : ${easyToRemember ? 'OUI' : 'NON'}
- Longueur cible : Environ ${length} caractères maximum par pseudo.

Retourne UNIQUEMENT un objet JSON valide avec une clé "pseudos" contenant un tableau de chaînes de caractères. Ne retourne aucun texte ou markdown autour.
Exemple : {"pseudos": ["Pseudo1", "Pseudo2"]}`;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    if (parsed && Array.isArray(parsed.pseudos)) {
      return parsed.pseudos.slice(0, targetCount);
    }
    
    return [];
  } catch (error) {
    console.error("Error generating with Mistral API:", error);
    return [];
  }
}

export function validatePseudo(pseudo: string): { valid: boolean; message?: string } {
  if (!pseudo || pseudo.length === 0) {
    return { valid: false, message: 'Le pseudo ne peut pas être vide' };
  }
  
  if (pseudo.length < 4) {
    return { valid: false, message: 'Le pseudo doit contenir au moins 4 caractères' };
  }
  
  if (pseudo.length > 25) {
    return { valid: false, message: 'Le pseudo ne peut pas dépasser 25 caractères' };
  }
  
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(pseudo)) {
    return { valid: false, message: 'Le pseudo ne peut contenir que des lettres, chiffres, underscores et tirets' };
  }
  
  return { valid: true };
}

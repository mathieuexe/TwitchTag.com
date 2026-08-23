interface GenerateOptions {
  keywords: string[];
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  easyToRemember: boolean;
  length: number;
  count: number;
}

const ADJECTIVES = [
  'Dark', 'Light', 'Shadow', 'Fire', 'Ice', 'Storm', 'Thunder', 'Mystic',
  'Epic', 'Pro', 'Ultra', 'Super', 'Mega', 'Hyper', 'Cyber', 'Tech',
  'Ghost', 'Phantom', 'Spectre', 'Ninja', 'Samurai', 'Viking', 'Knight',
  'Dragon', 'Wolf', 'Tiger', 'Lion', 'Eagle', 'Hawk', 'Raven', 'Phoenix'
];

const NOUNS = [
  'Gamer', 'Player', 'Stream', 'Stream', 'Caster', 'Viewer', 'Fan',
  'Legend', 'Hero', 'Master', 'King', 'Queen', 'Lord', 'Duke',
  'Slayer', 'Hunter', 'Warrior', 'Fighter', 'Champion', 'Winner',
  'Dragon', 'Wolf', 'Tiger', 'Lion', 'Eagle', 'Hawk', 'Bear', 'Fox'
];

const SPECIAL_CHARS = ['_', '-', '.', 'x', 'z'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSuffix(includeNumbers: boolean, includeSpecialChars: boolean, easyToRemember: boolean): string {
  let suffix = '';
  
  if (includeSpecialChars && Math.random() > 0.5) {
    suffix += getRandomElement(SPECIAL_CHARS);
  }
  
  if (includeNumbers) {
    if (easyToRemember) {
      suffix += generateRandomNumber(1, 99);
    } else {
      const numLength = generateRandomNumber(2, 4);
      suffix += generateRandomNumber(
        Math.pow(10, numLength - 1),
        Math.pow(10, numLength) - 1
      );
    }
  }
  
  return suffix;
}

function generateFromKeywords(keywords: string[], options: GenerateOptions): string {
  const { includeNumbers, includeSpecialChars, easyToRemember, length } = options;
  
  let pseudo = '';
  
  if (keywords.length >= 2) {
    const word1 = getRandomElement(keywords);
    const word2 = getRandomElement(keywords.filter(k => k !== word1));
    
    const separator = includeSpecialChars && !easyToRemember 
      ? getRandomElement(SPECIAL_CHARS) 
      : '';
    
    pseudo = word1 + separator + word2;
  } else if (keywords.length === 1) {
    const keyword = keywords[0];
    const suffix = generateSuffix(includeNumbers, includeSpecialChars, easyToRemember);
    
    if (keyword.length + suffix.length <= length) {
      pseudo = keyword + suffix;
    } else {
      pseudo = keyword.slice(0, length - suffix.length) + suffix;
    }
  }
  
  if (pseudo.length > length) {
    pseudo = pseudo.slice(0, length);
  }
  
  return pseudo.charAt(0).toUpperCase() + pseudo.slice(1);
}

function generateRandomPseudo(options: GenerateOptions): string {
  const { includeNumbers, includeSpecialChars, easyToRemember, length } = options;
  
  const useAdjective = Math.random() > 0.3;
  const useNoun = true;
  
  let pseudo = '';
  
  if (useAdjective) {
    pseudo += getRandomElement(ADJECTIVES);
  }
  
  if (useNoun) {
    pseudo += getRandomElement(NOUNS);
  }
  
  const suffix = generateSuffix(includeNumbers, includeSpecialChars, easyToRemember);
  pseudo += suffix;
  
  if (pseudo.length > length) {
    pseudo = pseudo.slice(0, length);
  }
  
  return pseudo.charAt(0).toUpperCase() + pseudo.slice(1);
}

export function generatePseudos(options: GenerateOptions): string[] {
  const pseudos: string[] = [];
  const { keywords, count } = options;
  
  const targetCount = Math.min(count, 20);
  const attempts = targetCount * 3;
  
  for (let i = 0; i < attempts && pseudos.length < targetCount; i++) {
    let pseudo: string;
    
    if (keywords.length > 0 && Math.random() > 0.3) {
      pseudo = generateFromKeywords(keywords, options);
    } else {
      pseudo = generateRandomPseudo(options);
    }
    
    if (!pseudos.includes(pseudo)) {
      pseudos.push(pseudo);
    }
  }
  
  return pseudos;
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

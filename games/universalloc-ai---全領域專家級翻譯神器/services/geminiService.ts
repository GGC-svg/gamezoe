
// import { GoogleGenAI, Type } from "@google/genai";
import { Type } from "@google/genai"; // Keep Type for schema, remove GoogleGenAI
const GoogleGenAI = null; // Disable SDK usage
import { TranslationItem, GlossaryTerm, TranslationConfig, BatchResult } from "../types";

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunked: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean.trim();
};

const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0) {
      console.warn(`API Call failed. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Wait for window.currentUser to be available (handles timing issues)
 */
const waitForUser = async (maxWait = 5000): Promise<string> => {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const userId = (window as any).currentUser?.id || (window as any).GameZoe?.currentUser?.id;
    if (userId) return String(userId);
    await new Promise(resolve => setTimeout(resolve, 100)); // Check every 100ms
  }
  throw new Error("未登入：請先登入使用此功能（逾時）");
};

/**
 * 智慧型長度縮限校稿服務
 */
export const translateBatch = async (
  items: TranslationItem[],
  targetLangCode: string,
  targetLangName: string,
  sourceLangName: string,
  config: TranslationConfig,
  existingTranslations?: Map<string, string>,
  patternHint?: string,
  globalVocabulary?: Record<string, string>
): Promise<BatchResult> => {
  // [SECURE] Use Backend Proxy
  // if (!process.env.API_KEY) throw new Error("API Key missing.");
  // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const universalCompressionRules = `
    [TIERED COMPRESSION PROTOCOL]
    Goal: Meet "maxLen" without destroying meaning.
    1. LEVEL 1: Simplify grammar, remove redundancy (articles, soft words).
    2. LEVEL 2: Use standard abbreviations for ${targetLangName}.
    3. LEVEL 3: Extreme compression, keywords only.
  `;

  const inputList = items.map(item => ({
    id: String(item.id),
    src: item.original,
    cur: (existingTranslations?.get(item.id) || ""),
    maxLen: item.maxLen
  }));

  let systemInstruction = `
    Role: Elite Game Localization Expert for ${targetLangName}.
    Mission: Proofreading & Length Audit.
    Logic:
    - Use "src" for meaning.
    - If final text length > maxLen, set isOverLimit to true.
    - [DYNAMIC LEARNING]: For every batch, you MUST identify 1-3 key terms (nouns/verbs) you translated. Return them in "termDecisions".
      e.g. { "source": "Floor", "target": "Этаж" }
    - [PATTERN DETECTION]: Identify the dominant structural pattern (e.g. "Level #", "Item: %s", "I, II, III"). Return it in "detectedPattern".
    ${universalCompressionRules}

    [CONSISTENCY & STYLE PROTOCOL]
    1. CASE CONSISTENCY: Strictly follow source text capitalization (e.g. "э" vs "Э"). Do not auto-capitalize unless grammatical rules require it.
    2. VOCABULARY UNIFICATION: Do not use synonyms for the same concept. (e.g. Choose "Схватка" OR "Стычка", stay consistent).
    3. NUMERICAL FORMAT: Preserve numerical notation (Arabic vs Roman vs Word) as per source.

    [NUMERICAL CONCORD PROTOCOL]
    - When a noun follows a number (e.g. "5 stars"), YOU MUST apply correct declension/pluralization for the target language.
    - UNIVERSAL SYNTAX RULES (Apply for ${targetLangName}):
      1. QUANTITY vs LABEL (General Rule):
         - "Stars/Coeurs" (Quantity) -> usually AFTER number (e.g. "5 ★", "5 stars").
         - "Level/Stage" (Label/Index) -> usually BEFORE number (e.g. "Lv.5", "Stage 5").
         - Exception (Asian Langs - JP/CN/KR): Suffixes are standard (e.g. Lv.5, 5星, 5つ星).
      2. RUSSIAN SPECIFIC (If Target is Russian):
         - STARS: "6 зв." (After)
         - LEVEL: "ур. 6" (Before)
         - VERB MOOD: Use INFINITIVE for Tasks (e.g. "Пройти", "Получить").
      3. GERMAN/FRENCH/SPANISH SPECIFIC (If Target involves these):
         - VERB MOOD: Use INFINITIVE for Tasks (e.g. DE: "Abschließen", FR: "Compléter", ES: "Completar").
         - NOUNS: Ensure correct gender/case for units.
      4. JAPANESE/CHINESE/KOREAN:
         - VERB MOOD: Use natural imperative/declarative for tasks (e.g. JP: "〜をクリア", CN: "通關").
         - UNITS: Always include the measure word/counter (e.g. 5個, 5回).

    [PROPER NOUN PROTOCOL]
    - If a term is part of a Proper Noun (Item Name, Title, Skill), DO NOT abbreviate it.
      e.g. "Star of Liberty" -> Full "Star", do NOT use abbreviation "St.".
      e.g. "Звезда свободы" -> Full "Звезда", do NOT use "зв.".
      e.g. "Level Up Bonus" -> Full "Level", do NOT use "Lv.".
    - Only use abbreviations (like "Lv.", "HP", "зв.") for UI labels, metrics, or independent counters.

    [VERB MOOD & TONE GUIDE]
    - TASK/MISSION LISTS:
      - EN: Imperative (e.g. "Complete 5 stages").
      - RU/DE/FR/ES: Infinitive (e.g. "Пройти...", "Abschließen...", "Compléter...").
    - SYSTEM MESSAGES:
      - Passive or Impersonal (e.g. "Item Received").

    [SPECIAL TERM DICTIONARY (Universal)]
    - "Gold City/黃金城" -> "Гран Тезоро" (RU), "Gran Tesoro" (EN/DE/FR)
    - "Haki/霸氣" -> "Хаки" (RU), "Haki" (EN/DE/FR)


    [STRUCTURAL CONSISTENCY PROTOCOL]
    - You MUST use a consistent separator structure throughout the project.
    - If the user provides a Naming Template (e.g. "[Job] - [Level]"), follow the separator (space, hyphen, colon) exactly.
    - Do NOT mix formats like "Job: Level" and "Job - Level".

    [GAMING CONTEXT TAXONOMY]
    - "Level/級" distinction:
      1. If context implies PROGRESSION (Lv. 1, 2, 3), use "Level" (e.g. EN: "Level", RU: "Ур.", JP: "Lv.").
      2. If context implies QUALITY/RARITY (S-Rank, Grade A), use "Rank" (e.g. EN: "Rank/Tier", RU: "Ранг", JP: "ランク").
    - Default assumption for "第X級" or "X級" is PROGRESSION (Level) unless specified otherwise.

    [FUNCTIONAL EQUIVALENCY PROTOCOL]
    - ANTI-TRANSLITERATION: Do NOT transliterate functional terms (e.g. "起承轉合" -> "Qi Cheng Zhuan He").
    - Translate the FUNCTION/MEANING.
      e.g. "起承轉合" -> "Start, Development, Twist, Conclusion" (or target language equivalents like RU: "Начало, Развитие, Поворот, Завершение").

    ${patternHint ? `
    [LOCKED PATTERN & STRUCTURE]
    CRITICAL: The system has LOCKED the following pattern from previous batches. You MUST follow it exactly:
    PATTERN: "${patternHint}"
    - If the pattern uses Roman Numerals (I, II), you MUST calculate translation as Roman Numerals.
    - If the pattern is "Title #", do strictly "Title #".
    - Do NOT deviate from this structure.
    ` : ""}

    [GAME CONTEXT]
    ${config.gameContext || "General Game Localization"}

    [NAMING TEMPLATE & STYLE RULES]
    ${config.namingTemplate ? `Naming Template: ${config.namingTemplate}` : ""}
    ${config.styleRules || ""}
  `;

  // [DYNAMIC VOCABULARY INJECTION]
  const globalVocabLines = Object.entries(globalVocabulary || {}).map(([key, val]) => {
    return `"${key}" -> "${val}" (LOCKED)`;
  }).join('\n');

  if (globalVocabLines) {
    systemInstruction += `
    
    [DYNAMIC VOCABULARY (MEMORY CHAIN)]
    The following terms have been locked by previous batches. You MUST use these exact translations for consistency:
    ${globalVocabLines}
    
    CRITICAL INSTRUCTIONS:
    1. If a source term matches a locked key, use the locked value. Do NOT use synonyms.
    2. If the current translation in "cur" ALREADY matches the locked value, KEEP IT. Do NOT rephrase.
    3. LEARN & REPORT: If you encounter NEW key terms in this batch that are NOT in the list, you MUST decide on a translation and return it in "termDecisions" to update the chain.
    `;
  }

  const glossaryLines = (config.glossary || []).map(g => {
    const targetTerm = g.translations[targetLangCode];
    return targetTerm ? `"${g.term}" -> "${targetTerm}"` : null;
  }).filter(Boolean).join('\n');

  try {
    const response = await callWithRetry(async () => {
      // Wait for user to be available (handles timing issues)
      const userId = await waitForUser();

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          model: "gemini-1.5-flash",
          contents: `LOCALIZATION TASK: ${JSON.stringify(inputList)}\n\nGLOSSARY:\n${glossaryLines}`,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      translatedText: { type: Type.STRING },
                      isOverLimit: { type: Type.BOOLEAN }
                    }
                  }
                },
                termDecisions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      target: { type: Type.STRING }
                    }
                  }
                },
                detectedPattern: { type: Type.STRING }
              }
            }
          }
        })
      });
      if (!res.ok) throw new Error("Proxy Error: " + res.statusText);
      return res.json();
    });

    const parsed = JSON.parse(cleanJsonString(response.text || "{}"));
    const resultMap = new Map<string, string>();
    const flagsMap = new Map<string, boolean>();
    const newDecisions: Record<string, string> = {};

    parsed.translations?.forEach((t: any) => {
      resultMap.set(String(t.id), String(t.translatedText || ""));
      flagsMap.set(String(t.id), !!t.isOverLimit);
    });

    parsed.termDecisions?.forEach((d: any) => {
      if (d.source && d.target) newDecisions[d.source] = d.target;
    });

    return { translations: resultMap, overLimitFlags: flagsMap, termDecisions: newDecisions, detectedPattern: parsed.detectedPattern };
  } catch (error) {
    throw error;
  }
};

/**
 * 智慧術語提取與建議 - 終極穩定版
 */
export const generateGlossarySuggestions = async (
  terms: string[],
  samples: string[],
  context: string,
  sourceLangName: string,
  targetLangs: { code: string; name: string }[]
): Promise<GlossaryTerm[]> => {
  // [SECURE] Use Backend Proxy
  // if (!process.env.API_KEY) throw new Error("API Key missing.");
  // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are a professional Game Localization Expert.
    
    TASK: 
    Audit and Extract ONE atomic key term per entry based on the candidates.
    
    STRICT "ATOMIC EXTRACTION" RULES:
    1. NO PHRASES: Do NOT extract "Recovery Effect" -> Extract "Recovery". Do NOT extract "My Attack" -> Extract "Attack".
    2. NO ADJECTIVES: Remove "Strong", "Random", "All", "Self", "Enemy". Keep only the CORE NOUN.
    3. NO GRAMMAR WORDS: Remove "Stackable", "Increases", "Effect".
    4. NO FRAGMENTS: Remove single characters like "攻", "防" unless they are complete terms like "Ki". Min Length: 2 chars (unless English).
    
    CONTEXT ADHERENCE:
    - You must read [GAME CONTEXT] and [USER STYLE RULES].
    - If the user specified a rule (e.g. "Partner" -> "Напарник"), your translation output MUST match it.
    - If the user forbids a word, do not output it.

    OUTPUT REQUIREMENTS:
    1. Term: The clean, atomic source term.
    2. Description: Brief definition in Traditional Chinese.
    3. Translations: The correct translation for each target language, respecting the Style Rules.
  `;

  const prompt = `
    [GAME CONTEXT]
    ${context}
    
    [TEXT SAMPLES]
    ${samples.join('\n\n')}
    
    [CANDIDATE LIST]
    ${terms.join(', ')}
  `;

  try {
    const response = await callWithRetry(async () => {
      // Wait for user to be available (handles timing issues)
      const userId = await waitForUser();

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  description: { type: Type.STRING },
                  translations: {
                    type: Type.OBJECT,
                    properties: Object.fromEntries(targetLangs.map(l => [l.code, { type: Type.STRING }])),
                    required: targetLangs.map(l => l.code)
                  }
                },
                required: ["term", "description", "translations"]
              }
            }
          }
        })
      });
      if (!res.ok) throw new Error("Glossary Proxy Error: " + res.statusText);
      return res.json();
    });
    const parsed = JSON.parse(cleanJsonString(response.text || "[]"));
    return parsed;
  } catch (error) {
    console.error("Glossary API Error:", error);
    return [];
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { TranslationItem, GlossaryTerm, TranslationConfig, BatchResult } from "../types";

export const chunkArray = <T,>(array: T[], size: number): T[][] => {
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

export const generateGlossarySuggestions = async (
  candidates: string[],
  sampleSentences: string[],
  gameContext: string,
  sourceLangName: string,
  targetLangs: { code: string, name: string }[]
): Promise<GlossaryTerm[]> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    你是一位資深遊戲本地化專家。請從候選詞中提取具備翻譯價值的遊戲術語（角色、技能、UI、地圖）。
    Candidates: ${JSON.stringify(candidates)}
    Samples: ${JSON.stringify(sampleSentences)}
    Context: ${gameContext}
  `;

  const translationProperties: Record<string, any> = {};
  targetLangs.forEach(lang => {
    translationProperties[lang.code] = { type: Type.STRING };
  });

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            terms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  description: { type: Type.STRING },
                  translations: { type: Type.OBJECT, properties: translationProperties }
                },
                required: ["term", "description", "translations"]
              }
            }
          }
        }
      }
    }));
    const parsed = JSON.parse(cleanJsonString(response.text || "{}"));
    return parsed.terms || [];
  } catch (error) {
    return [];
  }
};

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
  if (!process.env.API_KEY) throw new Error("API Key missing.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const glossaryLines = (config.glossary || []).map(g => {
    const targetTerm = g.translations[targetLangCode];
    return targetTerm ? `"${g.term}" -> "${targetTerm}"` : null;
  }).filter(Boolean).join('\n');

  const dynamicVocabLines = globalVocabulary 
    ? Object.entries(globalVocabulary).map(([src, tgt]) => `"${src}" -> "${tgt}"`).join('\n')
    : "";

  const inputList = items.map(item => ({
    id: String(item.id),
    src: item.original,
    cur: (existingTranslations?.get(item.id) || "")
  }));

  const systemInstruction = `
    Role: Senior Game Localization Editor (${targetLangName}).
    Task: ${config.isProofreadMode ? 'DEEP PROOFREAD & CONSISTENCY CHECK' : 'LOCALIZED TRANSLATION'}.
    Game Context: ${config.proofreadContext || config.gameContext || "Gaming Content"}.
    
    CRITICAL RULES:
    1. CONSISTENCY: Use provided GLOSSARY and DYNAMIC VOCABULARY.
    2. LEARN & REPORT: If you encounter recurring key terms, list them in the "vocab" array.
    3. STRUCTURE: Fix "LV/Rank" mapping and structural markers.
    4. QUALITY: ${config.isProofreadMode ? 'If "cur" is good, keep it. Otherwise, fix it.' : 'Generate localized content.'}
    ${patternHint ? `5. STYLE PATTERN: Follow "${patternHint}"` : ''}

    STATIC GLOSSARY:
    ${glossaryLines}

    DYNAMIC VOCABULARY (MEMORY CHAIN):
    ${dynamicVocabLines}
  `;

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `DATA: ${JSON.stringify(inputList)}`,
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
                  translatedText: { type: Type.STRING }
                }
              }
            },
            pattern: { type: Type.STRING },
            vocab: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  src: { type: Type.STRING },
                  tgt: { type: Type.STRING }
                },
                required: ["src", "tgt"]
              }
            }
          }
        }
      }
    }));

    const parsed = JSON.parse(cleanJsonString(response.text || "{}"));
    const resultMap = new Map<string, string>();
    parsed.translations?.forEach((t: any) => resultMap.set(String(t.id), String(t.translatedText || "")));
    
    // 將回傳的陣列轉換回物件結構供前端儲存
    const vocabMap: Record<string, string> = {};
    if (Array.isArray(parsed.vocab)) {
      parsed.vocab.forEach((v: any) => {
        if (v.src && v.tgt) vocabMap[v.src] = v.tgt;
      });
    }

    return {
      translations: resultMap,
      detectedPattern: parsed.pattern,
      vocabularyMap: vocabMap
    };
  } catch (error) {
    throw error;
  }
};


import { SUPPORTED_LANGUAGES, TranslationConfig } from '../types';

/**
 * 企業級商業費率修正 (USD)
 * 根據用戶反饋調整：
 * 基礎翻譯：$0.0008 / 字 (約 $0.8 USD / 每千字)
 * 深度校稿：$0.0025 / 字 (約 $2.5 USD / 每千字)
 */
export const RATES = {
  BASIC_TRANSLATION: 0.0008,   
  ADVANCED_LQA: 0.0025,        
  INTERNAL_WEIGHT: 1.0,       
};

// 計算字數邏輯：CJK 算字，拉丁算詞
export const countWords = (text: string): number => {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>|(\{[^}]*\})|(\[[^\]]*\])/g, '').trim();
  const hasCJK = /[\u4E00-\u9FFF\u3040-\u30FF\u3130-\u318F]/.test(clean);
  
  if (hasCJK) {
    return clean.length; 
  } else {
    return clean.split(/\s+/).filter(w => w.length > 0).length; 
  }
};

export const calculateEstimatedCost = (
  allRows: any[], 
  sourceColumn: string,
  targetLangs: string[], 
  isProofread: boolean
): { totalWords: number; cost: number; perLangWords: number } => {
  if (!sourceColumn || targetLangs.length === 0) return { totalWords: 0, cost: 0, perLangWords: 0 };

  const perLangWords = allRows.reduce((acc, row) => acc + countWords(String(row[sourceColumn] || "")), 0);
  const totalProcessingWords = perLangWords * targetLangs.length;
  
  const rate = isProofread ? RATES.ADVANCED_LQA : RATES.BASIC_TRANSLATION;
  const cost = totalProcessingWords * rate;
  
  return { 
    totalWords: totalProcessingWords, 
    perLangWords,
    cost: Math.max(cost, 1.0) // 最低消費 1.0 USD
  };
};

const STORAGE_KEY = 'loc_enterprise_quota_v2';
export const getSessionUsage = (): number => {
  return Number(localStorage.getItem(STORAGE_KEY) || '0');
};

export const addSessionUsage = (count: number) => {
  const current = getSessionUsage();
  localStorage.setItem(STORAGE_KEY, String(current + count));
};

export const FREE_SESSION_QUOTA = 500; // 提升 Web 試用額度到 500 字

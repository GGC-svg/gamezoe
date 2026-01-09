
export enum AppState {
  UPLOAD = 'UPLOAD',
  SHEET_SELECT = 'SHEET_SELECT',
  CONFIG = 'CONFIG',
  GLOSSARY = 'GLOSSARY',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  CLEANER = 'CLEANER'
}

export interface ExcelRow {
  [key: string]: any;
}

export interface WorksheetData {
  sheetName: string;
  rows: ExcelRow[];
}

export interface GlossaryTerm {
  term: string;
  description: string;
  translations: Record<string, string>;
}

export interface TranslationConfig {
  sourceLang: string;
  targetLangs: string[];
  columnMapping?: Record<string, string>; 
  gameContext: string; 
  styleRules?: string;
  proofreadContext?: string; // 深度校稿專用的背景說明
  keyColumn: string; 
  sourceColumn: string; 
  contextColumn?: string; 
  batchSize: number;
  glossary: GlossaryTerm[];
  selectedSheetName?: string;
  preferredSeparator?: string; 
  namingTemplate?: string;     
  isProofreadMode?: boolean;   
}

export interface TranslationItem {
  id: string; 
  original: string;
  context?: string; 
  translations: Record<string, string>; 
  status: 'pending' | 'translating' | 'completed' | 'error';
}

// Fix: Define BatchResult interface for translation results
export interface BatchResult {
  translations: Map<string, string>;
  detectedPattern?: string;
  vocabularyMap?: Record<string, string>;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: '英文 (美國)' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '簡體中文' },
  { code: 'ja-JP', name: '日文' },
  { code: 'ko-KR', name: '韓文' },
  { code: 'fr-FR', name: '法文' },
  { code: 'de-DE', name: '德文' },
  { code: 'es-ES', name: '西班牙文' },
  { code: 'pt-BR', name: '葡萄牙文 (巴西)' },
  { code: 'ru-RU', name: '俄文' },
  { code: 'th-TH', name: '泰文' },
  { code: 'vi-VN', name: '越南文' },
  { code: 'id-ID', name: '印尼文' },
];

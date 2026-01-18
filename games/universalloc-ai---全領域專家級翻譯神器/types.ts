
export enum AppState {
  UPLOAD = 'UPLOAD',
  SHEET_SELECT = 'SHEET_SELECT',
  CONFIG = 'CONFIG',
  GLOSSARY = 'GLOSSARY',
  PROCESSING = 'PROCESSING',
  PAYWALL = 'PAYWALL',
  REVIEW = 'REVIEW',
  CLEANER = 'CLEANER'
}

export type UILang = 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR';

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

export interface PricingConfig {
  basePricePerWord: number;
  modeMultiplier: number;
  totalWords: number;
  estimatedCost: number;
}

export interface TranslationConfig {
  // Work Mode
  workMode?: 'translate' | 'proofread' | 'clean';  // 工作模式
  isProofreadMode?: boolean;
  isPremiumUnlocked?: boolean;
  // Note: contentType 已改為自動檢測 (geminiService.ts detectContentType)

  // Sheet Selection
  availableSheets?: string[];                      // 可用工作表列表
  selectedSheetName?: string;

  // Data Mapping
  sourceLang: string;
  targetLangs: string[];
  keyColumn: string;
  sourceColumn: string;
  contextColumn?: string;                          // 語境備註欄位
  targetCols?: Record<string, string>;             // { "en-US": "Description_EN", "ja-JP": "Description_JP" }
  lengthConstraintColumn?: string;
  lengthReferenceColumn?: string;
  columnMapping?: Record<string, string>;

  // Context & Style
  gameContext: string;                             // 內容背景與風格
  namingTemplate?: string;                         // 結構命名範本 e.g. [Region] [Name] [Level]
  styleRules?: string;
  proofreadContext?: string;

  // Processing
  batchSize: number;
  glossary: GlossaryTerm[];
  pricing?: PricingConfig;
  internalAccessKey?: string;
}

export interface TranslationItem {
  id: string;
  original: string;
  maxLen?: number;
  translations: Record<string, string>;
  isOverLimit: Record<string, boolean>;
  status: 'pending' | 'translating' | 'completed' | 'error' | 'locked';
}

export interface BatchResult {
  translations: Map<string, string>;
  overLimitFlags: Map<string, boolean>;
  termDecisions?: Record<string, string>;
  detectedPattern?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', zhName: '美式英文', weight: 1.0 },
  { code: 'zh-TW', name: '繁體中文 (Traditional)', zhName: '繁體中文', weight: 1.0 },
  { code: 'zh-CN', name: '简体中文 (Simplified)', zhName: '簡體中文', weight: 1.0 },
  { code: 'ja-JP', name: '日本語 (Japanese)', zhName: '日語', weight: 1.1 },
  { code: 'ko-KR', name: '한국어 (Korean)', zhName: '韓語', weight: 1.1 },
  { code: 'fr-FR', name: 'Français (French)', zhName: '法語', weight: 1.2 },
  { code: 'de-DE', name: 'Deutsch (German)', zhName: '德語', weight: 1.2 },
  { code: 'es-ES', name: 'Español (Spanish)', zhName: '西班牙語', weight: 1.1 },
  { code: 'pt-BR', name: 'Português (Portuguese)', zhName: '葡萄牙語', weight: 1.1 },
  { code: 'ru-RU', name: 'Русский (Russian)', zhName: '俄語', weight: 1.3 },
  { code: 'th-TH', name: 'ภาษาไทย (Thai)', zhName: '泰語', weight: 1.2 },
  { code: 'vi-VN', name: 'Tiếng Việt (Vietnamese)', zhName: '越南語', weight: 1.2 },
  { code: 'id-ID', name: 'Bahasa Indonesia', zhName: '印尼語', weight: 1.1 },
];

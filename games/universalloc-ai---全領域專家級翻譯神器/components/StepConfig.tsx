
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TranslationConfig, SUPPORTED_LANGUAGES, PricingConfig } from '../types';

export interface StepConfigHandle {
  triggerStart: () => void;
}

interface StepConfigProps {
  rawData: any[];
  columns: string[];
  onConfigComplete: (config: TranslationConfig) => void;
  onBack: () => void;
  sheetName?: string;
  uiLang?: string;
  isProofreadMode?: boolean;
  onBillingUpdate?: (data: { totalWords: number; cost: number; targetLangs: string[]; sourceColumn: string; canStart: boolean }) => void;
}

export const StepConfig = forwardRef<StepConfigHandle, StepConfigProps>(({
  rawData, columns, onConfigComplete, onBack, sheetName, uiLang = 'zh-TW', isProofreadMode = false, onBillingUpdate
}, ref) => {
  const [targetLangs, setTargetLangs] = useState<string[]>([]);

  // Column Mappings
  const [keyColumn, setKeyColumn] = useState(columns[0] || '');
  const [sourceColumn, setSourceColumn] = useState(columns[1] || '');
  const [contextColumn, setContextColumn] = useState('');
  const [targetCols, setTargetCols] = useState<Record<string, string>>({});

  const [lengthReferenceColumn, setLengthReferenceColumn] = useState(''); // State for Length Reference

  // Context & Style
  const [gameContext, setGameContext] = useState('');
  const [namingTemplate, setNamingTemplate] = useState('');

  // [LEGACY RESTORE] Auto-Mapping Logic
  useEffect(() => {
    if (columns.length > 2 && targetLangs.length > 0) {
      const autoMapping = { ...targetCols };
      let changed = false;
      targetLangs.forEach(lang => {
        if (!autoMapping[lang]) {
          const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);
          const langName = langObj?.name || "";
          const langShort = langObj?.code.split('-')[0].toLowerCase() || "";

          const found = columns.find(c =>
            c.includes(langName) ||
            (langShort && c.toLowerCase() === langShort) ||
            (langShort && c.toLowerCase().includes(`_${langShort}`)) ||
            (langShort && c.toLowerCase().includes(`${langShort}_`))
          );

          if (found && found !== keyColumn && found !== sourceColumn) {
            autoMapping[lang] = found;
            changed = true;
          }
        }
      });
      if (changed) setTargetCols(autoMapping);
    }
  }, [targetLangs, columns, keyColumn, sourceColumn]);

  // Report billing updates to parent
  useEffect(() => {
    if (onBillingUpdate) {
      const costData = calculateCost();
      onBillingUpdate({
        totalWords: costData.totalWords,
        cost: costData.estimatedCost,
        targetLangs,
        sourceColumn,
        canStart: targetLangs.length > 0 && !!sourceColumn && !!keyColumn
      });
    }
  }, [targetLangs, sourceColumn, keyColumn, rawData.length]);

  const calculateCost = () => {
    // Simple estimation: $0.8 per 1000 words
    const rowCount = rawData.length;
    const avgWords = 15; // approximate
    const totalWords = rowCount * avgWords * targetLangs.length;
    const cost = (totalWords / 1000) * 0.8;
    // Fix: Return full PricingConfig object
    return { estimatedCost: cost, totalWords, basePricePerWord: 0.0008, modeMultiplier: 1 };
  };

  const handleTargetColChange = (langCode: string, col: string) => {
    setTargetCols(prev => ({ ...prev, [langCode]: col }));
  };

  const toggleTargetLang = (code: string) => {
    setTargetLangs(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const selectAllLangs = () => {
    if (targetLangs.length === SUPPORTED_LANGUAGES.length) setTargetLangs([]);
    else setTargetLangs(SUPPORTED_LANGUAGES.map(l => l.code));
  };

  const costData = calculateCost();

  const handleStart = () => {
    if (targetLangs.length === 0 || !sourceColumn || !keyColumn) return;
    const config: TranslationConfig = {
      sourceLang: 'auto',
      targetLangs,
      keyColumn,
      sourceColumn,
      contextColumn: contextColumn || undefined,
      lengthReferenceColumn: lengthReferenceColumn || undefined, // Pass to config
      // contentType 已改為自動檢測，不需要手動設定
      gameContext,
      namingTemplate,
      columnMapping: {},
      batchSize: 20, // Reduced from 50 to 20 for stability
      glossary: [],
      targetCols,
      isProofreadMode,
      pricing: costData
    };
    onConfigComplete(config);
  };

  // Expose triggerStart to parent via ref
  useImperativeHandle(ref, () => ({
    triggerStart: handleStart
  }), [targetLangs, keyColumn, sourceColumn, contextColumn, lengthReferenceColumn, gameContext, namingTemplate, targetCols, isProofreadMode, costData]);

  // Dynamic Preview Data
  const previewRow = rawData[0] || {};

  const i18n = {
    'zh-TW': {
      back: '返回上一步',
      title: '專案深度配置',
      currentSheet: '目前分頁',
      mode: isProofreadMode ? '[在地化深度優化 (LQA)]' : '[專家轉譯模式]',

      // Sections
      sec_mapping: '1. 數據映射字典 (Data Mapping)',
      sec_lang_context: '2. 語系與場景定義',

      // Labels
      lbl_id: '唯一索引 (ID Key)',
      desc_id: '【必填】這是每一行的身分證 (如 StringID)。系統依靠它來追蹤進度與錯誤重試。',
      lbl_src: '語意參考源 (Source Reference)',
      desc_src: '【核心】這是 AI 的「真理標準」。請選擇最準確的原文 (如中文/英文)。AI 將以此為基準來理解原意。',
      lbl_ctx: '語境備註 (Context)',
      desc_ctx: '【選填】給 AI 的提示小抄 (如 Speaker)。這能大幅提升對話與多義詞的翻譯準確度。',
      lbl_target_fix: '待校稿/譯文目標 (Target to Fix)',
      desc_target_fix: '請指定該語系對應的「已翻譯欄位」進行偵錯',

      // New LQA Keys (Fixes missing property error)
      lbl_len_ref: '字數限縮參照 (Length Reference)',
      desc_len_ref: '【進階】這是 AI 的「尺」。若選「德文」，AI 會強制將譯文縮寫至不超過德文的長度。',

      lbl_langs: '目標語系選擇',
      lbl_game_ctx: '內容背景與風格',
      desc_game_ctx: '描述檔案的行業領域、內容性質、專有名詞規則等。例如：遊戲UI、法律合約、技術文件、行銷文案...',
      lbl_template: '結構命名範本',
      desc_template: '例如: [類別] - [編號] - [名稱]',

      btn_start: '啟動引擎',
      tip_lqa: '已啟用「雙重對照」協議：系統將同時分析 [語意參考源] 與 [待校稿目標] 以進行精確修復。',

      // Footer Keys (Fixes missing property error)
      words: '總字數',
      cost: '預估成本',
    },
    'en-US': { // Basic EN fallback just in case
      back: 'Back',
      title: 'Project Setup',
      currentSheet: 'Sheet',
      mode: isProofreadMode ? '[LQA Mode]' : '[Expert Mode]',
      sec_mapping: '1. Data Mapping',
      sec_lang_context: '2. Languages & Context',
      lbl_id: 'ID Key',
      desc_id: 'Unique identifier',
      lbl_src: 'Source',
      desc_src: 'Semantic reference',
      lbl_ctx: 'Context',
      desc_ctx: 'Additional info',
      lbl_target_fix: 'Target to Fix',
      desc_target_fix: 'Column to proofread',
      lbl_len_ref: 'Length Reference',
      desc_len_ref: 'Max length limit column',
      lbl_langs: 'Target Languages',
      lbl_game_ctx: 'Content Context',
      desc_game_ctx: 'Industry, content type, terminology rules...',
      lbl_template: 'Naming Template',
      desc_template: 'e.g. [Category] - [ID] - [Name]',
      btn_start: 'Start Engine',
      tip_lqa: 'LQA Protocol Active',
      words: 'Words',
      cost: 'Est. Cost'
    }
  };

  const t = (uiLang === 'en-US' ? i18n['en-US'] : i18n['zh-TW']);

  return (
    <div className="flex flex-col h-full bg-gaming-dark text-white overflow-y-auto custom-scrollbar relative">

      {/* 1. Sticky Header */}
      <header className="shrink-0 bg-gaming-dark/95 backdrop-blur border-b border-white/10 px-8 py-5 flex items-center justify-between shadow-xl z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
            <i className="fas fa-arrow-left mr-2"></i> {t.back}
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              {t.title}
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${isProofreadMode ? 'bg-emerald-900/50 text-emerald-300 border-emerald-500/30' : 'bg-gaming-accent/20 text-gaming-accent border-gaming-accent/30'}`}>
                {t.mode}
              </span>
            </h1>
            {sheetName && <div className="text-xs text-purple-300 font-mono mt-1 opacity-80">{t.currentSheet}: {sheetName}</div>}
          </div>
        </div>
      </header>

      {/* 2. Content Area - Natural Flow */}
      <main className="flex-1 p-8 pb-12">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Data Mapping (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-gaming-card p-8 rounded-[2rem] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black flex items-center gap-3 mb-8 text-purple-300">
                <i className="fas fa-database"></i> {t.sec_mapping}
              </h3>

              {/* ID & Context Row */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-black text-purple-400 uppercase tracking-widest mb-1 ml-1">
                    {t.lbl_id} <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">REQUIRED</span>
                  </label>
                  <p className="text-xs text-white/40 mb-2 ml-1">{t.desc_id}</p>
                  <select className="w-full bg-black/40 border-2 border-purple-500/30 rounded-xl p-3 text-white font-bold outline-none focus:border-purple-500 transition-all" value={keyColumn} onChange={e => setKeyColumn(e.target.value)}>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-1 ml-1">
                    {t.lbl_ctx} <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">OPTIONAL</span>
                  </label>
                  <p className="text-xs text-white/40 mb-2 ml-1">{t.desc_ctx}</p>
                  <select className="w-full bg-black/40 border-2 border-blue-500/30 rounded-xl p-3 text-white font-bold outline-none focus:border-blue-500 transition-all" value={contextColumn} onChange={e => setContextColumn(e.target.value)}>
                    <option value="">-- None --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Source Reference (Crucial) */}
              <div className="mb-0 relative">
                <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gaming-accent rounded-full"></div>
                <label className="block text-sm font-black text-gaming-accent uppercase tracking-widest mb-1 ml-1">{t.lbl_src}</label>
                <p className="text-xs text-white/40 mb-3 ml-1">{t.desc_src}</p>
                <select className="w-full bg-black/40 border-2 border-gaming-accent/30 rounded-xl p-4 text-lg font-bold text-white outline-none focus:border-gaming-accent transition-all" value={sourceColumn} onChange={e => setSourceColumn(e.target.value)}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Length Reference Column (LQA Mode Only) */}
              {isProofreadMode && (
                <div className="mt-6 mb-8 relative animate-fadeIn">
                  <div className="absolute -left-3 top-0 bottom-0 w-1 bg-pink-500 rounded-full"></div>
                  <label className="block text-sm font-black text-pink-400 uppercase tracking-widest mb-1 ml-1">{t.lbl_len_ref}</label>
                  <p className="text-xs text-white/40 mb-3 ml-1">{t.desc_len_ref}</p>
                  <select className="w-full bg-black/40 border-2 border-pink-500/30 rounded-xl p-4 text-lg font-bold text-white outline-none focus:border-pink-500 transition-all" value={lengthReferenceColumn} onChange={e => setLengthReferenceColumn(e.target.value)}>
                    <option value="">-- 無 (No Limit) --</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Dynamic Target Columns mapping - Appears when langs selected */}
              {targetLangs.length > 0 && (
                <div className="animate-fadeIn space-y-4 pt-6 border-t border-white/5">
                  <label className="block text-sm font-black text-emerald-400 uppercase tracking-widest mb-2 ml-1">
                    {t.lbl_target_fix}
                  </label>
                  <p className="text-xs text-white/40 mb-4 ml-1">{t.desc_target_fix}</p>

                  {targetLangs.map(code => {
                    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === code);
                    return (
                      <div key={code} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-emerald-500/20">
                        <div className="w-24 shrink-0 px-2">
                          <div className="text-[10px] font-black opacity-50 uppercase">{code}</div>
                          <div className="text-sm font-bold text-emerald-300 truncate">{langObj?.zhName}</div>
                        </div>
                        <i className="fas fa-arrow-right text-white/20 text-xs"></i>
                        <select
                          className="flex-1 bg-black/40 border border-emerald-500/30 rounded-lg p-2 text-sm font-bold text-white outline-none focus:border-emerald-500 transition-all"
                          value={targetCols[code] || ''}
                          onChange={(e) => handleTargetColChange(code, e.target.value)}
                        >
                          <option value="">{isProofreadMode ? '-- 選擇要修復的欄位 --' : '-- 自動建立新欄位 --'}</option>
                          {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Langs & Context (7 cols) */}
          <div className="xl:col-span-7 space-y-6">

            {/* Language Select */}
            <div className="bg-gaming-card p-8 rounded-[2rem] border border-white/5 shadow-2xl">
              <h3 className="text-xl font-black flex items-center gap-3 mb-6">
                <i className="fas fa-globe"></i> {t.lbl_langs}
                <button onClick={selectAllLangs} className="ml-auto text-xs border border-white/20 px-3 py-1 rounded hover:bg-white/10">Select All</button>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {SUPPORTED_LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => toggleTargetLang(l.code)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${targetLangs.includes(l.code) ? 'bg-gaming-accent border-gaming-accent text-white shadow-lg' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}
                  >
                    <span className="block text-[10px] opacity-60 uppercase mb-0.5">{l.code}</span>
                    <span className="font-bold text-sm block truncate">{l.zhName}</span>
                    {targetLangs.includes(l.code) && <i className="fas fa-check absolute top-2 right-2 text-xs opacity-50"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Info */}
            <div className="bg-gaming-card p-8 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col gap-6">
              <h3 className="text-xl font-black flex items-center gap-3"><i className="fas fa-pen-nib"></i> {t.sec_lang_context}</h3>

              {/* Context Input - Fixed Height with Scroll */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">{t.lbl_game_ctx}</label>
                <p className="text-xs text-gray-500">{t.desc_game_ctx}</p>
                <textarea
                  className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-gaming-accent resize-none custom-scrollbar leading-relaxed"
                  placeholder="請描述內容背景... (例如：這是遊戲UI文本、這是法律合約、這是科技產品說明書...)"
                  value={gameContext}
                  onChange={e => setGameContext(e.target.value)}
                />
              </div>

              {/* Naming Template */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">{t.lbl_template}</label>
                <input
                  type="text"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-gaming-accent font-mono text-sm"
                  placeholder={t.desc_template}
                  value={namingTemplate}
                  onChange={e => setNamingTemplate(e.target.value)}
                />
              </div>

              {/* Localized Expert Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                  <strong className="block mb-2 text-blue-200 text-xs uppercase tracking-widest"><i className="fas fa-ruler-combined mr-1"></i> RU/DE Tips</strong>
                  <ul className="space-y-1 text-xs text-blue-300/80 list-disc list-inside">
                    <li><strong>Level (RU):</strong> use "ур. #" (ур. 5)</li>
                    <li><strong>Star (RU):</strong> use "# зв." (5 зв.)</li>
                    <li><strong>Task (RU):</strong> use Infinitive (Пройти)</li>
                  </ul>
                </div>
                <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl">
                  <strong className="block mb-2 text-purple-200 text-xs uppercase tracking-widest"><i className="fas fa-shield-cat mr-1"></i> AI Protocols</strong>
                  <p className="text-xs text-purple-300/80">
                    {t.tip_lqa}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* [LEGACY RESTORE] Live Preview Section */}
          <div className="xl:col-span-12 mt-8 animate-fadeIn">
            <div className="bg-gaming-card/50 p-8 rounded-[2rem] border border-white/5 shadow-xl overflow-hidden">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gaming-accent">
                <i className="fas fa-table-columns"></i> 數據預覽對照 (Live Preview)
              </h3>
              <div className="overflow-x-auto custom-scrollbar bg-black/20 rounded-xl border border-white/5">
                <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                  <thead className="bg-black/40 text-xs uppercase font-black tracking-widest text-gaming-muted">
                    <tr>
                      <th className="p-4 border-b border-white/10">{keyColumn || "ID Key"}</th>
                      <th className="p-4 border-b border-white/10 text-blue-400">{sourceColumn || "Source"}</th>
                      {targetLangs.map(lang => (
                        <th key={lang} className="p-4 border-b border-white/10 text-emerald-400">
                          {SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name} ({targetCols[lang] || "New"})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rawData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-white/50">{String(row[keyColumn] || "")}</td>
                        <td className="p-4 font-medium text-white max-w-xs truncate">{String(row[sourceColumn] || "")}</td>
                        {targetLangs.map(lang => (
                          <td key={lang} className="p-4 text-white/70 max-w-xs truncate">
                            {targetCols[lang] && row[targetCols[lang]] ? String(row[targetCols[lang]]) : <span className="opacity-20 italic">-- Empty --</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="h-32"></div> {/* Spacer for bottom bar */}
      </main>

      {/* Global Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
});

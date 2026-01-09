
import React, { useState } from 'react';
import { TranslationConfig, GlossaryTerm, SUPPORTED_LANGUAGES } from '../types';
import { generateGlossarySuggestions } from '../services/geminiService';

interface StepGlossaryProps {
  config: Partial<TranslationConfig>;
  allTexts: string[];
  onStartTranslation: (glossary: GlossaryTerm[]) => void;
  onBack: () => void;
}

export const StepGlossary: React.FC<StepGlossaryProps> = ({ config, allTexts, onStartTranslation, onBack }) => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const performGlobalScan = (texts: string[]) => {
    const freqMap: Record<string, number> = {};
    const minLength = 2;
    const maxLength = 8;
    texts.forEach(text => {
      if (!text || text.length < minLength) return;
      for (let i = 0; i < text.length; i++) {
        for (let len = minLength; len <= maxLength; len++) {
          if (i + len <= text.length) {
            const gram = text.substring(i, i + len).trim();
            if (gram.length < minLength) continue;
            if (/^[\d\s\p{P}]+$/u.test(gram)) continue;
            freqMap[gram] = (freqMap[gram] || 0) + 1;
          }
        }
      }
    });
    return Object.entries(freqMap)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([word]) => word);
  };

  const handleAutoGenerate = async () => {
    if (allTexts.length === 0) {
      alert("檔案內容為空，無法偵測術語。");
      return;
    }
    setIsGenerating(true);
    try {
      const highFreqCandidates = performGlobalScan(allTexts);
      const contextSamples = [
        ...allTexts.slice(0, 20),
        ...allTexts.slice(Math.floor(allTexts.length / 2), Math.floor(allTexts.length / 2) + 20),
        ...allTexts.slice(-20)
      ].filter(t => t && t.trim().length > 0);
      const targets = SUPPORTED_LANGUAGES.filter(l => config.targetLangs?.includes(l.code));
      const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === config.sourceLang)?.name || "Traditional Chinese";
      const generatedTerms = await generateGlossarySuggestions(highFreqCandidates, contextSamples, config.gameContext || "", sourceName, targets);
      if (generatedTerms.length === 0) {
        alert("未偵測到明顯術語。");
      } else {
        setTerms(prev => {
          const existing = new Set(prev.map(p => p.term));
          return [...prev, ...generatedTerms.filter(g => !existing.has(g.term))];
        });
      }
    } catch (err) {
      alert("偵測失敗。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTerm = () => setTerms([{ term: "", description: "", translations: {} }, ...terms]);
  const handleTermChange = (index: number, field: keyof GlossaryTerm, value: string) => {
    const newTerms = [...terms];
    (newTerms[index] as any)[field] = value;
    setTerms(newTerms);
  };
  const handleTranslationChange = (index: number, langCode: string, value: string) => {
    const newTerms = [...terms];
    newTerms[index].translations = { ...newTerms[index].translations, [langCode]: value };
    setTerms(newTerms);
  };
  const handleDeleteTerm = (index: number) => setTerms(terms.filter((_, i) => i !== index));

  return (
    <div className="h-full flex flex-col bg-gaming-dark">
      {/* 頂部導覽 */}
      <div className="bg-gaming-card border-b border-white/10 p-6 flex items-center justify-between shrink-0 shadow-xl relative z-20">
        <div className="flex items-center gap-6">
           <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-gaming-muted hover:text-white transition-all">
              <i className="fas fa-arrow-left"></i>
           </button>
           <div className="space-y-1">
              <h2 className="text-xl font-black text-white">術語庫配置</h2>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] bg-gaming-accent/20 text-gaming-accent px-2 py-0.5 rounded font-black uppercase tracking-widest border border-gaming-accent/30">Global Scan Enabled</span>
                 <p className="text-xs text-gaming-muted">已掃描 {allTexts.length} 列資料</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={handleAutoGenerate} 
             disabled={isGenerating}
             className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${isGenerating ? 'bg-gray-800 text-gray-500' : 'bg-gaming-accent/20 border border-gaming-accent/50 text-gaming-accent hover:bg-gaming-accent hover:text-white'}`}
           >
             {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
             自動偵測術語
           </button>
           <button onClick={handleAddTerm} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm hover:bg-white/10 transition-all flex items-center gap-2">
              <i className="fas fa-plus"></i> 手動新增
           </button>
           <div className="w-px h-8 bg-white/10 mx-2"></div>
           <button 
             onClick={() => onStartTranslation(terms)}
             className="px-8 py-3 bg-gaming-success text-white rounded-xl font-black text-sm hover:brightness-110 shadow-lg shadow-gaming-success/20 transition-all flex items-center gap-3"
           >
              下一步：開始{config.isProofreadMode ? "校稿" : "翻譯"} <i className="fas fa-chevron-right text-xs"></i>
           </button>
        </div>
      </div>

      {/* 術語清單表格區 */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="max-w-[1600px] mx-auto">
          {terms.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gaming-muted/30">
               <i className="fas fa-book-open text-8xl mb-8"></i>
               <p className="text-xl font-bold italic tracking-widest">目前暫無術語</p>
               <button onClick={handleAutoGenerate} className="mt-8 text-gaming-accent hover:underline font-bold">點擊執行「全局掃描」自動產生術語庫</button>
            </div>
          ) : (
            <div className="bg-gaming-card border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-black/40 border-b border-white/10">
                  <tr>
                    <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] w-[15%]">原文術語 (Term)</th>
                    <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] w-[15%]">說明 (Description)</th>
                    <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">目標語言翻譯建議 (Translations)</th>
                    <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] w-20 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {terms.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      {/* 原文術語 */}
                      <td className="p-4 align-top">
                        <input 
                          type="text" 
                          value={item.term}
                          onChange={(e) => handleTermChange(idx, 'term', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-base text-white font-black focus:border-gaming-accent outline-none shadow-inner"
                          placeholder="原文"
                        />
                      </td>

                      {/* 說明 */}
                      <td className="p-4 align-top">
                        <textarea 
                          value={item.description}
                          onChange={(e) => handleTermChange(idx, 'description', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-400 focus:border-gaming-accent outline-none shadow-inner h-[42px] resize-none overflow-hidden hover:h-auto focus:h-auto"
                          placeholder="術語用途..."
                        />
                      </td>

                      {/* 目標翻譯 (橫向排列組) */}
                      <td className="p-4 align-top">
                        <div className="flex flex-wrap gap-3">
                          {config.targetLangs?.map(langCode => {
                             const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
                             return (
                               <div key={langCode} className="flex-1 min-w-[180px] group/item">
                                 <div className="flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden focus-within:border-gaming-success transition-all">
                                    <span className="bg-white/5 px-3 py-2 text-[9px] font-black text-gaming-muted border-r border-white/5 uppercase shrink-0">
                                      {lang?.code.split('-')[0]}
                                    </span>
                                    <input 
                                       type="text"
                                       value={item.translations[langCode] || ""}
                                       onChange={(e) => handleTranslationChange(idx, langCode, e.target.value)}
                                       className="w-full bg-transparent px-3 py-2 text-sm text-gaming-success font-black outline-none"
                                       placeholder={lang?.name}
                                    />
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      </td>

                      {/* 刪除按鈕 */}
                      <td className="p-4 align-top text-center">
                        <button 
                          onClick={() => handleDeleteTerm(idx)}
                          className="w-10 h-10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <i className="fas fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 text-center shrink-0 border-t border-white/5 bg-black/20">
         <p className="text-xs text-gaming-muted italic">
           <i className="fas fa-info-circle mr-2 text-gaming-accent"></i>
           提示：AI 在翻譯時會強制遵守上表定義的術語對照，確保同一名詞在整份遊戲文本中呈現一致的本地化結果。
         </p>
      </div>
    </div>
  );
};

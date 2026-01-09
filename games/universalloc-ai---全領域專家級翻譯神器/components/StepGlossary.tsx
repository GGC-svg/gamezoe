
import React, { useState } from 'react';
import { TranslationConfig, GlossaryTerm, SUPPORTED_LANGUAGES, UILang } from '../types';
import { generateGlossarySuggestions } from '../services/geminiService';

interface StepGlossaryProps {
  config: Partial<TranslationConfig>;
  allTexts: string[];
  onStartTranslation: (glossary: GlossaryTerm[]) => void;
  onBack: () => void;
  uiLang?: UILang;
}

export const StepGlossary: React.FC<StepGlossaryProps> = ({ config, allTexts, onStartTranslation, onBack, uiLang = 'zh-TW' }) => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");

  const performSmartScan = (texts: string[]) => {
    const freqMap: Record<string, number> = {};
    const minLength = 2;
    const maxLength = 12;
    const tagRegex = /<[^>]*>|\{[^}]*\}|\[[^\]]*\]/g;
    const numericRegex = /^[0-9]+$/;
    const maxScanRows = 6000;
    const step = Math.max(1, Math.floor(texts.length / maxScanRows));

    for (let i = 0; i < texts.length; i += step) {
      let text = texts[i];
      if (!text || typeof text !== 'string') continue;
      let cleanText = text.replace(tagRegex, ' ').replace(/[0-9]+/g, '').trim();
      if (cleanText.length < minLength) continue;
      for (let j = 0; j < cleanText.length; j++) {
        for (let len = minLength; len <= maxLength; len++) {
          if (j + len <= cleanText.length) {
            let gram = cleanText.substring(j, j + len).trim();
            if (gram.length < minLength || numericRegex.test(gram) || gram.includes(' ')) continue;
            freqMap[gram] = (freqMap[gram] || 0) + 1;
          }
        }
      }
    }
    const candidates = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 300).map(([word]) => word);
    if (candidates.length < 50) {
      const extra = texts.slice(0, 500).map(t => t.replace(tagRegex, ' ').trim()).filter(t => t.length > 4 && t.length < 15).slice(0, 100);
      return Array.from(new Set([...candidates, ...extra]));
    }
    return candidates;
  };

  const handleDeepScan = async () => {
    if (allTexts.length === 0) return;
    setIsGenerating(true);
    setGenerationStatus("正在本地掃描高頻詞... 0%");

    // 1. Local Scan (Fast)
    // Run in timeout to let UI render the 0% state
    setTimeout(async () => {
      const candidates = performSmartScan(allTexts);
      const targets = SUPPORTED_LANGUAGES.filter(l => config.targetLangs?.includes(l.code));

      // [CONTEXT INJECTION]
      const unifiedContext = `
          [GAME WORLD CONTEXT]: ${config.gameContext || "General Game Localization"}
          [NAMING TEMPLATE]: ${config.namingTemplate || "None"}
          [USER STYLE RULES]: Please check if the user specified any specific term rules in the context above (e.g. "Do not use X", "Always use Y").
        `;

      if (candidates.length === 0) {
        setGenerationStatus("未發現高頻術語");
        setIsGenerating(false);
        return;
      }

      // 2. AI Batch Processing
      const AI_BATCH_SIZE = 10; // Drastically reduced from 40 to 10 to prevent Server 500 / Payload Limit
      const chunks = [];
      for (let i = 0; i < candidates.length; i += AI_BATCH_SIZE) {
        chunks.push(candidates.slice(i, i + AI_BATCH_SIZE));
      }

      let completed = 0;
      const total = chunks.length;
      const seenTerms = new Set<string>();

      // Optimize Samples: Take only first 20 lines, max 100 chars each to save tokens/payload
      const optimizedSamples = allTexts.slice(0, 20).map(s => s.length > 100 ? s.substring(0, 100) + "..." : s);

      try {
        for (let i = 0; i < total; i++) {
          const chunk = chunks[i];
          const pct = Math.round((i / total) * 100);
          setGenerationStatus(`AI 深度分析中... ${pct}% (批次 ${i + 1}/${total})`);

          // Add jitter to avoid burst limits if necessary, though backend should handle it.
          // Call AI
          const batchResults = await generateGlossarySuggestions(chunk, optimizedSamples, unifiedContext, "Traditional Chinese", targets);

          // Real-time update to list
          setTerms(prev => {
            const existing = new Set(prev.map(p => p.term));
            // Filter out duplicates within global context
            const uniqueNew = batchResults.filter(t => !existing.has(t.term) && !seenTerms.has(t.term));
            uniqueNew.forEach(t => seenTerms.add(t.term));
            return [...prev, ...uniqueNew];
          });
        }

        setGenerationStatus(`分析完成！共提取 ${seenTerms.size} 個核心術語。`);
        setTimeout(() => setGenerationStatus(""), 5000);
      } catch (err) {
        console.error(err);
        setGenerationStatus("AI 連線發生錯誤");
        alert("API Error during glossary extraction");
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="h-full flex flex-col bg-gaming-dark overflow-hidden font-sans">
      <div className="bg-gaming-card border-b border-white/10 p-4 lg:px-8 flex items-center justify-between gap-4 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-white border border-white/10 shrink-0 hover:bg-white/10">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">術語庫 (GLOSSARY)</h2>
            <p className="text-[10px] text-gaming-accent font-black uppercase tracking-widest">{generationStatus || "引擎就緒"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDeepScan} disabled={isGenerating} className={`px-4 py-2 rounded-lg font-black text-xs transition-all border ${isGenerating ? 'bg-white/5 border-white/10 text-white/20' : 'bg-gaming-accent/10 border-gaming-accent text-gaming-accent hover:bg-gaming-accent hover:text-white shadow-lg'}`}>
            {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>} AI 智能提取
          </button>
          <button onClick={() => onStartTranslation(terms)} className="px-6 py-2 bg-gaming-success text-white rounded-lg font-black text-xs shadow-xl hover:brightness-110 active:scale-95 transition-all">
            確認下一步 <i className="fas fa-bolt ml-1"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-black/10 p-4">
        <div className="max-w-[1600px] mx-auto space-y-2">
          {terms.length === 0 && !isGenerating ? (
            <div className="h-[40vh] flex flex-col items-center justify-center opacity-10">
              <i className="fas fa-layer-group text-7xl mb-4"></i>
              <p className="text-lg font-black tracking-widest uppercase italic">等待 AI 注入術語資料...</p>
            </div>
          ) : (
            terms.map((item, idx) => (
              <div key={idx} className="bg-gaming-card border border-white/5 hover:border-gaming-accent/40 rounded-lg p-2 flex flex-col lg:flex-row items-center gap-3 group transition-all">
                <div className="w-full lg:w-48 shrink-0">
                  <input type="text" value={item.term} onChange={e => {
                    const next = [...terms]; next[idx].term = e.target.value; setTerms(next);
                  }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-black text-white outline-none focus:border-gaming-accent" placeholder="原文術語" />
                </div>
                <div className="w-full lg:flex-1">
                  <input type="text" value={item.description} onChange={e => {
                    const next = [...terms]; next[idx].description = e.target.value; setTerms(next);
                  }} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-bold text-gaming-muted outline-none focus:border-gaming-accent" placeholder="術語定義" />
                </div>
                <div className="w-full lg:w-[400px]">
                  <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
                    {config.targetLangs?.map(code => (
                      <div key={code} className="flex bg-black/60 border border-white/5 rounded items-center h-8">
                        <span className="px-2 bg-white/5 text-[8px] font-black text-gaming-accent uppercase w-8 text-center">{code.substring(0, 2)}</span>
                        <input type="text" value={item.translations[code] || ""} onChange={e => {
                          const next = [...terms]; next[idx].translations = { ...next[idx].translations, [code]: e.target.value }; setTerms(next);
                        }} className="w-full bg-transparent px-2 text-[10px] font-black text-gaming-success outline-none" placeholder="譯名" />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setTerms(terms.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center text-red-500/20 hover:text-red-500 transition-all shrink-0"><i className="fas fa-trash-can text-[10px]"></i></button>
              </div>
            ))
          )}
        </div>
      </div>
      <button onClick={() => setTerms([{ term: "", description: "", translations: {} }, ...terms])} className="fixed bottom-6 right-6 w-12 h-12 bg-gaming-accent text-white rounded-full shadow-2xl flex items-center justify-center text-xl z-50 hover:scale-110 transition-all"><i className="fas fa-plus"></i></button>
    </div>
  );
};

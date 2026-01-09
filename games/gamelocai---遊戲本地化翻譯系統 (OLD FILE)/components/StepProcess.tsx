
import React, { useEffect, useState, useRef } from 'react';
import { TranslationItem, TranslationConfig, SUPPORTED_LANGUAGES, BatchResult } from '../types';
import { chunkArray, translateBatch } from '../services/geminiService';
import { exportToExcel, exportToCSV } from '../services/excelService';

interface StepProcessProps {
  items: TranslationItem[];
  config: TranslationConfig;
  onReset: () => void;
  rawFile: File | null; 
}

export const StepProcess: React.FC<StepProcessProps> = ({ items: initialItems, config, onReset, rawFile }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentAction, setCurrentAction] = useState("初始化並行任務...");
  const [patternHint, setPatternHint] = useState<string | undefined>(undefined);
  const [learnedTermsCount, setLearnedTermsCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  const totalWorkUnits = initialItems.length * config.targetLangs.length;

  const [visibleItems, setVisibleItems] = useState<TranslationItem[]>([]);
  const internalItemsRef = useRef<TranslationItem[]>([...initialItems]);

  useEffect(() => {
    let isCancelled = false;
    let currentCompleted = 0;
    const CONCURRENCY = 3; 

    const processInParallel = async () => {
      const workingItems = [...initialItems];

      for (const langCode of config.targetLangs) {
        if (isCancelled) break;
        const langName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || langCode;
        const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === config.sourceLang)?.name || config.sourceLang;
        const batches = chunkArray<TranslationItem>(workingItems, config.batchSize || 40);
        
        let currentLangPattern: string | undefined = undefined;
        let currentLangVocab: Record<string, string> = {};

        for (let i = 0; i < batches.length; i += CONCURRENCY) {
          if (isCancelled) break;
          const currentWave = batches.slice(i, i + CONCURRENCY);
          
          setCurrentAction(`${config.isProofreadMode ? '並行校正' : '並行翻譯'} [${langName}] - 批次 ${i+1}~${Math.min(i+CONCURRENCY, batches.length)}/${batches.length}`);

          // 使用 Promise.all 執行當前波次的並行請求
          const results = await Promise.all(currentWave.map(async (batch) => {
            const itemsToTranslate = batch.filter(it => it.original?.trim().length > 0);
            const emptyItems = batch.filter(it => !it.original?.trim());

            emptyItems.forEach(item => {
              const idx = workingItems.findIndex(w => w.id === item.id);
              if (idx !== -1) {
                workingItems[idx] = { ...workingItems[idx], status: 'completed', translations: { ...workingItems[idx].translations, [langCode]: "" } };
              }
            });

            if (itemsToTranslate.length === 0) return { translations: new Map(), emptyCount: emptyItems.length } as any;

            try {
              const existingMap = new Map<string, string>();
              itemsToTranslate.forEach(it => {
                 const val = it.translations[langCode];
                 if (val) existingMap.set(it.id, val);
              });

              const result = await translateBatch(
                itemsToTranslate,
                langCode,
                langName,
                sourceName,
                config,
                existingMap,
                currentLangPattern,
                currentLangVocab
              );

              return { ...result, processedCount: itemsToTranslate.length, emptyCount: emptyItems.length, originalBatch: batch };
            } catch (e) {
              console.error("Batch failure:", e);
              return { translations: new Map(), processedCount: itemsToTranslate.length, emptyCount: emptyItems.length, originalBatch: batch };
            }
          }));

          // 彙整這一波並行處理學到的所有「新術語」與「成果」
          results.forEach((res: any) => {
            if (!res) return;
            currentCompleted += (res.processedCount || 0) + (res.emptyCount || 0);
            
            // 彙整術語記憶
            if (res.vocabularyMap) {
               currentLangVocab = { ...currentLangVocab, ...res.vocabularyMap };
            }
            if (res.detectedPattern && !currentLangPattern) {
               currentLangPattern = res.detectedPattern;
            }

            // 更新數據回寫
            if (res.translations) {
              res.translations.forEach((trans: string, id: string) => {
                const idx = workingItems.findIndex(w => w.id === id);
                if (idx !== -1) {
                  workingItems[idx] = { 
                    ...workingItems[idx], 
                    status: 'completed', 
                    translations: { ...workingItems[idx].translations, [langCode]: trans } 
                  };
                }
              });
            }
          });

          if (!isCancelled) {
            internalItemsRef.current = [...workingItems];
            setCompletedItems(currentCompleted);
            setProgress((currentCompleted / totalWorkUnits) * 100);
            setPatternHint(currentLangPattern);
            setLearnedTermsCount(Object.keys(currentLangVocab).length);
            
            const processedOnes = workingItems.filter(it => it.status === 'completed');
            setVisibleItems(processedOnes.slice(-300).reverse());
          }
        }
      }

      if (!isCancelled) {
        setIsProcessing(false);
        setCurrentAction(config.isProofreadMode ? "深度並行校對已全數完成" : "翻譯任務已全數完成");
      }
    };

    processInParallel();
    return () => { isCancelled = true; };
  }, []);

  const handleExportExcel = () => exportToExcel(internalItemsRef.current, rawFile?.name.split('.')[0] || "GameLoc");
  const handleExportCSV = () => {
    const data = internalItemsRef.current.map(i => ({ ID: i.id, Original: i.original, ...Object.fromEntries(Object.entries(i.translations).map(([k,v])=>[`Trans_${k}`,v])) }));
    exportToCSV(data, rawFile?.name.split('.')[0] || "GameLoc");
  };

  return (
    <div className="h-full flex flex-col bg-gaming-dark">
      <div className="bg-gaming-card border-b border-white/10 p-6 flex items-center justify-between shrink-0 shadow-2xl relative z-20">
        <div className="flex items-center gap-8">
           <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                {config.isProofreadMode ? "深度並行校正" : "並行翻譯任務"}
                {!isProcessing && <span className="text-[10px] bg-gaming-success/20 text-gaming-success px-2 py-0.5 rounded font-black border border-gaming-success/30 uppercase">Completed</span>}
              </h2>
              <div className="flex items-center gap-4">
                 <p className="text-xs font-bold text-gaming-accent flex items-center">
                    {isProcessing ? (
                      <><i className="fas fa-bolt animate-pulse mr-2"></i> {currentAction}</>
                    ) : (
                      <><i className="fas fa-check-double mr-2 text-gaming-success"></i> 已就緒</>
                    )}
                 </p>
                 <span className="text-[10px] text-gaming-muted border-l border-white/10 pl-4 font-mono font-bold uppercase tracking-wider">
                    {completedItems} / {totalWorkUnits} Units
                 </span>
              </div>
           </div>
           
           <div className="hidden lg:flex gap-3">
              <div className="bg-gaming-accent/10 border border-gaming-accent/20 rounded-xl px-4 py-2 flex items-center gap-3">
                 <div className="flex flex-col">
                    <span className="text-[8px] text-gaming-muted font-black uppercase tracking-widest">動態記憶鏈</span>
                    <span className="text-[11px] font-mono text-white font-bold">{learnedTermsCount} 個已學術語</span>
                 </div>
              </div>
              {patternHint && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                   <div className="flex flex-col">
                      <span className="text-[8px] text-gaming-muted font-black uppercase tracking-widest">風格同步</span>
                      <span className="text-[11px] font-mono text-blue-300 font-bold">{patternHint}</span>
                   </div>
                </div>
              )}
           </div>
        </div>

        <div className="flex items-center gap-6">
           {isProcessing ? (
             <div className="flex flex-col items-end">
                <span className="text-2xl font-black text-white font-mono leading-none">{Math.round(progress)}%</span>
                <span className="text-[9px] text-gaming-muted uppercase font-black tracking-widest mt-1">Efficiency</span>
             </div>
           ) : (
             <div className="flex gap-3">
                <button onClick={handleExportExcel} className="bg-gaming-success text-white px-6 py-3 rounded-xl font-black text-sm hover:brightness-110 shadow-lg">
                   <i className="fas fa-file-excel"></i> 導出 Excel
                </button>
                <button onClick={handleExportCSV} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:brightness-110 shadow-lg">
                   <i className="fas fa-file-csv"></i> 導出 CSV
                </button>
             </div>
           )}
           <button onClick={onReset} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-gaming-muted hover:text-white transition-all">
              <i className="fas fa-times"></i>
           </button>
        </div>
      </div>

      <div className="h-1.5 w-full bg-white/5 shrink-0 relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-gaming-accent via-blue-400 to-gaming-accent transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        >
          {isProcessing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gaming-dark custom-scrollbar p-6">
        <div className="max-w-[1600px] mx-auto bg-gaming-card border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-black/40 border-b border-white/10 sticky top-0 z-10">
              <tr>
                <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] w-[120px]">ID</th>
                <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em] w-[25%]">原文 (Source)</th>
                <th className="p-5 text-[10px] font-black text-gaming-muted uppercase tracking-[0.2em]">在地化優化成果 (Localized Output)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleItems.length === 0 && (
                <tr>
                   <td colSpan={3} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gaming-muted">
                        <i className="fas fa-circle-notch fa-spin text-4xl text-gaming-accent"></i>
                        <p className="text-xl font-black uppercase tracking-widest">正在利用並行記憶鏈處理 37,356 筆數據...</p>
                      </div>
                   </td>
                </tr>
              )}
              {visibleItems.map((item) => (
                <tr key={`${item.id}-${progress}`} className="group hover:bg-white/[0.02] transition-colors animate-fade-in">
                  <td className="p-4 align-top font-mono text-[10px] text-gaming-accent/60 break-all font-black">
                    {item.id}
                  </td>
                  <td className="p-4 align-top">
                    <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-gray-300 font-medium whitespace-pre-wrap leading-relaxed min-h-[42px]">
                      {item.original}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex flex-wrap gap-3">
                      {config.targetLangs.map(langCode => {
                         const translation = item.translations[langCode];
                         return (
                           <div key={langCode} className="flex-1 min-w-[280px]">
                              <div className="flex items-start bg-black/40 border border-gaming-success/30 rounded-lg overflow-hidden">
                                 <span className="bg-white/5 px-2.5 py-2 text-[8px] font-black text-gaming-muted border-r border-white/5 uppercase shrink-0 mt-0.5">
                                   {langCode.split('-')[0]}
                                 </span>
                                 <div className="w-full px-3 py-2 text-sm leading-relaxed text-gaming-success font-bold">
                                   {translation || <span className="text-gray-700 italic">Processing...</span>}
                                 </div>
                              </div>
                           </div>
                         );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

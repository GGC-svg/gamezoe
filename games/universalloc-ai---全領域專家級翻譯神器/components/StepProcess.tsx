
import React, { useEffect, useState, useRef } from 'react';
import { TranslationItem, TranslationConfig, SUPPORTED_LANGUAGES, GlossaryTerm } from '../types';
import { chunkArray, translateBatch } from '../services/geminiService';
import { exportToExcel, generateExcelBlob } from '../services/excelService';
import { getSessionUsage, addSessionUsage, FREE_SESSION_QUOTA, countWords } from '../services/billingService';

interface StepProcessProps {
  items: TranslationItem[];
  config: TranslationConfig;
  onReset: () => void;
  rawFile: File | null;
  onUnlockPremium: () => void;
  orderId?: string | null;
  glossary?: GlossaryTerm[];
}

const FREE_TRIAL_ROWS = 10;
const BATCH_SIZE = 20; // Optimized for Speed and Stability (reduced from 50 to avoid timeouts)
const CONCURRENT_REQUESTS = 3; // Parallelism
const INTERNAL_SECRET = "GAMELOC_INTERNAL_2025";

export const StepProcess: React.FC<StepProcessProps> = ({ items: initialItems, config, onReset, rawFile, onUnlockPremium, orderId, glossary }) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentAction, setCurrentAction] = useState("Initializing Engine...");
  const [progress, setProgress] = useState(0);

  // Global State for Consistency
  const [globalVocab, setGlobalVocab] = useState<Record<string, string>>({});
  const [lockedPatterns, setLockedPatterns] = useState<Record<string, string>>({});

  const isUnlocked = config.isPremiumUnlocked || config.internalAccessKey === INTERNAL_SECRET;
  const targetProcessCount = isUnlocked ? initialItems.length : Math.min(initialItems.length, FREE_TRIAL_ROWS);
  const totalWorkUnits = targetProcessCount * config.targetLangs.length;

  const [visibleItems, setVisibleItems] = useState<TranslationItem[]>([]);
  const internalItemsRef = useRef<TranslationItem[]>(initialItems.map((it, idx) => ({
    ...it,
    status: (idx < targetProcessCount ? 'pending' : 'locked') as TranslationItem['status']
  })));

  // Scroll to bottom helper
  const bottomRef = useRef<HTMLDivElement>(null);

  // Handle download and upload result to server
  const handleDownloadAndSave = async () => {
    // First, trigger the normal Excel download
    exportToExcel(internalItemsRef.current, "LocProject");

    // If we have an orderId, upload the result to the server
    if (orderId) {
      try {
        const blob = await generateExcelBlob(internalItemsRef.current, "LocProject");
        const formData = new FormData();
        formData.append('file', blob, 'result_' + orderId + '.xlsx');
        if (glossary && glossary.length > 0) {
          formData.append('glossary', JSON.stringify(glossary));
        }

        const res = await fetch('/api/service/' + orderId + '/upload-result', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          console.log('[StepProcess] Result uploaded successfully');
        } else {
          console.warn('[StepProcess] Failed to upload result:', await res.text());
        }
      } catch (err) {
        console.error('[StepProcess] Error uploading result:', err);
      }
    }
  };


  useEffect(() => {
    // Initial Render
    setVisibleItems(internalItemsRef.current.slice(0, 20));

    if (!isUnlocked && getSessionUsage() > FREE_SESSION_QUOTA) {
      setIsProcessing(false); return;
    }

    let isCancelled = false;
    let currentCompleted = 0;

    const process = async () => {
      const workingItems = internalItemsRef.current;
      const itemsToProc: TranslationItem[] = workingItems.filter(it => it.status === 'pending');

      for (const langCode of config.targetLangs) {
        if (isCancelled) break;
        const langName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || langCode;

        let currentLangVocab: Record<string, string> = { ...globalVocab };
        config.glossary?.forEach(g => {
          if (g.translations[langCode]) currentLangVocab[g.term] = g.translations[langCode];
        });

        // Current Locked Pattern for this language
        let currentPattern = lockedPatterns[langCode] || "";

        const allBatches = chunkArray<TranslationItem>(itemsToProc, BATCH_SIZE);

        // Process in chunks of CONCURRENT_REQUESTS
        for (let i = 0; i < allBatches.length; i += CONCURRENT_REQUESTS) {
          if (isCancelled) break;

          const concurrentBatches = allBatches.slice(i, i + CONCURRENT_REQUESTS);
          const promises = concurrentBatches.map(async (batch, idx) => {
            const batchIndex = i + idx;
            setCurrentAction(`Processing [${langName}] Batch ${batchIndex + 1}/${allBatches.length}`);

            const existingMap = new Map<string, string>();
            batch.forEach(item => {
              if (item.translations[langCode]) {
                existingMap.set(item.id, item.translations[langCode]);
              }
            });

            try {
              // Pass current vocabulary chain
              const res = await translateBatch(
                batch,
                langCode,
                langName,
                "Source",
                config,
                existingMap,
                currentPattern,
                currentLangVocab
              );
              return { res, batch };
            } catch (e) {
              console.error(`Batch ${batchIndex} failed`, e);
              return null;
            }
          });

          // Wait for all concurrent requests to finish
          const results = await Promise.all(promises);

          // Process Results & Update Global State
          let newVocabFound = false;
          let wordsAdded = 0;

          results.forEach(result => {
            if (!result) return;
            const { res, batch } = result;

            // 1. Update Vocab Chain immediately
            if (res.termDecisions) {
              Object.assign(currentLangVocab, res.termDecisions);
              newVocabFound = true;
            }

            // 2. Lock Pattern on First Batch
            if (!currentPattern && res.detectedPattern) {
              currentPattern = res.detectedPattern;
              setLockedPatterns(prev => ({ ...prev, [langCode]: currentPattern }));
            }

            // 3. Update Items
            res.translations.forEach((val, id) => {
              const idx = workingItems.findIndex(w => w.id === id);
              if (idx !== -1) {
                workingItems[idx] = {
                  ...workingItems[idx],
                  status: 'completed',
                  translations: { ...workingItems[idx].translations, [langCode]: val }
                };
                wordsAdded += countWords(val);
              }
            });
          });

          if (newVocabFound) {
            setGlobalVocab(prev => ({ ...prev, ...currentLangVocab }));
          }

          addSessionUsage(wordsAdded);
          currentCompleted += itemsToProc.length > 0 ? (concurrentBatches.reduce((acc, b) => acc + b.length, 0)) : 0;
          // Fix progress calculation: currentCompleted is total processed items across all langs
          // But here we are iterating per lang. So we need to track global progress carefully.
          // Simplification: just increment global counter.

          const globalProgress = Math.min((currentCompleted / totalWorkUnits) * 100, 100); // Rough estimate fix
          setProgress(prev => Math.max(prev, globalProgress)); // Monotonic increase

          // 4. Update UI Window (Performance Optimization)
          // Only show last 50 processed + next 50 pending
          const lastProcessedIndex = workingItems.findIndex(it => it.status === 'pending');
          const safeIndex = lastProcessedIndex === -1 ? workingItems.length : lastProcessedIndex;
          const start = Math.max(0, safeIndex - 50);
          const end = Math.min(workingItems.length, safeIndex + 50);

          setVisibleItems([...workingItems.slice(start, end)]);

          // Auto-scroll logic if needed, but sliding window might be better static.
        }
      }
      setIsProcessing(false);
      setVisibleItems(internalItemsRef.current.slice(0, 100)); // Show beginning on finish
      setCurrentAction("Mission Accomplished");
      setProgress(100);

      // Auto-save result to server when translation completes
      if (orderId) {
        try {
          const blob = await generateExcelBlob(internalItemsRef.current, "LocProject");
          const formData = new FormData();
          formData.append('file', blob, 'result_' + orderId + '.xlsx');
          if (glossary && glossary.length > 0) {
            formData.append('glossary', JSON.stringify(glossary));
          }

          const res = await fetch('/api/service/' + orderId + '/upload-result', {
            method: 'POST',
            body: formData
          });

          if (res.ok) {
            console.log('[StepProcess] Result auto-saved successfully');
            if (glossary && glossary.length > 0) {
              console.log('[StepProcess] Glossary saved:', glossary.length, 'terms');
            }
            setCurrentAction("Mission Accomplished - Saved!");
          } else {
            console.warn('[StepProcess] Failed to auto-save result:', await res.text());
          }
        } catch (err) {
          console.error('[StepProcess] Error auto-saving result:', err);
        }
      }
    };

    process();

    return () => { isCancelled = true; };
  }, [isUnlocked]);

  return (
    <div className="h-full flex flex-col bg-gaming-dark relative overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-gaming-card border-b border-white/10 p-4 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 z-20 shadow-xl">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
              {isUnlocked ? <i className="fas fa-check-double text-gaming-success"></i> : <i className="fas fa-shield-halved text-amber-500"></i>}
              {isUnlocked ? 'DEPLOYING...' : 'PREVIEW MODE'}
            </h2>
            <p className="text-[10px] font-black text-gaming-accent uppercase tracking-widest mt-0.5 flex items-center gap-2">
              {currentAction}
              {isProcessing && <span className="w-2 h-2 bg-gaming-accent rounded-full animate-ping"></span>}
            </p>
          </div>

          {/* Dynamic Indicators */}
          <div className="hidden lg:flex gap-4">
            {/* Vocab Indicator */}
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5 relative group cursor-help transition-all hover:bg-black/60">
              <i className="fas fa-book-journal-whills text-purple-400 animate-pulse"></i>
              <div>
                <div className="text-[8px] text-gaming-muted uppercase font-black">Dynamic Memory</div>
                <div className="text-sm font-black text-white">{Object.keys(globalVocab).length} Terms Learned</div>
              </div>
              <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white text-xs p-4 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                <p className="font-bold mb-2 text-purple-400 border-b border-white/10 pb-1">Recently Learned Strategy:</p>
                <ul className="space-y-1 text-gray-400 font-mono">
                  {Object.entries(globalVocab).slice(-8).reverse().map(([k, v]) => (
                    <li key={k} className="flex justify-between"><span>{k}</span> <span className="text-white">→ {v}</span></li>
                  ))}
                  {Object.keys(globalVocab).length === 0 && <li className="italic opacity-50">(Analyzing pattern...)</li>}
                </ul>
              </div>
            </div>

            {/* Pattern Indicator */}
            {Object.keys(lockedPatterns).length > 0 && (
              <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-xl border border-blue-500/30 relative group cursor-help animate-fadeIn">
                <i className="fas fa-fingerprint text-blue-400"></i>
                <div>
                  <div className="text-[8px] text-blue-300 uppercase font-black">Pattern Lock</div>
                  <div className="text-sm font-black text-white">{Object.keys(lockedPatterns).length} Active</div>
                </div>
                <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white text-xs p-4 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-bold mb-2 text-blue-400">Active Patterns:</p>
                  <ul className="space-y-1 text-gray-400">
                    {Object.entries(lockedPatterns).map(([k, v]) => (
                      <li key={k}><strong className="uppercase mr-1 text-xs opacity-70">{k}:</strong> {v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="hidden xl:block text-right">
            <div className="text-3xl font-black text-white/10">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="flex gap-3">
          {!isUnlocked && (
            <button onClick={onUnlockPremium} className="bg-amber-500 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all">
              <i className="fas fa-crown mr-2"></i> UPGRADE
            </button>
          )}
          {!isProcessing && isUnlocked && (
            <button onClick={handleDownloadAndSave} className="bg-gaming-success text-white px-6 py-2 rounded-xl font-black text-xs shadow-xl hover:scale-105 transition-all">
              <i className="fas fa-file-export mr-2"></i> DOWNLOAD XSLX
            </button>
          )}
          <button onClick={onReset} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white border border-white/10 hover:bg-white/10"><i className="fas fa-xmark"></i></button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-black/50 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
        <div className="h-full bg-gaming-accent transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.5)]" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Table UI - Optimized Window */}
      <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-gaming-dark relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gaming-card z-10 shadow-lg">
            <tr>
              <th className="p-4 border-b border-white/10 w-16 text-center text-xs font-black text-gaming-muted uppercase">#</th>
              <th className="p-4 border-b border-white/10 w-32 text-xs font-black text-purple-400 uppercase tracking-widest">ID Key</th>
              <th className="p-4 border-b border-white/10 text-xs font-black text-gaming-accent uppercase tracking-widest">Source Text</th>
              <th className="p-4 border-b border-white/10 text-xs font-black text-white uppercase tracking-widest">Target Translations (Dynamic)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 text-center text-xs font-mono text-white/20 group-hover:text-gaming-accent">
                  {item.status === 'completed' ? <i className="fas fa-check text-green-500"></i> : <span className="opacity-50">...</span>}
                </td>
                <td className="p-4 text-xs font-bold text-white/50 font-mono truncate max-w-[150px]">{item.id}</td>
                <td className="p-4 text-sm font-medium text-white max-w-md">{item.original}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {config.targetLangs.map(code => (
                      <div key={code} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono transition-all ${item.translations[code] ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-black/30 border-white/5 text-gray-500'}`}>
                        <span className="text-[9px] font-black uppercase opacity-50">{code}</span>
                        <span className="truncate max-w-[200px]">{item.translations[code] || 'Processing...'}</span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={bottomRef}></div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

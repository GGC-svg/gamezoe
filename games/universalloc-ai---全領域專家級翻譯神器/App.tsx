
import React, { useState, useEffect, useRef } from 'react';
import { AppState, ExcelRow, TranslationConfig, TranslationItem, GlossaryTerm, WorksheetData, UILang } from './types';
import { StepUpload } from './components/StepUpload';
import { StepConfig, StepConfigHandle } from './components/StepConfig';
import { StepProcess } from './components/StepProcess';
import { StepGlossary } from './components/StepGlossary';
import { StepCleaner } from './components/StepCleaner';
import { StepSheetSelect } from './components/StepSheetSelect';
import { getColumnNames } from './services/excelService';
import { getSessionUsage, FREE_SESSION_QUOTA, calculateEstimatedCost, countWords } from './services/billingService';

// Translation History Item
interface TranslationRecord {
  id: string;
  date: string;
  fileName: string;
  charCount: number;
  costUSD: number;
  status: 'pending' | 'paid' | 'completed';
  downloadUrl?: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [uiLang, setUiLang] = useState<UILang>('zh-TW');
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [allSheetsData, setAllSheetsData] = useState<WorksheetData[]>([]);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [translationItems, setTranslationItems] = useState<TranslationItem[]>([]);
  const [config, setConfig] = useState<Partial<TranslationConfig>>({ isPremiumUnlocked: false });
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [sessionUsage, setSessionUsage] = useState(0);

  // Billing state
  const [billingInfo, setBillingInfo] = useState<{ totalWords: number; cost: number; perLangWords: number }>({ totalWords: 0, cost: 0, perLangWords: 0 });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<TranslationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [canStartConfig, setCanStartConfig] = useState(false);

  // Ref for StepConfig to trigger start from bottom bar
  const stepConfigRef = useRef<StepConfigHandle>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionUsage(getSessionUsage());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tell parent GamePlayer to hide its billing bar (we have our own)
  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'HIDE_GAMEPLAYER_BILLING' }, '*');
    }
  }, []);

  // Update billing info when config changes
  useEffect(() => {
    if (config.sourceColumn && config.targetLangs && config.targetLangs.length > 0 && rawData.length > 0) {
      const billing = calculateEstimatedCost(rawData, config.sourceColumn, config.targetLangs, config.isProofreadMode || false);
      console.log('[Billing] Updated:', billing);
      setBillingInfo(billing);
    }
  }, [config.sourceColumn, config.targetLangs?.length, config.isProofreadMode, rawData.length, appState]);

  // Also update billing when entering specific states
  useEffect(() => {
    if ((appState === AppState.GLOSSARY || appState === AppState.PROCESSING) &&
        config.sourceColumn && config.targetLangs && rawData.length > 0) {
      const billing = calculateEstimatedCost(rawData, config.sourceColumn, config.targetLangs, config.isProofreadMode || false);
      console.log('[Billing] State change update:', billing);
      setBillingInfo(billing);
    }
  }, [appState]);

  // Load translation history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('universalloc_history');
    if (saved) {
      try {
        setTranslationHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Handle billing updates from StepConfig
  const handleConfigBillingUpdate = (data: { totalWords: number; cost: number; targetLangs: string[]; sourceColumn: string; canStart: boolean }) => {
    console.log('[App] Config billing update:', data);
    setBillingInfo({ totalWords: data.totalWords, cost: data.cost, perLangWords: data.totalWords });
    setCanStartConfig(data.canStart);
    // Also update config with latest targetLangs and sourceColumn
    setConfig(prev => ({
      ...prev,
      targetLangs: data.targetLangs,
      sourceColumn: data.sourceColumn
    }));
  };

  // Handle payment checkout
  const handleCheckout = async () => {
    if (!rawFile || billingInfo.cost <= 0) return;

    setIsPaymentProcessing(true);

    try {
      // Get user ID from URL params or window globals (same as geminiService)
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId') ||
        (window as any).currentUser?.id ||
        (window as any).GameZoe?.currentUser?.id ||
        (window.parent !== window && (window.parent as any).currentUser?.id);

      if (!userId) {
        alert('請先登入 GameZoe 平台');
        setIsPaymentProcessing(false);
        return;
      }

      // Call service-order API
      const response = await fetch('/api/payment/service-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          amountUSD: billingInfo.cost,
          serviceType: 'universalloc',
          serviceData: {
            game_id: 'universalloc',
            fileName: rawFile.name,
            charCount: billingInfo.totalWords,
            targetLangs: config.targetLangs,
            isProofread: config.isProofreadMode
          },
          productName: `UniversalLoc 翻譯: ${rawFile.name}`,
          returnUrl: window.location.href
        })
      });

      const data = await response.json();
      if (data.success) {
        // Save pending record
        const record: TranslationRecord = {
          id: data.serviceOrderId,
          date: new Date().toISOString(),
          fileName: rawFile.name,
          charCount: billingInfo.totalWords,
          costUSD: billingInfo.cost,
          status: 'pending'
        };
        const newHistory = [record, ...translationHistory];
        setTranslationHistory(newHistory);
        localStorage.setItem('universalloc_history', JSON.stringify(newHistory));

        // Create form and redirect to P99
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.apiUrl;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = data.formData;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      } else {
        alert('建立訂單失敗: ' + (data.error || '未知錯誤'));
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('付款系統錯誤，請稍後再試');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Check for payment success from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const serviceOrderId = urlParams.get('serviceOrderId');

    if (success === 'true' && serviceOrderId) {
      // Mark order as paid and unlock premium
      setTranslationHistory(prev => {
        const updated = prev.map(r =>
          r.id === serviceOrderId ? { ...r, status: 'paid' as const } : r
        );
        localStorage.setItem('universalloc_history', JSON.stringify(updated));
        return updated;
      });
      setConfig(prev => ({ ...prev, isPremiumUnlocked: true }));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleFileLoaded = (file: File, data: any, mode: 'translate' | 'clean' | 'proofread') => {
    setTranslationItems([]);
    setConfig({ isProofreadMode: mode === 'proofread', isPremiumUnlocked: false });
    setRawFile(file);
    if (mode === 'clean') {
      const flatRows = Array.isArray(data) ? data : data[0]?.rows || [];
      setRawData(flatRows);
      setAppState(AppState.CLEANER);
    } else {
      if (Array.isArray(data) && data.length > 0 && 'sheetName' in data[0]) {
        setAllSheetsData(data);
        if (data.length === 1) selectSheet(data[0].sheetName, data, mode === 'proofread');
        else setAppState(AppState.SHEET_SELECT);
      } else {
        setRawData(data);
        setColumns(getColumnNames(data));
        setAppState(AppState.CONFIG);
      }
    }
  };

  const selectSheet = (sheetName: string, dataOverride?: WorksheetData[], isProofread?: boolean) => {
    const targetSheets = dataOverride || allSheetsData;
    const selected = targetSheets.find(s => s.sheetName === sheetName);
    if (selected) {
      setRawData(selected.rows);
      setColumns(getColumnNames(selected.rows));
      setConfig(prev => ({ ...prev, selectedSheetName: sheetName, isProofreadMode: isProofread ?? prev.isProofreadMode }));
      setAppState(AppState.CONFIG);
    }
  };

  const handleConfigComplete = (partialConfig: Partial<TranslationConfig>) => {
    setConfig(prev => ({ ...prev, ...partialConfig }));
    setAppState(AppState.GLOSSARY);
  };

  const handleStartProcess = (confirmedGlossary: GlossaryTerm[]) => {
    setGlossary(confirmedGlossary);
    if (!config.keyColumn || !config.sourceColumn) return;
    // Fix: Explicitly cast the status value to TranslationItem['status'] to resolve the type mismatch in the map return type.
    const items: TranslationItem[] = rawData.map(row => {
      const id = String(row[config.keyColumn!]);
      const original = String(row[config.sourceColumn!] || "");
      const translations: Record<string, string> = {};
      const rowData = row as any; // Cast to any to allow dynamic index access
      if (config.targetCols) {
        Object.entries(config.targetCols).forEach(([langCode, colName]) => {
          const colKey = String(colName); // Ensure it's a string for indexing
          if (colKey && rowData[colKey]) {
            translations[langCode] = String(rowData[colKey]);
          }
        });
      }

      // Calculate Max Length for LQA
      let maxLen: number | undefined = undefined;
      const rowAny = row as any;
      if (config.lengthReferenceColumn && rowAny[config.lengthReferenceColumn]) {
        const refText = String(rowAny[config.lengthReferenceColumn]);
        maxLen = refText.length > 0 ? refText.length + 2 : undefined; // Add +2 buffer
      }

      return {
        id,
        original,
        translations,
        maxLen,
        isOverLimit: {},
        status: 'pending' as TranslationItem['status']
      };
    }).filter(item => item.id && item.id.trim() !== "");
    setTranslationItems(items);
    setAppState(AppState.PROCESSING);
  };

  const handleReset = () => { setAppState(AppState.UPLOAD); setRawFile(null); setRawData([]); setAllSheetsData([]); setTranslationItems([]); setConfig({ isPremiumUnlocked: false }); };

  const i18n = {
    'zh-TW': { upload: '上傳中心', config: '配置', glossary: '術語', processing: '執行', billing: '帳單', settings: '權限', lang: '介面語系' },
    'en-US': { upload: 'Upload', config: 'Setup', glossary: 'Glossary', processing: 'Live', billing: 'Budget', settings: 'Security', lang: 'UI Language' }
  };

  const t = i18n[uiLang as keyof typeof i18n] || i18n['en-US'];

  const navItems = [
    { id: 'UPLOAD', icon: 'fa-rocket', label: t.upload },
    { id: 'CONFIG', icon: 'fa-sliders', label: t.config, disabled: appState === AppState.UPLOAD },
    { id: 'GLOSSARY', icon: 'fa-book-bookmark', label: t.glossary, disabled: appState !== AppState.GLOSSARY && appState !== AppState.PROCESSING },
    { id: 'PROCESSING', icon: 'fa-bolt', label: t.processing, disabled: appState !== AppState.PROCESSING },
  ];

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text font-sans flex flex-col lg:flex-row overflow-hidden">

      {/* Sidebar (Desktop) / Nav Bar (Mobile) */}
      <aside className="w-full lg:w-72 bg-gaming-card border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col z-[100] shrink-0">
        {/* Logo - 手機端縮小，電腦端放大 */}
        <div className="p-6 lg:p-6 border-b border-white/5 flex items-center justify-between lg:block">
          <div className="flex items-center gap-4 lg:gap-4">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gaming-accent rounded-2xl flex items-center justify-center font-black text-white shadow-xl text-xl lg:text-2xl">UL</div>
            <div className="leading-tight">
              <h1 className="font-black text-2xl lg:text-2xl tracking-tighter">Universal<span className="text-gaming-accent">Loc</span></h1>
              <p className="hidden lg:block text-xs font-black text-gaming-muted uppercase tracking-[0.2em] mt-1">Localization</p>
            </div>
          </div>
          {/* 語系切換在手機端移到頂部右側 */}
          <div className="lg:hidden">
            <select value={uiLang} onChange={(e) => setUiLang(e.target.value as UILang)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white outline-none">
              <option value="zh-TW">繁</option>
              <option value="en-US">EN</option>
            </select>
          </div>
        </div>

        {/* 當前模式指示器 */}
        <div className="px-6 py-4 hidden lg:block">
          {(() => {
            let label = '等待任務啟動';
            let subLabel = 'WAITING';
            let colorClass = 'border-white/10 bg-white/5 text-gaming-muted';
            let icon = 'fa-pause';

            if (appState === AppState.CLEANER) {
              label = '智能數據掃除';
              subLabel = 'DATA CLEANER';
              colorClass = 'border-rose-500/50 bg-rose-500/10 text-rose-500';
              icon = 'fa-broom';
            } else if (appState !== AppState.UPLOAD) {
              if (config.isProofreadMode) {
                label = 'LQA 品質校對';
                subLabel = 'QUALITY CHECK';
                colorClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500';
                icon = 'fa-clipboard-check';
              } else {
                label = '專家轉譯引擎';
                subLabel = 'EXPERT MODE';
                colorClass = 'border-gaming-accent/50 bg-gaming-accent/10 text-gaming-accent';
                icon = 'fa-language';
              }
            }

            return (
              <div className={`rounded-xl border ${colorClass} p-4 flex items-center gap-4 transition-all relative overflow-hidden group`}>
                <div className={`absolute -right-2 -bottom-2 p-2 opacity-10 text-6xl rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                  <i className={`fas ${icon}`}></i>
                </div>
                <div className={`w-10 h-10 rounded-full border border-current flex items-center justify-center text-lg shrink-0 z-10 bg-black/20 shadow-lg`}>
                  <i className={`fas ${icon}`}></i>
                </div>
                <div className="z-10">
                  <p className="text-[9px] font-black opacity-80 uppercase tracking-widest mb-0.5">{subLabel}</p>
                  <h3 className="text-sm font-black tracking-wide whitespace-nowrap">{label}</h3>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 選單 - 手機端改為橫向滾動或平鋪，電腦端為縱向列表 */}
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible px-4 py-3 lg:px-6 lg:py-6 space-x-2 lg:space-x-0 lg:space-y-4 lg:flex-1 no-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'UPLOAD' && handleReset()}
              disabled={item.disabled}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 lg:gap-4 px-4 lg:px-6 py-4 lg:py-5 rounded-xl lg:rounded-[1rem] transition-all whitespace-nowrap ${(appState === item.id) ? 'bg-gaming-accent text-white shadow-lg lg:scale-[1.02]' : 'text-gaming-muted hover:text-white hover:bg-white/5'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              <i className={`fas ${item.icon} text-lg lg:text-xl w-6 lg:w-8`}></i>
              <span className="font-black text-sm lg:text-base uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* 語系切換 (Desktop Only) */}
        <div className="hidden lg:block px-6 mb-6">
          <select value={uiLang} onChange={(e) => setUiLang(e.target.value as UILang)} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white outline-none focus:border-gaming-accent transition-all appearance-none cursor-pointer">
            <option value="zh-TW">繁體中文</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>

        {/* 額度顯示 (Responsive) */}
        <div className="p-4 lg:p-6 border-t border-white/10 bg-black/40">
          <div className="flex lg:flex-col justify-between items-center lg:items-stretch">
            <div className="flex flex-col lg:flex-row lg:justify-between text-xs lg:text-sm font-black uppercase mb-2 lg:mb-4 tracking-widest">
              <span className="text-white/40">Trial Quota</span>
              <span className="text-gaming-accent lg:text-base">{sessionUsage} <span className="text-white/20">/</span> {FREE_SESSION_QUOTA}</span>
            </div>
            <div className="w-32 lg:w-full h-2 lg:h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gaming-accent shadow-glow transition-all duration-1000" style={{ width: `${Math.min((sessionUsage / FREE_SESSION_QUOTA) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative bg-gaming-dark overflow-y-auto lg:overflow-hidden pb-20">
        {appState === AppState.UPLOAD && <StepUpload onFileLoaded={handleFileLoaded} uiLang={uiLang} />}
        {appState === AppState.CLEANER && <StepCleaner rawData={rawData} rawFile={rawFile} onBack={handleReset} />}
        {appState === AppState.SHEET_SELECT && <StepSheetSelect sheets={allSheetsData} onSelect={(name) => selectSheet(name)} onBack={handleReset} />}
        {appState === AppState.CONFIG && <div className="h-full"><StepConfig ref={stepConfigRef} rawData={rawData} columns={columns} onConfigComplete={handleConfigComplete} onBack={handleReset} sheetName={config.selectedSheetName} isProofreadMode={config.isProofreadMode} uiLang={uiLang} onBillingUpdate={handleConfigBillingUpdate} /></div>}
        {appState === AppState.GLOSSARY && <StepGlossary config={config} allTexts={rawData.map(row => row[config.sourceColumn!] || "")} onStartTranslation={handleStartProcess} onBack={() => setAppState(AppState.CONFIG)} uiLang={uiLang} isPremiumUnlocked={config.isPremiumUnlocked} />}
        {appState === AppState.PROCESSING && <StepProcess items={translationItems} config={config as TranslationConfig} onReset={handleReset} rawFile={rawFile} onUnlockPremium={() => setConfig(p => ({ ...p, isPremiumUnlocked: true }))} />}
      </main>

      {/* Fixed Bottom Billing Bar */}
      {appState !== AppState.UPLOAD && appState !== AppState.CLEANER && appState !== AppState.SHEET_SELECT && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-gaming-card/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-2xl">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 gap-4">
            {/* Left: Stats */}
            <div className="flex items-center gap-4 lg:gap-8">
              {/* Trial Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <i className="fas fa-flask text-amber-400 text-xs"></i>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                  Trial {sessionUsage}/{FREE_SESSION_QUOTA}
                </span>
              </div>

              {/* Word Count */}
              <div className="flex flex-col">
                <span className="text-[10px] text-gaming-muted font-black uppercase tracking-widest">總字數</span>
                <span className="text-lg lg:text-xl font-black text-white">{billingInfo.totalWords.toLocaleString()}</span>
              </div>

              {/* Estimated Cost */}
              <div className="flex flex-col">
                <span className="text-[10px] text-gaming-muted font-black uppercase tracking-widest">預估成本</span>
                <span className="text-lg lg:text-xl font-black text-gaming-accent">${billingInfo.cost.toFixed(2)}</span>
              </div>

              {/* Status Indicator */}
              {config.isPremiumUnlocked && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg animate-pulse">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span className="text-xs font-black text-green-400">已付款解鎖</span>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* History Button */}
              <button
                onClick={() => setShowHistory(true)}
                className="w-10 h-10 lg:w-auto lg:px-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gaming-muted hover:text-white transition-all"
              >
                <i className="fas fa-history"></i>
                <span className="hidden lg:inline text-xs font-black uppercase">紀錄</span>
              </button>

              {/* CONFIG state: Start Engine Button */}
              {appState === AppState.CONFIG && (
                <button
                  onClick={() => stepConfigRef.current?.triggerStart()}
                  disabled={!canStartConfig}
                  className="flex items-center gap-2 bg-gradient-to-r from-gaming-accent to-purple-600 hover:from-purple-500 hover:to-gaming-accent text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl font-black text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>啟動引擎</span>
                  <i className="fas fa-rocket ml-1"></i>
                </button>
              )}

              {/* GLOSSARY/PROCESSING state: Checkout Button */}
              {appState !== AppState.CONFIG && !config.isPremiumUnlocked && billingInfo.cost > 0 && (
                <button
                  onClick={handleCheckout}
                  disabled={isPaymentProcessing}
                  className="flex items-center gap-2 bg-gradient-to-r from-gaming-accent to-purple-600 hover:from-gaming-accent hover:to-purple-500 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black text-sm shadow-xl hover:shadow-gaming-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaymentProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span className="hidden sm:inline">處理中...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card"></i>
                      <span>結帳付款</span>
                      <span className="hidden sm:inline text-purple-200">${billingInfo.cost.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mode & File Info Bar */}
          <div className="flex items-center gap-4 px-4 lg:px-8 py-2 bg-black/40 border-t border-white/5 text-xs flex-wrap">
            <span className={`px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${config.isProofreadMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gaming-accent/20 text-gaming-accent'}`}>
              {config.isProofreadMode ? 'LQA 校對' : '翻譯模式'}
            </span>
            {rawFile && (
              <span className="text-gaming-muted truncate max-w-[200px]">
                <i className="fas fa-file-excel text-green-400 mr-1"></i>
                {rawFile.name}
              </span>
            )}
            {config.targetLangs && config.targetLangs.length > 0 && (
              <span className="text-gaming-muted">
                <i className="fas fa-language mr-1"></i>
                {config.targetLangs.length} 語言
              </span>
            )}
            {config.isProofreadMode && (
              <span className="hidden lg:inline text-emerald-400/80">
                <i className="fas fa-check-double mr-1"></i>
                雙重對照協議：同時分析 [語意參考源] 與 [待校稿目標]
              </span>
            )}
          </div>
        </div>
      )}

      {/* Translation History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gaming-card border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <i className="fas fa-history text-gaming-accent"></i>
                翻譯消費紀錄
              </h2>
              <button onClick={() => setShowHistory(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-gaming-muted hover:text-white transition-all">
                <i className="fas fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {translationHistory.length === 0 ? (
                <div className="p-8 text-center text-gaming-muted">
                  <i className="fas fa-inbox text-4xl mb-4 opacity-30"></i>
                  <p>尚無翻譯紀錄</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-black/40 sticky top-0">
                    <tr className="text-left text-gaming-muted font-black uppercase tracking-wider text-xs">
                      <th className="p-4">日期</th>
                      <th className="p-4">檔案</th>
                      <th className="p-4 text-right">字數</th>
                      <th className="p-4 text-right">費用</th>
                      <th className="p-4 text-center">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {translationHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-gaming-muted whitespace-nowrap">
                          {new Date(record.date).toLocaleDateString('zh-TW')}
                        </td>
                        <td className="p-4 text-white truncate max-w-[200px]">{record.fileName}</td>
                        <td className="p-4 text-right text-white font-mono">{record.charCount.toLocaleString()}</td>
                        <td className="p-4 text-right text-gaming-accent font-bold">${record.costUSD.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          {record.status === 'pending' && (
                            <span className="px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold">待付款</span>
                          )}
                          {record.status === 'paid' && (
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold">已付款</span>
                          )}
                          {record.status === 'completed' && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold">完成</span>
                              {record.downloadUrl && (
                                <a href={record.downloadUrl} className="text-gaming-accent hover:text-white">
                                  <i className="fas fa-download"></i>
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-glow { box-shadow: 0 0 15px rgba(139,92,246,0.6); }
      `}</style>
    </div>
  );
};

export default App;

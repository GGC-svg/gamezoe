
import React, { useState, useEffect } from 'react';
import { AppState, ExcelRow, TranslationConfig, TranslationItem, GlossaryTerm, WorksheetData, UILang } from './types';
import { StepUpload } from './components/StepUpload';
import { StepConfig } from './components/StepConfig';
import { StepProcess } from './components/StepProcess';
import { StepGlossary } from './components/StepGlossary';
import { StepCleaner } from './components/StepCleaner';
import { StepSheetSelect } from './components/StepSheetSelect';
import { getColumnNames } from './services/excelService';
import { getSessionUsage, FREE_SESSION_QUOTA } from './services/billingService';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionUsage(getSessionUsage());
    }, 2000);
    return () => clearInterval(interval);
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
          if (colName && rowData[colName]) {
            translations[langCode] = String(rowData[colName]);
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
      <main className="flex-1 relative bg-gaming-dark overflow-y-auto lg:overflow-hidden">
        {appState === AppState.UPLOAD && <StepUpload onFileLoaded={handleFileLoaded} uiLang={uiLang} />}
        {appState === AppState.CLEANER && <StepCleaner rawData={rawData} rawFile={rawFile} onBack={handleReset} />}
        {appState === AppState.SHEET_SELECT && <StepSheetSelect sheets={allSheetsData} onSelect={(name) => selectSheet(name)} onBack={handleReset} />}
        {appState === AppState.CONFIG && <div className="h-full"><StepConfig rawData={rawData} columns={columns} onConfigComplete={handleConfigComplete} onBack={handleReset} sheetName={config.selectedSheetName} isProofreadMode={config.isProofreadMode} uiLang={uiLang} /></div>}
        {appState === AppState.GLOSSARY && <StepGlossary config={config} allTexts={rawData.map(row => row[config.sourceColumn!] || "")} onStartTranslation={handleStartProcess} onBack={() => setAppState(AppState.CONFIG)} uiLang={uiLang} />}
        {appState === AppState.PROCESSING && <StepProcess items={translationItems} config={config as TranslationConfig} onReset={handleReset} rawFile={rawFile} onUnlockPremium={() => setConfig(p => ({ ...p, isPremiumUnlocked: true }))} />}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-glow { box-shadow: 0 0 15px rgba(139,92,246,0.6); }
      `}</style>
    </div>
  );
};

export default App;


import React, { useState } from 'react';
import { AppState, ExcelRow, TranslationConfig, TranslationItem, GlossaryTerm, WorksheetData } from './types';
import { StepUpload } from './components/StepUpload';
import { StepConfig } from './components/StepConfig';
import { StepProcess } from './components/StepProcess';
import { StepGlossary } from './components/StepGlossary';
import { StepCleaner } from './components/StepCleaner';
import { StepSheetSelect } from './components/StepSheetSelect';
import { getColumnNames } from './services/excelService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [allSheetsData, setAllSheetsData] = useState<WorksheetData[]>([]);
  const [rawData, setRawData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [translationItems, setTranslationItems] = useState<TranslationItem[]>([]);
  const [config, setConfig] = useState<Partial<TranslationConfig>>({});
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);

  const handleFileLoaded = (file: File, data: any, mode: 'translate' | 'clean' | 'proofread') => {
    setTranslationItems([]);
    setConfig({ isProofreadMode: mode === 'proofread' });
    setGlossary([]);
    setRawFile(file);
    
    if (mode === 'clean') {
        const flatRows = Array.isArray(data) ? data : data[0]?.rows || [];
        setRawData(flatRows);
        setAppState(AppState.CLEANER);
    } else {
        if (Array.isArray(data) && data.length > 0 && 'sheetName' in data[0]) {
           setAllSheetsData(data);
           if (data.length === 1) {
              selectSheet(data[0].sheetName, data, mode === 'proofread');
           } else {
              setAppState(AppState.SHEET_SELECT);
           }
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

    const items: TranslationItem[] = rawData.map(row => {
      const id = String(row[config.keyColumn!]);
      const original = row[config.sourceColumn!] !== undefined && row[config.sourceColumn!] !== null 
        ? String(row[config.sourceColumn!]) 
        : "";
      const context = config.contextColumn && row[config.contextColumn] 
        ? String(row[config.contextColumn]) 
        : undefined;

      const existingTranslations: Record<string, string> = {};
      if (config.columnMapping) {
        config.targetLangs?.forEach(langCode => {
          const mappedCol = config.columnMapping![langCode];
          if (mappedCol && row[mappedCol] !== undefined) {
            existingTranslations[langCode] = String(row[mappedCol]);
          }
        });
      }

      return {
        id,
        original,
        context,
        translations: existingTranslations,
        status: 'pending'
      };
    }).filter(item => item.id && item.id.trim() !== "");

    setTranslationItems(items);
    setConfig(prev => ({ ...prev, glossary: confirmedGlossary }));
    setAppState(AppState.PROCESSING);
  };

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setRawFile(null);
    setRawData([]);
    setAllSheetsData([]);
    setTranslationItems([]);
    setConfig({});
    setGlossary([]);
  };

  return (
    <div className="min-h-screen bg-gaming-dark text-gaming-text font-sans flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gaming-accent via-blue-500 to-gaming-accent opacity-50"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gaming-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-1 relative z-10 w-full flex flex-col overflow-y-auto custom-scrollbar">
        {/* 只在非配置/處理模式下顯示這個簡單 Header */}
        {(appState === AppState.UPLOAD || appState === AppState.CLEANER) && (
          <header className="px-8 py-4 flex items-center justify-between border-b border-white/5 shrink-0 bg-gaming-dark/80 backdrop-blur-md sticky top-0 z-50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gradient-to-br from-gaming-accent to-blue-600 rounded flex items-center justify-center font-bold text-white">GL</div>
               <h1 className="font-bold text-lg tracking-wide">GameLoc<span className="text-gaming-accent">AI</span></h1>
             </div>
          </header>
        )}

        <div className="flex-1 relative">
          {appState === AppState.UPLOAD && <StepUpload onFileLoaded={handleFileLoaded} />}
          {appState === AppState.CLEANER && (
             <div className="p-8">
                <StepCleaner rawData={rawData} rawFile={rawFile} onBack={handleReset} />
             </div>
          )}
          {appState === AppState.SHEET_SELECT && (
             <StepSheetSelect sheets={allSheetsData} onSelect={(name) => selectSheet(name)} onBack={handleReset} />
          )}
          {appState === AppState.CONFIG && (
            <StepConfig 
              columns={columns} 
              previewData={rawData.slice(0, 5)} 
              sheetName={config.selectedSheetName}
              onNext={handleConfigComplete} 
              onBack={() => allSheetsData.length > 1 ? setAppState(AppState.SHEET_SELECT) : setAppState(AppState.UPLOAD)} 
              isProofreadMode={config.isProofreadMode}
            />
          )}
          {appState === AppState.GLOSSARY && (
             <div className="w-full">
                <StepGlossary 
                  config={config} 
                  allTexts={rawData.map(row => row[config.sourceColumn!] || "")}
                  onStartTranslation={handleStartProcess} 
                  onBack={() => setAppState(AppState.CONFIG)} 
                />
             </div>
          )}
          {appState === AppState.PROCESSING && config.keyColumn && (
            <div className="h-[calc(100vh-64px)] overflow-hidden">
              <StepProcess items={translationItems} config={config as TranslationConfig} onReset={handleReset} rawFile={rawFile} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

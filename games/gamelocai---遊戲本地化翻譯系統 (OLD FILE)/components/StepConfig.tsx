
import React, { useState, useEffect } from 'react';
import { ExcelRow, TranslationConfig, SUPPORTED_LANGUAGES } from '../types';

interface StepConfigProps {
  columns: string[];
  previewData: ExcelRow[];
  onNext: (config: Partial<TranslationConfig>) => void;
  onBack: () => void;
  isProofreadMode?: boolean;
  sheetName?: string;
}

export const StepConfig: React.FC<StepConfigProps> = ({ columns, previewData, onNext, onBack, isProofreadMode, sheetName }) => {
  const [keyColumn, setKeyColumn] = useState(columns[0] || '');
  const [sourceColumn, setSourceColumn] = useState(columns[1] || '');
  const [contextColumn, setContextColumn] = useState('');
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLangs, setTargetLangs] = useState<string[]>([]);
  const [gameContext, setGameContext] = useState('');
  const [styleRules, setStyleRules] = useState('');
  const [proofreadContext, setProofreadContext] = useState('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (columns.length > 2 && targetLangs.length > 0) {
      const autoMapping = { ...columnMapping };
      let changed = false;
      targetLangs.forEach(lang => {
        if (!autoMapping[lang]) {
          const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang);
          const langName = langObj?.name || "";
          const langShort = lang.split('-')[0].toLowerCase();
          
          const found = columns.find(c => 
            c.includes(langName) || 
            c.toLowerCase() === langShort || 
            c.toLowerCase().includes(`_${langShort}`) ||
            c.toLowerCase().includes(`${langShort}_`)
          );
          
          if (found && found !== keyColumn && found !== sourceColumn) {
            autoMapping[lang] = found;
            changed = true;
          }
        }
      });
      if (changed) setColumnMapping(autoMapping);
    }
  }, [targetLangs, columns, keyColumn, sourceColumn]);

  const toggleTargetLang = (code: string) => {
    setTargetLangs(prev => {
      const isSelected = prev.includes(code);
      if (isSelected) {
        const newLangs = prev.filter(c => c !== code);
        const newMapping = { ...columnMapping };
        delete newMapping[code];
        setColumnMapping(newMapping);
        return newLangs;
      } else {
        return [...prev, code];
      }
    });
  };

  const handleColumnMappingChange = (langCode: string, colName: string) => {
    setColumnMapping(prev => ({ ...prev, [langCode]: colName }));
  };

  const handleNext = () => {
    if (!keyColumn || !sourceColumn || targetLangs.length === 0) {
      alert("請完成以下設定：\n1. 指定 ID 與 原文欄位\n2. 選取至少一個語系");
      return;
    }
    
    if (isProofreadMode) {
      const missingMapping = targetLangs.some(lang => !columnMapping[lang]);
      if (missingMapping) {
        alert("校稿模式下，請選取對應的「待校正譯文欄位」。");
        return;
      }
    }

    onNext({
      keyColumn, sourceColumn, contextColumn, sourceLang,
      targetLangs, gameContext, styleRules, proofreadContext, columnMapping,
      batchSize: 40 // 提升至 40 筆，大幅提速
    });
  };

  const displayCols = [
    { key: keyColumn, label: keyColumn || "ID", color: "text-gaming-accent" },
    { key: sourceColumn, label: sourceColumn || "ORIGINAL", color: "text-blue-400" },
    ...targetLangs.filter(l => columnMapping[l]).map(langCode => ({
      key: columnMapping[langCode],
      label: `${SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name} (${isProofreadMode ? '待校稿' : '存放欄位'})`,
      color: isProofreadMode ? "text-amber-400" : "text-gaming-success"
    }))
  ];

  return (
    <div className="w-full bg-gaming-dark min-h-screen">
      <div className="sticky top-0 z-50 bg-gaming-dark/95 backdrop-blur-xl border-b border-white/10 px-12 py-10 flex items-center justify-between">
         <button onClick={onBack} className="text-gaming-muted hover:text-white transition-all bg-white/5 px-10 py-5 rounded-[2rem] flex items-center text-2xl font-black border border-white/10">
            <i className="fas fa-arrow-left mr-4"></i> 返回
         </button>
         <div className="text-right">
            <h2 className="text-5xl font-black text-white tracking-tighter flex items-center justify-end gap-6">
               {sheetName && <span className="text-2xl bg-gaming-accent/20 text-gaming-accent px-6 py-2 rounded-full border border-gaming-accent/30 font-mono font-bold tracking-widest">{sheetName}</span>}
               {isProofreadMode ? "在地化校稿配置" : "翻譯專案配置"}
            </h2>
            <p className="text-xl text-gaming-accent font-mono uppercase tracking-[0.4em] mt-3 font-bold">Project Quality Assurance</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 py-20 space-y-32 pb-96">
        <section className="bg-gaming-card p-16 rounded-[4rem] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-8 mb-16">
            <div className="w-20 h-20 rounded-[2rem] bg-gaming-accent/20 flex items-center justify-center text-gaming-accent text-4xl shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <i className="fas fa-database"></i>
            </div>
            <h3 className="text-4xl font-black text-white">1. 核心數據對照</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <label className="text-2xl text-gray-400 font-black uppercase tracking-widest block">ID 唯一索引 (Key)</label>
              <select className="w-full bg-gaming-dark border-2 border-white/10 rounded-[2.5rem] p-8 text-3xl text-white font-bold focus:border-gaming-accent outline-none appearance-none" value={keyColumn} onChange={(e) => setKeyColumn(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-8">
              <label className="text-2xl text-blue-400 font-black uppercase tracking-widest block">原始原文 (Source)</label>
              <select className="w-full bg-gaming-dark border-2 border-blue-500/30 rounded-[2.5rem] p-8 text-3xl text-blue-50 font-bold focus:border-blue-500 outline-none appearance-none" value={sourceColumn} onChange={(e) => setSourceColumn(e.target.value)}>
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-gaming-card p-16 rounded-[4rem] border border-white/10 shadow-xl">
          <div className="flex items-center gap-8 mb-16">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-500/20 flex items-center justify-center text-blue-400 text-4xl">
              <i className="fas fa-globe"></i>
            </div>
            <h3 className="text-4xl font-black text-white">2. 選取目標語系</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SUPPORTED_LANGUAGES.filter(l => l.code !== sourceLang).map(l => {
              const isSelected = targetLangs.includes(l.code);
              return (
                <button key={l.code} onClick={() => toggleTargetLang(l.code)} className={`p-10 rounded-[2.5rem] border-4 text-2xl font-black transition-all flex items-center justify-between text-left ${isSelected ? 'border-gaming-accent bg-gaming-accent/20 text-white' : 'border-white/5 bg-gaming-dark text-gaming-muted hover:border-white/20'}`}>
                  {l.name}
                  {isSelected && <i className="fas fa-check-circle text-gaming-accent text-3xl"></i>}
                </button>
              );
            })}
          </div>
        </section>

        <section className={`p-16 rounded-[4rem] border-4 transition-all duration-500 ${targetLangs.length > 0 ? 'bg-gaming-dark/40 border-gaming-accent/40 shadow-[0_0_80px_rgba(139,92,246,0.2)]' : 'bg-gaming-card border-white/5 opacity-50'}`}>
          <div className="flex items-center gap-8 mb-16">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-4xl transition-colors ${targetLangs.length > 0 ? 'bg-gaming-accent' : 'bg-gray-700'}`}>
              <i className="fas fa-list-check"></i>
            </div>
            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">3. 設置各語系對應欄位</h3>
          </div>
          {targetLangs.length > 0 && (
            <div className="space-y-10">
              {targetLangs.map(langCode => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
                return (
                  <div key={langCode} className="bg-gaming-card p-12 rounded-[3rem] border-2 border-white/10 flex flex-col lg:flex-row lg:items-center gap-12 group hover:border-gaming-accent/50 transition-colors">
                    <div className="lg:w-80 shrink-0 flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-6 transition-all ${columnMapping[langCode] ? 'bg-gaming-success' : 'bg-gray-700'}`}></div>
                      <span className="text-3xl font-black text-white">{lang?.name}</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <select 
                        className={`w-full bg-gaming-dark border-2 rounded-[2rem] p-7 text-3xl font-black outline-none transition-all ${columnMapping[langCode] ? 'border-gaming-success text-gaming-success' : 'border-white/10 text-gray-500 focus:border-gaming-accent'}`} 
                        value={columnMapping[langCode] || ""} 
                        onChange={(e) => handleColumnMappingChange(langCode, e.target.value)}
                      >
                        <option value="">-- {isProofreadMode ? "請選擇欄位" : "自動產生新欄位"} --</option>
                        {columns.filter(c => c !== keyColumn && c !== sourceColumn).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-gaming-card p-16 rounded-[4rem] border border-white/10">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-500/20 flex items-center justify-center text-amber-400 text-4xl">
              <i className="fas fa-comment-dots"></i>
            </div>
            <h3 className="text-4xl font-black text-white">4. 遊戲世界觀與風格指引</h3>
          </div>
          <textarea 
            className="w-full h-[28rem] bg-gaming-dark border-2 border-white/10 rounded-[3rem] p-12 text-3xl text-white font-bold outline-none focus:border-gaming-accent transition-all resize-none shadow-inner leading-relaxed" 
            placeholder={isProofreadMode ? "例如：賽博龐克風格，語氣冰冷科技化..." : "遊戲類型、背景..."} 
            value={isProofreadMode ? proofreadContext : gameContext} 
            onChange={(e) => isProofreadMode ? setProofreadContext(e.target.value) : setGameContext(e.target.value)}
          ></textarea>
        </section>

        <section className="bg-gaming-card/30 p-16 rounded-[4rem] border border-white/5">
           <div className="overflow-x-auto border-2 border-white/10 rounded-[3rem] shadow-2xl bg-black/40 custom-scrollbar">
              <table className="w-full text-2xl border-collapse min-w-[1200px]">
                <thead className="bg-black/60">
                  <tr>
                    {displayCols.map(col => (
                      <th key={col.key} className={`text-left p-10 border-b border-white/10 font-black tracking-widest uppercase ${col.color}`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-all">
                      {displayCols.map(col => (
                        <td key={col.key} className={`p-10 border-b border-white/5 font-bold leading-relaxed ${col.color === 'text-gaming-accent' ? 'font-mono' : 'text-gray-100'}`}>
                          {row[col.key] !== undefined ? String(row[col.key]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-16 bg-gradient-to-t from-gaming-dark via-gaming-dark/95 to-transparent z-[200] pointer-events-none flex justify-end items-end">
        <div className="max-w-7xl w-full mx-auto flex justify-end pointer-events-auto">
          <button onClick={handleNext} disabled={targetLangs.length === 0} className={`px-40 py-12 rounded-full font-black text-5xl shadow-[0_40px_100px_rgba(0,0,0,0.9)] transition-all flex items-center group relative overflow-hidden active:scale-90 ${targetLangs.length > 0 ? 'bg-white text-black hover:bg-gaming-accent hover:text-white' : 'bg-gray-800 text-gray-500'}`}>
            <span className="relative z-10 flex items-center">
               下一步：管理術語 <i className="fas fa-arrow-right ml-10 group-hover:translate-x-6 transition-transform"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

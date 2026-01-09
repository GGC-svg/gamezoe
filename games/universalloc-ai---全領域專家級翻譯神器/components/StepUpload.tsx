
import React, { useState } from 'react';
import { parseExcel, parseJson } from '../services/excelService';
import { parseWord } from '../services/wordService';
import { UILang } from '../types';

interface StepUploadProps {
  onFileLoaded: (file: File, data: any, mode: 'translate' | 'clean' | 'proofread') => void;
  uiLang: UILang;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onFileLoaded, uiLang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'translate' | 'clean' | 'proofread'>('translate');

  const content = {
    'zh-TW': {
      tag: "讓全世界讀懂您的創意",
      title: "轉譯中心",
      subtitle: "極速萬字翻譯，價格僅為人工 1/20。上傳 EXCEL/Word 開啟全球部署。",
      modes: {
        translate: {
          title: "專家轉譯",
          benefit: "專家語調 • 語境感知",
          price: "約 $0.8 USD / 每千字",
          tags: ["在地化", "產品描述"],
          icon: "fa-language",
          activeColor: "bg-purple-500 shadow-glow"
        },
        proofread: {
          title: "全面在地化優化",
          benefit: "語意精確 • 風格一致 • 術語對齊",
          price: "深度品質保證 (LQA)",
          tags: ["語法/格式修正", "術語/風格一致性"],
          icon: "fa-shield-cat",
          activeColor: "bg-blue-500 shadow-glow"
        },
        clean: {
          title: "數據掃除",
          benefit: "格式修復 • 去除冗餘",
          price: "全半形自動修復",
          tags: ["空格清理", "符號校正"],
          icon: "fa-wand-magic-sparkles",
          activeColor: "bg-emerald-500 shadow-glow"
        }
      },
      uploadTitle: "點擊或拖放文件",
      uploadHint: "支援 .xlsx, .json, .docx"
    }
  };

  const t = content['zh-TW']; // Simplified for brevity

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      let data: any;
      if (file.name.endsWith('.json')) data = await parseJson(file);
      else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) data = await parseExcel(file);
      else if (file.name.endsWith('.docx')) data = await parseWord(file);
      else throw new Error("Unsupported format.");
      onFileLoaded(file, data, mode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-16 flex flex-col items-center justify-center min-h-full">
      <div className="w-full max-w-7xl space-y-10 md:space-y-20">

        {/* Header - 響應式字體 */}
        <div className="text-center space-y-4 md:space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
            <span className="text-xs md:text-lg font-black text-white/70 uppercase tracking-widest">{t.tag}</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter leading-tight">{t.title}</h1>
          <p className="text-lg md:text-3xl text-gaming-muted font-bold max-w-4xl mx-auto leading-relaxed">{t.subtitle}</p>
        </div>

        {/* 模式切換 - 手機 1 欄 / 平板以上 3 欄 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {(['translate', 'proofread', 'clean'] as const).map(mId => {
            const m = t.modes[mId];
            const isActive = mode === mId;
            return (
              <button
                key={mId}
                onClick={() => setMode(mId)}
                className={`text-left p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-2 transition-all duration-500 flex flex-col ${isActive ? `bg-gaming-card border-gaming-accent scale-[1.02]` : `bg-white/5 border-white/5 opacity-60 hover:opacity-100`
                  }`}
              >
                <div className="flex justify-between items-center mb-6 md:mb-10">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-4xl ${isActive ? m.activeColor : 'bg-white/10 text-white/30'}`}>
                    <i className={`fas ${m.icon}`}></i>
                  </div>
                  {isActive && <span className="bg-gaming-accent text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase">Active</span>}
                </div>

                <h3 className="text-2xl md:text-4xl font-black text-white mb-2">{m.title}</h3>
                <p className="text-sm md:text-xl font-black text-gaming-accent uppercase tracking-widest mb-3">{m.benefit}</p>
                <p className="text-white font-bold text-sm md:text-xl opacity-80">{m.price}</p>

                <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-white/5">
                  {m.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-black/40 text-[10px] md:text-sm font-black text-white/40 rounded-lg">#{tag}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* 上傳區域 - 響應式內距 */}
        <div
          className={`w-full p-12 md:p-24 border-4 border-dashed rounded-[3rem] md:rounded-[5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-gaming-accent bg-gaming-accent/10' : 'border-white/10 bg-gaming-card/40 hover:border-white/20'
            }`}
          onClick={() => document.getElementById('fileInput')?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <input type="file" id="fileInput" accept=".xlsx, .xls, .json, .docx" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
          {isLoading ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 md:w-24 md:h-24 border-4 md:border-8 border-gaming-accent/20 border-t-gaming-accent rounded-full animate-spin mx-auto"></div>
              <p className="text-xl md:text-3xl font-black text-white animate-pulse">Syncing Engine...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-3xl flex items-center justify-center mb-6 md:mb-10 text-white/40 group-hover:text-gaming-accent transition-colors">
                <i className="fas fa-cloud-arrow-up text-4xl md:text-6xl"></i>
              </div>
              <h3 className="text-3xl md:text-6xl font-black text-white mb-4 tracking-tighter text-center">{t.uploadTitle}</h3>
              <p className="text-sm md:text-2xl text-gaming-muted font-bold uppercase tracking-widest text-center">{t.uploadHint}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

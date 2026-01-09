
import React from 'react';
import { WorksheetData } from '../types';

interface StepSheetSelectProps {
  sheets: WorksheetData[];
  onSelect: (sheetName: string) => void;
  onBack: () => void;
}

export const StepSheetSelect: React.FC<StepSheetSelectProps> = ({ sheets, onSelect, onBack }) => {
  return (
    <div className="w-full bg-gaming-dark min-h-screen">
      {/* 頂部導覽列 - 統一風格 */}
      <div className="sticky top-0 z-50 bg-gaming-dark/95 backdrop-blur-xl border-b border-white/10 px-12 py-10 flex items-center justify-between">
         <button onClick={onBack} className="text-gaming-muted hover:text-white transition-all bg-white/5 px-10 py-5 rounded-[2rem] flex items-center text-2xl font-black border border-white/10">
            <i className="fas fa-arrow-left mr-4"></i> 返回上傳
         </button>
         <div className="text-right">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase">
               選擇工作分頁
            </h2>
            <p className="text-xl text-gaming-accent font-mono uppercase tracking-[0.4em] mt-3 font-bold">Multiple Worksheets Detected</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 py-20">
        <div className="bg-gaming-accent/10 p-10 rounded-[3rem] border border-gaming-accent/30 mb-16 flex items-center gap-8">
           <div className="w-16 h-16 rounded-2xl bg-gaming-accent flex items-center justify-center text-white text-3xl shadow-lg shadow-gaming-accent/20">
              <i className="fas fa-info-circle"></i>
           </div>
           <div>
              <p className="text-2xl text-white font-black">偵測到多個數據分頁</p>
              <p className="text-lg text-gaming-muted font-bold mt-1">由於不同分頁可能具有不同結構，請選擇一個分頁作為本次翻譯/校稿的數據源。</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sheets.map((sheet, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(sheet.sheetName)}
              className="group relative bg-gaming-card border border-white/5 hover:border-gaming-accent p-12 rounded-[3rem] text-left transition-all hover:scale-[1.02] shadow-2xl active:scale-95 overflow-hidden"
            >
              {/* 背景裝飾 */}
              <div className="absolute -right-10 -bottom-10 text-9xl text-white/5 font-black transform -rotate-12 transition-transform group-hover:rotate-0">
                {idx + 1}
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-gaming-accent/10 flex items-center justify-center text-gaming-accent text-3xl group-hover:bg-gaming-accent group-hover:text-white transition-all">
                    <i className="fas fa-file-lines"></i>
                 </div>
                 <span className="text-xs bg-black/40 px-4 py-2 rounded-full text-gaming-accent font-black tracking-widest uppercase border border-gaming-accent/20">
                    {sheet.rows.length} Rows
                 </span>
              </div>
              
              <h3 className="text-3xl font-black text-white mb-3 truncate relative z-10">{sheet.sheetName}</h3>
              <p className="text-lg text-gaming-muted font-bold group-hover:text-white transition-colors relative z-10 flex items-center">
                 開始配置此分頁 <i className="fas fa-chevron-right ml-3 text-sm"></i>
              </p>

              {/* 掃描線動畫 */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gaming-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { parseExcel, parseJson } from '../services/excelService';
import { parseWord } from '../services/wordService';

interface StepUploadProps {
  onFileLoaded: (file: File, data: any, mode: 'translate' | 'clean' | 'proofread') => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'translate' | 'clean' | 'proofread'>('translate');

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);
    try {
      let data: any;
      if (file.name.endsWith('.json')) {
        data = await parseJson(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcel(file);
      } else if (file.name.endsWith('.docx')) {
        data = await parseWord(file);
      } else {
        throw new Error("不支援的檔案格式。請上傳 .xlsx, .json 或 .docx 檔案。");
      }
      onFileLoaded(file, data, mode);
    } catch (err: any) {
      setError(err.message || "解析檔案失敗。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in relative">
      <div className="absolute top-8 flex bg-gaming-card/50 p-1 rounded-lg border border-white/10 shadow-2xl">
        <button
          onClick={() => setMode('translate')}
          className={`px-5 py-2 rounded-md font-bold text-xs transition-all ${
            mode === 'translate' ? 'bg-gaming-accent text-white shadow-lg scale-105' : 'text-gaming-muted hover:text-white'
          }`}
        >
          <i className="fas fa-language mr-2"></i> 翻譯
        </button>
        <button
          onClick={() => setMode('proofread')}
          className={`px-5 py-2 rounded-md font-bold text-xs transition-all ${
            mode === 'proofread' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-gaming-muted hover:text-white'
          }`}
        >
          <i className="fas fa-spell-check mr-2"></i> 深度校稿
        </button>
        <button
          onClick={() => setMode('clean')}
          className={`px-5 py-2 rounded-md font-bold text-xs transition-all ${
            mode === 'clean' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-gaming-muted hover:text-white'
          }`}
        >
          <i className="fas fa-wrench mr-2"></i> 格式修復
        </button>
      </div>

      <div className="text-center mb-8 mt-20">
        <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-2 ${
          mode === 'clean' ? 'from-purple-400 to-pink-500' : 
          mode === 'proofread' ? 'from-blue-400 to-cyan-500' :
          'from-gaming-accent to-blue-500'
        }`}>
          {mode === 'clean' ? '格式修復工具' : 
           mode === 'proofread' ? 'AI 深度校稿系統' : 
           '開始遊戲本地化翻譯'}
        </h2>
        <p className="text-gaming-muted max-w-lg mx-auto">
          {mode === 'clean' 
            ? '快速修正全形英數符號與異常空格。' 
            : mode === 'proofread'
            ? '全面優化既有譯文品質：修正語意偏差、統一專有名詞、強化在地化表達並確保格式連貫。'
            : '上傳遊戲文本 (.xlsx, .json, .docx)，利用 Gemini AI 進行專業級翻譯。'}
        </p>
      </div>

      <div
        className={`w-full max-w-2xl p-12 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
          isDragging ? 'border-gaming-accent bg-gaming-accent/10 scale-102' : 'border-gaming-card hover:border-gaming-muted bg-gaming-card/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          type="file"
          id="fileInput"
          accept=".xlsx, .xls, .json, .docx"
          className="hidden"
          onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        {isLoading ? (
          <div className="flex flex-col items-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-gaming-accent mb-4"></i>
            <p className="text-lg">正在分析檔案結構...</p>
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-gaming-dark ${
              mode === 'clean' ? 'bg-purple-500/20' : 
              mode === 'proofread' ? 'bg-blue-500/20' :
              'bg-gaming-card'
            }`}>
              <i className={`fas ${
                mode === 'clean' ? 'fa-magic text-purple-400' : 
                mode === 'proofread' ? 'fa-clipboard-check text-blue-400' :
                'fa-file-excel text-green-500'
              } text-4xl`}></i>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">點擊或拖放檔案</h3>
            <p className="text-sm text-gaming-muted">支援 Excel, JSON 或 Word 格式</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-center">
          <i className="fas fa-exclamation-triangle mr-3"></i>
          {error}
        </div>
      )}
    </div>
  );
};

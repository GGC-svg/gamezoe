
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ExcelRow } from '../types';
import { cleanTextForExport, exportToCSV } from '../services/excelService';

interface StepCleanerProps {
  rawData: ExcelRow[];
  rawFile: File | null;
  onBack: () => void;
}

export const StepCleaner: React.FC<StepCleanerProps> = ({ rawData, rawFile, onBack }) => {
  const [data, setData] = useState<ExcelRow[]>(rawData);
  const [columns, setColumns] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalIssues: 0, fixedCount: 0 });
  const [isFixed, setIsFixed] = useState(false);
  
  useEffect(() => {
    if (rawData.length > 0) {
      setColumns(Object.keys(rawData[0]));
      scanForIssues(rawData);
    }
  }, [rawData]);

  // Scan detection logic (same as cleaning logic but just counting)
  const scanForIssues = (rows: ExcelRow[]) => {
    let issues = 0;
    rows.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key] || "");
        if (val && cleanTextForExport(val) !== val) {
          issues++;
        }
      });
    });
    setStats({ totalIssues: issues, fixedCount: 0 });
  };

  const handleFixAll = () => {
    let count = 0;
    const newData = data.map(row => {
      const newRow: ExcelRow = { ...row };
      Object.keys(newRow).forEach(key => {
        const val = String(newRow[key] || "");
        const cleaned = cleanTextForExport(val);
        if (cleaned !== val) {
          newRow[key] = cleaned;
          count++;
        }
      });
      return newRow;
    });

    setData(newData);
    setIsFixed(true);
    setStats({ totalIssues: 0, fixedCount: count });
  };

  const handleExportExcel = () => {
    const fileName = rawFile?.name.split('.')[0] || "FixedData";
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fixed_Data");
    XLSX.writeFile(workbook, `${fileName}_fixed.xlsx`);
  };

  const handleExportCSV = () => {
      const fileName = rawFile?.name.split('.')[0] || "FixedData";
      exportToCSV(data, fileName);
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="py-6 flex items-center justify-between shrink-0 border-b border-white/5">
        <div>
           <button onClick={onBack} className="text-gaming-muted hover:text-white mb-2 text-sm">
             <i className="fas fa-arrow-left mr-2"></i> 返回首頁
           </button>
           <h2 className="text-2xl font-bold text-white">格式修復工具</h2>
        </div>
        
        <div className="flex gap-4 items-center">
            {isFixed ? (
               <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg flex items-center border border-green-500/30">
                  <i className="fas fa-check-circle mr-2"></i>
                  已修復 {stats.fixedCount} 個儲存格
               </div>
            ) : (
                stats.totalIssues > 0 && (
                    <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center border border-yellow-500/30">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        偵測到 {stats.totalIssues} 個格式問題
                    </div>
                )
            )}

            {!isFixed ? (
                <button
                    onClick={handleFixAll}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-purple-900/20 transition-all"
                >
                    <i className="fas fa-magic mr-2"></i> 一鍵修復
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all"
                    >
                        <i className="fas fa-file-excel mr-2"></i> 匯出 Excel
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all"
                        title="CSV 可使用 Excel 預設字體開啟，解決俄文顯示間距問題"
                    >
                        <i className="fas fa-file-csv mr-2"></i> 匯出 CSV (推薦)
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Grid Preview */}
      <div className="flex-1 overflow-auto bg-gaming-dark relative custom-scrollbar mt-4 border border-white/5 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gaming-card z-10">
            <tr>
              {columns.map(col => (
                <th key={col} className="p-4 font-semibold text-gaming-muted border-b border-white/10 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 200).map((row, idx) => ( // Render limit for performance
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {columns.map(col => {
                    const val = String(row[col] || "");
                    const needsFix = !isFixed && cleanTextForExport(val) !== val;
                    return (
                        <td key={col} className={`p-4 text-sm align-top max-w-[300px] truncate ${needsFix ? 'bg-red-500/10 text-red-200' : 'text-gray-300'}`}>
                            {needsFix && <i className="fas fa-bug text-xs mr-2 opacity-70"></i>}
                            {val}
                        </td>
                    );
                })}
              </tr>
            ))}
            {data.length > 200 && (
                <tr>
                    <td colSpan={columns.length} className="p-4 text-center text-gaming-muted italic">
                        ...僅顯示前 200 筆預覽 (共 {data.length} 筆)...
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="py-4 text-xs text-gaming-muted flex items-start gap-2">
         <i className="fas fa-info-circle mt-0.5 text-gaming-accent"></i>
         <div>
             <p className="mb-1">修復規則：保留全形標點符號 (，。！)，但將所有全形英文/數字轉換為半形，並移除異常空格。</p>
             <p className="mb-1 text-yellow-500/80">注意：格式修復僅針對已有內容的儲存格。若儲存格為空白，系統將保持空白（不執行填充）。若需翻譯空白內容，請使用「翻譯專案」功能。</p>
             <p className="text-gray-400">
                <span className="text-blue-400">提示：</span> 
                如果匯出的 Excel 中俄文看起來仍像全形（間距很寬），請嘗試使用 <strong>CSV 匯出</strong> 格式，以避免 Excel 預設字體顯示問題。
             </p>
         </div>
      </div>
    </div>
  );
};

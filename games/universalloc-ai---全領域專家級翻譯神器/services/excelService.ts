
import * as XLSX from 'xlsx';
import { ExcelRow, TranslationItem, WorksheetData } from '../types';

const NESTING_SEPARATOR = '|';

// 解析 Excel 檔案
export const parseExcel = (file: File): Promise<WorksheetData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const allSheets: WorksheetData[] = workbook.SheetNames.map(name => {
          const worksheet = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: "" });
          return {
            sheetName: name,
            rows: rows
          };
        }).filter(sheet => sheet.rows.length > 0);

        resolve(allSheets);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// 解析 JSON 檔案
export const parseJson = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

// 文本清理，將全形英數轉半形並處理空白
export const cleanTextForExport = (text: string): string => {
  if (typeof text !== 'string' || !text) return text;
  let cleaned = text.replace(/\u3000/g, ' ');
  cleaned = cleaned.replace(/[\uFF01-\uFF5E]/g, (ch) => {
     const code = ch.charCodeAt(0);
     const halfCode = code - 0xFEE0;
     const halfChar = String.fromCharCode(halfCode);
     if (/[a-zA-Z0-9\!\?\(\)\[\]]/.test(halfChar)) return halfChar;
     return ch;
  });
  return cleaned.trim();
};

// 匯出為 Excel 檔案
export const exportToExcel = (items: TranslationItem[], baseFileName: string) => {
  const exportData = items.map((item) => {
    const row: any = {
      ID: item.id,
      Original: item.original,
    };
    Object.keys(item.translations).forEach((langCode) => {
      const translatedValue = cleanTextForExport(item.translations[langCode]);
      row[`Trans_${langCode}`] = translatedValue;
      
      // 如果該語言有超標標記，則增加審核欄位
      if (item.isOverLimit && item.isOverLimit[langCode]) {
        row[`Audit_${langCode}`] = "[LENGTH_OVER]";
      } else if (item.maxLen !== undefined) {
        row[`Audit_${langCode}`] = "OK";
      }
    });
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
  XLSX.writeFile(workbook, `${baseFileName}_localized_audit.xlsx`);
};



// 生成 Excel Blob（用於上傳到伺服器）
export const generateExcelBlob = async (items: TranslationItem[], baseFileName: string): Promise<Blob> => {
  const exportData = items.map((item) => {
    const row: any = {
      ID: item.id,
      Original: item.original,
    };
    Object.keys(item.translations).forEach((langCode) => {
      const translatedValue = cleanTextForExport(item.translations[langCode]);
      row[`Trans_${langCode}`] = translatedValue;
      if (item.isOverLimit && item.isOverLimit[langCode]) {
        row[`Audit_${langCode}`] = "[LENGTH_OVER]";
      } else if (item.maxLen !== undefined) {
        row[`Audit_${langCode}`] = "OK";
      }
    });
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
  const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// 匯出為 CSV 檔案，增加 BOM 以確保 Excel 正確顯示 UTF-8 俄文等字符
export const exportToCSV = (data: ExcelRow[], baseFileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseFileName}_fixed.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 獲取列名
export const getColumnNames = (rows: ExcelRow[]): string[] => {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
};

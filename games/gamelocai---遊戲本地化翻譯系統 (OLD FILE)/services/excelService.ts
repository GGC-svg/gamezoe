
import * as XLSX from 'xlsx';
import { ExcelRow, TranslationItem, WorksheetData } from '../types';

const NESTING_SEPARATOR = '|';

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

const flattenJSON = (obj: any, prefix = '', res: ExcelRow[] = []) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}${NESTING_SEPARATOR}${key}` : key;
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        flattenJSON(val, newKey, res);
      } else {
        res.push({
          Key: newKey,
          Source: String(val)
        });
      }
    }
  }
  return res;
};

const sanitizeJsonString = (jsonString: string): string => {
  let result = '';
  let inString = false;
  let isEscaped = false;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
      } else {
        if (char === '\\') {
          isEscaped = true;
          result += char;
        } else if (char === '"') {
          inString = false;
          result += char;
        } else if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          result += char;
        }
      }
    } else {
      if (char === '"') inString = true;
      result += char;
    }
  }
  return result;
};

/**
 * 安全的文本清洗函數：
 * 1. 只轉換全形英數 -> 半形英數
 * 2. 只轉換全形空格 -> 半形空格
 * 3. 嚴禁刪除任何單字間的空格
 */
export const cleanTextForExport = (text: string): string => {
  if (typeof text !== 'string' || !text) return text;
  
  // 1. 將全形空格 (\u3000) 統一轉為標準半形空格
  let cleaned = text.replace(/\u3000/g, ' ');
  
  // 2. 僅將「全形英文字母與數字」轉換為半形，避免遊戲內排版混亂
  // 不動標點符號，確保本地化風格正確
  cleaned = cleaned.replace(/[\uFF01-\uFF5E]/g, (ch) => {
     const code = ch.charCodeAt(0);
     const halfCode = code - 0xFEE0;
     const halfChar = String.fromCharCode(halfCode);
     // 限制只轉換 0-9, a-z, A-Z 以及必要的符號，避免影響特殊語言字符
     if (/[a-zA-Z0-9\!\?\(\)\[\]]/.test(halfChar)) return halfChar;
     return ch;
  });

  // 3. 移除前後贅餘空格，但保留內容中的所有空格
  return cleaned.trim();
};

export const parseJson = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        text = text.trim();
        if (!text.startsWith('{') && text.includes('"')) text = `{${text}}`;
        text = text.replace(/,(\s*[}\]])/g, '$1');
        let json;
        try {
          json = JSON.parse(text);
        } catch (firstError) {
          try {
             const sanitized = sanitizeJsonString(text);
             json = JSON.parse(sanitized);
          } catch (secondError) {
             throw new Error("JSON 解析失敗");
          }
        }
        const flatData = flattenJSON(json);
        resolve(flatData);
      } catch (error: any) {
        reject(new Error(error.message || "JSON 解析失敗"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

export const exportToExcel = (items: TranslationItem[], baseFileName: string) => {
  const exportData = items.map((item) => {
    const row: any = {
      ID: item.id,
      Original: item.original,
    };
    Object.keys(item.translations).forEach((langCode) => {
      row[`Trans_${langCode}`] = cleanTextForExport(item.translations[langCode]);
    });
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Translations");
  XLSX.writeFile(workbook, `${baseFileName}_localized.xlsx`);
};

export const exportToCSV = (data: ExcelRow[], baseFileName: string) => {
    const cleanedData = data.map(row => {
      const newRow: any = { ...row };
      Object.keys(newRow).forEach(k => {
        newRow[k] = cleanTextForExport(newRow[k]);
      });
      return newRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const bom = "\uFEFF"; 
    const blob = new Blob([bom + csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${baseFileName}_utf8.csv`;
    link.click();
};

export const exportToJson = (items: TranslationItem[], baseFileName: string) => {
  const targetLangs = new Set<string>();
  items.forEach(item => Object.keys(item.translations).forEach(lang => targetLangs.add(lang)));
  targetLangs.forEach(langCode => {
    const rootResult: any = {};
    items.forEach(item => {
      const keys = item.id.split(NESTING_SEPARATOR);
      let currentLevel = rootResult;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          const val = item.translations[langCode] !== undefined ? item.translations[langCode] : item.original;
          currentLevel[key] = cleanTextForExport(val);
        } else {
          if (!currentLevel[key]) currentLevel[key] = {};
          currentLevel = currentLevel[key];
        }
      }
    });
    const blob = new Blob([JSON.stringify(rootResult, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${baseFileName}_${langCode}.json`;
    link.click();
  });
};

export const getColumnNames = (rows: ExcelRow[]): string[] => {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]);
};

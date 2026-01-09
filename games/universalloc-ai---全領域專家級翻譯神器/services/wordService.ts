
import JSZip from 'jszip';
import { ExcelRow, TranslationItem } from '../types';

// We use a simple index-based ID system for Word documents
// because Word XML doesn't inherently have unique stable IDs for every text run.
// Each "row" will look like: { ID: "word_0", Source: "Hello" }

export const parseWord = async (file: File): Promise<ExcelRow[]> => {
  const zip = await JSZip.loadAsync(file);
  const docXml = await zip.file("word/document.xml")?.async("string");
  
  if (!docXml) {
    throw new Error("無效的 Word 檔案 (找不到 document.xml)");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");
  
  // Identify text nodes (<w:t>)
  const textNodes = xmlDoc.getElementsByTagName("w:t");
  const rows: ExcelRow[] = [];

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const text = node.textContent || "";
    
    // Skip purely whitespace nodes if desired, but for full fidelity keeping them is safer.
    // However, translating " " is useless. Let's filter slightly.
    if (text.trim().length > 0) {
      rows.push({
        ID: `word_idx_${i}`, // Use index as ID
        Source: text
      });
    }
  }

  return rows;
};

export const exportToWord = async (
  originalFile: File,
  items: TranslationItem[],
  langCode: string
): Promise<void> => {
  const zip = await JSZip.loadAsync(originalFile);
  const docXml = await zip.file("word/document.xml")?.async("string");

  if (!docXml) {
    throw new Error("原始檔案結構損毀");
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "text/xml");
  const textNodes = xmlDoc.getElementsByTagName("w:t");

  // Map translations for O(1) lookup
  const translationMap = new Map<string, string>();
  items.forEach(item => {
    // If translation exists and is not empty, use it.
    if (item.translations[langCode]) {
      // NOTE: Removed cleanTextForExport. Raw data export.
      translationMap.set(item.id, item.translations[langCode]);
    }
  });

  // Iterate exactly as we did during parsing
  for (let i = 0; i < textNodes.length; i++) {
    const id = `word_idx_${i}`;
    if (translationMap.has(id)) {
      const translatedText = translationMap.get(id)!;
      textNodes[i].textContent = translatedText;
    }
    // If no translation found, keep original (don't touch textContent)
  }

  // Serialize back to XML string
  const serializer = new XMLSerializer();
  const newDocXml = serializer.serializeToString(xmlDoc);

  // Update the zip
  zip.file("word/document.xml", newDocXml);

  // Generate blob
  const content = await zip.generateAsync({ type: "blob" });

  // Trigger download
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  
  // Insert lang code before extension
  const originalName = originalFile.name;
  const dotIndex = originalName.lastIndexOf(".");
  const name = dotIndex !== -1 
    ? originalName.substring(0, dotIndex) + `_${langCode}` + originalName.substring(dotIndex)
    : originalName + `_${langCode}`;

  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

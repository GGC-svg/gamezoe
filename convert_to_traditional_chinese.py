#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量將遊戲語言包從簡體中文轉換為繁體中文（台灣）
"""
import re
import opencc

# 這個腳本需要安裝 opencc-python-reimplemented
# pip install opencc-python-reimplemented

# 簡體轉繁體（台灣標準）
converter = opencc.OpenCC('s2tw')  # 不需要 .json 副檔名

def convert_language_pack(file_path):
    """轉換語言包中的所有簡體中文字串為繁體中文"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 找到語言包區域 (window.i18n.languages.zh = {...)
    pattern = r'(window\.i18n\.languages\.zh\s*=\s*\{)(.*?)(\}\s*,\s*cc\._RF\.pop\(\))'
    
    def replace_values(match):
        prefix = match.group(1)
        lang_content = match.group(2)
        suffix = match.group(3)
        
        # 找到所有 key: "value" 對
        def convert_string(m):
            key = m.group(1)
            value = m.group(2)
            # 轉換簡體為繁體
            converted = converter.convert(value)
            # 特殊處理：激光 → 雷射（台灣用語）
            converted = converted.replace('激光', '雷射')
            # 充值 → 儲值（台灣用語）
            converted = converted.replace('充值', '儲值')
            return f'{key}"{converted}"'
        
        # 替換所有字串值
        lang_content = re.sub(r'(key\d+:\s*)"([^"]*)"', convert_string, lang_content, flags=re.DOTALL)
        
        return prefix + lang_content + suffix
    
    # 執行替換
    result = re.sub(pattern, replace_values, content, flags=re.DOTALL)
    
    # 寫回檔案
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(result)
    
    print(f"✅ 已完成轉換: {file_path}")

if __name__ == '__main__':
    # 轉換主檔案
    convert_language_pack('e:/Steam/gamezoe/games/fish-master/client/fish/src/project.js')
    # 轉換備份檔案
    convert_language_pack('e:/Steam/gamezoe/games/fish-master/client/temp_extract/fish/src/project.js')
    print("\n🎉 所有語言包轉換完成！")

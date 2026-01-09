// 创建占位符图片的脚本
const fs = require('fs');
const path = require('path');

// 1x1透明PNG的base64数据
const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';

// 创建目录
const imageDir = 'res/raw-internal/image';
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

// 需要创建的图片文件
const images = [
    'default_btn_normal.1ecb7.png',
    'default_btn_pressed.bedf4.png',
    'default_btn_disabled.286c6.png',
    'default_scrollbar_vertical_bg.4bb41.png',
    'default_scrollbar_vertical.71821.png',
    'default_scrollbar_bg.d6732.png'
];

// 创建每个图片文件
images.forEach(filename => {
    const filePath = path.join(imageDir, filename);
    const buffer = Buffer.from(transparentPng, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log(`Created: ${filePath}`);
});

console.log('All placeholder images created successfully!');
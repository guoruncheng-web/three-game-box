#!/usr/bin/env node
/**
 * SVG 转 PNG 转换器（Node.js 版）
 * 使用 sharp 库转换 SVG 到 PNG
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了 sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ 未安装 sharp 库');
  console.error('请运行: npm install sharp');
  process.exit(1);
}

/**
 * 将单个 SVG 文件转换为 PNG
 */
async function convertSvgToPng(svgPath, pngPath = null, size = 128) {
  if (!pngPath) {
    pngPath = svgPath.replace('.svg', '.png');
  }

  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    return pngPath;
  } catch (error) {
    console.error(`❌ 转换失败 ${svgPath}:`, error.message);
    return null;
  }
}

/**
 * 转换目录中的所有 SVG 文件
 */
async function convertDirectory(inputDir, outputDir = null, size = 128) {
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(inputDir);
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  if (svgFiles.length === 0) {
    console.error(`❌ 在 ${inputDir} 中未找到 SVG 文件`);
    return [];
  }

  const converted = [];
  console.log(`\n找到 ${svgFiles.length} 个 SVG 文件`);

  for (const filename of svgFiles) {
    const svgPath = path.join(inputDir, filename);
    console.log(`\n转换: ${filename}`);

    const pngFilename = filename.replace('.svg', '.png');
    const pngPath = outputDir
      ? path.join(outputDir, pngFilename)
      : path.join(inputDir, pngFilename);

    const result = await convertSvgToPng(svgPath, pngPath, size);
    if (result) {
      converted.push(result);
      console.log(`  ✅ 生成: ${path.basename(result)}`);
    }
  }

  return converted;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(50));
  console.log('SVG 转 PNG 转换器 (Node.js 版)');
  console.log('='.repeat(50));

  const inputDir = 'public/images/generated/fruits';

  if (!fs.existsSync(inputDir)) {
    console.error(`❌ 目录不存在: ${inputDir}`);
    console.error('请先运行: python3 .claude/skills/ui-generator/generate_fruits.py');
    process.exit(1);
  }

  console.log(`\n输入目录: ${inputDir}`);
  console.log('输出目录: 相同目录');
  console.log('图片尺寸: 128x128');

  const converted = await convertDirectory(inputDir, null, 128);

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 成功转换 ${converted.length} 个文件！`);

  if (converted.length > 0) {
    console.log('\n生成的 PNG 文件:');
    converted.forEach(png => {
      console.log(`  - ${path.basename(png)}`);
    });
  }

  console.log(`\n输出目录: ${inputDir}`);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
  });
}

module.exports = { convertSvgToPng, convertDirectory };

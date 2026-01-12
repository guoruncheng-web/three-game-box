#!/usr/bin/env python3
"""
简单的水果 SVG 到 PNG 转换脚本
"""

import os
import glob

# 尝试导入 cairosvg
try:
    import cairosvg
    HAS_CAIRO = True
except ImportError:
    HAS_CAIRO = False
    print("⚠️  cairosvg 未安装，将只生成 SVG 文件")
    print("提示：SVG 文件可以直接在浏览器和游戏中使用")

def convert_fruits():
    """转换所有水果 SVG 到 PNG"""
    fruits_dir = "public/images/generated/fruits"

    if not os.path.exists(fruits_dir):
        print(f"❌ 目录不存在: {fruits_dir}")
        return

    svg_files = glob.glob(os.path.join(fruits_dir, "*.svg"))

    if not svg_files:
        print(f"❌ 在 {fruits_dir} 中未找到 SVG 文件")
        return

    print(f"\n找到 {len(svg_files)} 个 SVG 文件")

    if not HAS_CAIRO:
        print("\n💡 提示：")
        print("  1. SVG 文件可以直接在 Web 应用中使用")
        print("  2. 如需 PNG 格式，请在浏览器中打开 SVG 并截图")
        print("  3. 或使用在线工具: https://cloudconvert.com/svg-to-png")
        return

    converted = []

    for svg_path in svg_files:
        filename = os.path.basename(svg_path)
        png_path = svg_path.replace('.svg', '.png')

        print(f"\n转换: {filename}")

        try:
            cairosvg.svg2png(
                url=svg_path,
                write_to=png_path,
                output_width=128,
                output_height=128
            )
            converted.append(png_path)
            print(f"  ✅ 生成: {os.path.basename(png_path)}")
        except Exception as e:
            print(f"  ❌ 失败: {e}")

    print(f"\n✅ 成功转换 {len(converted)}/{len(svg_files)} 个文件")

if __name__ == "__main__":
    print("=" * 50)
    print("水果图片转换工具")
    print("=" * 50)
    convert_fruits()

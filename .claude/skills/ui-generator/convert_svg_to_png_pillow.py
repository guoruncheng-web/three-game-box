#!/usr/bin/env python3
"""
SVG 转 PNG 转换器（使用 Pillow + svglib）
"""

import os
import glob
import sys

try:
    from PIL import Image
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM
except ImportError as e:
    print(f"❌ 缺少必要的库: {e}")
    print("\n请安装依赖:")
    print("  pip3 install svglib reportlab pillow")
    sys.exit(1)


def convert_svg_to_png(svg_path: str, png_path: str = None, scale: float = 1.0):
    """
    将 SVG 文件转换为 PNG

    Args:
        svg_path: SVG 文件路径
        png_path: PNG 输出路径（如果为 None，则自动生成）
        scale: 缩放比例（默认 1.0）
    """
    if png_path is None:
        png_path = svg_path.replace('.svg', '.png')

    try:
        # 读取 SVG
        drawing = svg2rlg(svg_path)
        if drawing is None:
            print(f"❌ 无法读取 SVG: {svg_path}")
            return None

        # 转换为 PNG
        renderPM.drawToFile(drawing, png_path, fmt='PNG', dpi=72 * scale)
        return png_path
    except Exception as e:
        print(f"❌ 转换失败 {svg_path}: {e}")
        return None


def convert_directory(input_dir: str, output_dir: str = None, scale: float = 1.0):
    """
    转换目录中的所有 SVG 文件

    Args:
        input_dir: 输入目录
        output_dir: 输出目录（如果为 None，则输出到相同目录）
        scale: 缩放比例
    """
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    svg_files = glob.glob(os.path.join(input_dir, "*.svg"))

    if not svg_files:
        print(f"❌ 在 {input_dir} 中未找到 SVG 文件")
        return []

    converted = []
    print(f"\n找到 {len(svg_files)} 个 SVG 文件")

    for svg_path in svg_files:
        filename = os.path.basename(svg_path)
        print(f"\n转换: {filename}")

        if output_dir:
            png_path = os.path.join(output_dir, filename.replace('.svg', '.png'))
        else:
            png_path = svg_path.replace('.svg', '.png')

        result = convert_svg_to_png(svg_path, png_path, scale)
        if result:
            converted.append(result)
            print(f"  ✅ 生成: {os.path.basename(result)}")

    return converted


def main():
    """主函数"""
    print("=" * 50)
    print("SVG 转 PNG 转换器 (Pillow版)")
    print("=" * 50)

    # 默认转换水果目录
    input_dir = "public/images/generated/fruits"

    if not os.path.exists(input_dir):
        print(f"❌ 目录不存在: {input_dir}")
        print("请先运行: python3 .claude/skills/ui-generator/generate_fruits.py")
        sys.exit(1)

    print(f"\n输入目录: {input_dir}")
    print("输出目录: 相同目录")

    # 转换所有 SVG
    converted = convert_directory(input_dir, scale=2.0)  # 2x 缩放获得更高清晰度

    print(f"\n{'=' * 50}")
    print(f"✅ 成功转换 {len(converted)} 个文件！")

    if converted:
        print("\n生成的 PNG 文件:")
        for png in converted:
            print(f"  - {os.path.basename(png)}")

    print(f"\n输出目录: {input_dir}")


if __name__ == "__main__":
    main()

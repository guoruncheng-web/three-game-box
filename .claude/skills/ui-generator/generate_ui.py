#!/usr/bin/env python3
"""
UI 图片生成工具
用于自动生成游戏 UI 所需的图标、按钮、背景等图片资源

依赖：
    pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys
from typing import Tuple, Optional
import colorsys


class UIGenerator:
    """UI 图片生成器"""

    def __init__(self, output_dir: str = "public/images/generated"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """将十六进制颜色转换为 RGB"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    @staticmethod
    def adjust_brightness(rgb: Tuple[int, int, int], factor: float) -> Tuple[int, int, int]:
        """调整颜色亮度"""
        h, l, s = colorsys.rgb_to_hls(rgb[0]/255, rgb[1]/255, rgb[2]/255)
        l = max(0, min(1, l * factor))
        r, g, b = colorsys.hls_to_rgb(h, l, s)
        return (int(r*255), int(g*255), int(b*255))

    def generate_icon(
        self,
        name: str,
        size: int = 64,
        bg_color: str = "#667eea",
        emoji: str = "🎮",
        style: str = "circle"
    ) -> str:
        """
        生成图标

        Args:
            name: 文件名（不含扩展名）
            size: 图标尺寸
            bg_color: 背景颜色（十六进制）
            emoji: emoji 图标
            style: 样式 (circle, rounded_square, square)

        Returns:
            生成的文件路径
        """
        # 创建图像
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 背景颜色
        rgb_color = self.hex_to_rgb(bg_color)

        # 绘制背景形状
        if style == "circle":
            draw.ellipse([0, 0, size, size], fill=rgb_color)
        elif style == "rounded_square":
            radius = size // 4
            self._draw_rounded_rectangle(draw, [0, 0, size, size], radius, rgb_color)
        else:  # square
            draw.rectangle([0, 0, size, size], fill=rgb_color)

        # 尝试添加 emoji 文字（需要系统支持 emoji 字体）
        try:
            # 使用系统默认字体
            font_size = int(size * 0.5)
            font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", font_size)

            # 计算文字位置（居中）
            bbox = draw.textbbox((0, 0), emoji, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = (size - text_width) // 2 - bbox[0]
            text_y = (size - text_height) // 2 - bbox[1]

            draw.text((text_x, text_y), emoji, font=font, embedded_color=True)
        except Exception as e:
            print(f"Warning: Could not add emoji: {e}")
            # 如果无法添加 emoji，绘制一个简单的形状作为占位
            padding = size // 4
            lighter_color = self.adjust_brightness(rgb_color, 1.3)
            if emoji == "🎮":
                # 游戏手柄简化形状
                draw.ellipse([padding, padding, size-padding, size-padding], fill=lighter_color)
            else:
                # 默认圆形
                draw.ellipse([padding, padding, size-padding, size-padding], fill=lighter_color)

        # 保存文件
        filepath = os.path.join(self.output_dir, f"{name}.png")
        img.save(filepath, 'PNG')
        print(f"✓ Generated: {filepath}")
        return filepath

    def generate_button(
        self,
        name: str,
        width: int = 200,
        height: int = 60,
        bg_color: str = "#667eea",
        text: str = "Button",
        text_color: str = "#ffffff"
    ) -> str:
        """
        生成按钮图片

        Args:
            name: 文件名（不含扩展名）
            width: 按钮宽度
            height: 按钮高度
            bg_color: 背景颜色
            text: 按钮文字
            text_color: 文字颜色

        Returns:
            生成的文件路径
        """
        # 创建图像
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 背景颜色
        rgb_color = self.hex_to_rgb(bg_color)

        # 绘制圆角矩形背景
        radius = height // 4
        self._draw_rounded_rectangle(draw, [0, 0, width, height], radius, rgb_color)

        # 添加渐变效果（简化版：顶部亮一些）
        lighter_color = self.adjust_brightness(rgb_color, 1.1)
        self._draw_rounded_rectangle(draw, [0, 0, width, height//3], radius, lighter_color + (128,))

        # 添加文字
        try:
            font_size = int(height * 0.4)
            # 尝试使用系统字体
            try:
                font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", font_size)
            except:
                try:
                    font = ImageFont.truetype("Arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()

            # 计算文字位置（居中）
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = (width - text_width) // 2 - bbox[0]
            text_y = (height - text_height) // 2 - bbox[1]

            text_rgb = self.hex_to_rgb(text_color)
            draw.text((text_x, text_y), text, fill=text_rgb, font=font)
        except Exception as e:
            print(f"Warning: Could not add text: {e}")

        # 保存文件
        filepath = os.path.join(self.output_dir, f"{name}.png")
        img.save(filepath, 'PNG')
        print(f"✓ Generated: {filepath}")
        return filepath

    def generate_gradient_bg(
        self,
        name: str,
        width: int = 800,
        height: int = 600,
        color_start: str = "#667eea",
        color_end: str = "#764ba2",
        direction: str = "vertical"
    ) -> str:
        """
        生成渐变背景

        Args:
            name: 文件名（不含扩展名）
            width: 宽度
            height: 高度
            color_start: 起始颜色
            color_end: 结束颜色
            direction: 渐变方向 (vertical, horizontal, diagonal)

        Returns:
            生成的文件路径
        """
        img = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(img)

        rgb_start = self.hex_to_rgb(color_start)
        rgb_end = self.hex_to_rgb(color_end)

        if direction == "vertical":
            for y in range(height):
                ratio = y / height
                r = int(rgb_start[0] * (1 - ratio) + rgb_end[0] * ratio)
                g = int(rgb_start[1] * (1 - ratio) + rgb_end[1] * ratio)
                b = int(rgb_start[2] * (1 - ratio) + rgb_end[2] * ratio)
                draw.line([(0, y), (width, y)], fill=(r, g, b))
        elif direction == "horizontal":
            for x in range(width):
                ratio = x / width
                r = int(rgb_start[0] * (1 - ratio) + rgb_end[0] * ratio)
                g = int(rgb_start[1] * (1 - ratio) + rgb_end[1] * ratio)
                b = int(rgb_start[2] * (1 - ratio) + rgb_end[2] * ratio)
                draw.line([(x, 0), (x, height)], fill=(r, g, b))
        else:  # diagonal
            for y in range(height):
                for x in range(width):
                    ratio = (x + y) / (width + height)
                    r = int(rgb_start[0] * (1 - ratio) + rgb_end[0] * ratio)
                    g = int(rgb_start[1] * (1 - ratio) + rgb_end[1] * ratio)
                    b = int(rgb_start[2] * (1 - ratio) + rgb_end[2] * ratio)
                    draw.point((x, y), fill=(r, g, b))

        filepath = os.path.join(self.output_dir, f"{name}.png")
        img.save(filepath, 'PNG')
        print(f"✓ Generated: {filepath}")
        return filepath

    def generate_placeholder(
        self,
        name: str,
        width: int = 400,
        height: int = 300,
        bg_color: str = "#cccccc",
        text: Optional[str] = None
    ) -> str:
        """
        生成占位图

        Args:
            name: 文件名（不含扩展名）
            width: 宽度
            height: 高度
            bg_color: 背景颜色
            text: 显示的文字（默认显示尺寸）

        Returns:
            生成的文件路径
        """
        img = Image.new('RGB', (width, height), self.hex_to_rgb(bg_color))
        draw = ImageDraw.Draw(img)

        if text is None:
            text = f"{width} × {height}"

        try:
            font_size = min(width, height) // 10
            try:
                font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", font_size)
            except:
                try:
                    font = ImageFont.truetype("Arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()

            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = (width - text_width) // 2 - bbox[0]
            text_y = (height - text_height) // 2 - bbox[1]

            # 文字颜色（根据背景自动选择）
            text_color = (100, 100, 100)
            draw.text((text_x, text_y), text, fill=text_color, font=font)
        except Exception as e:
            print(f"Warning: Could not add text: {e}")

        filepath = os.path.join(self.output_dir, f"{name}.png")
        img.save(filepath, 'PNG')
        print(f"✓ Generated: {filepath}")
        return filepath

    @staticmethod
    def _draw_rounded_rectangle(draw, coords, radius, fill):
        """绘制圆角矩形"""
        x0, y0, x1, y1 = coords
        # 绘制中间矩形
        draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
        draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
        # 绘制四个圆角
        draw.pieslice([x0, y0, x0 + radius*2, y0 + radius*2], 180, 270, fill=fill)
        draw.pieslice([x1 - radius*2, y0, x1, y0 + radius*2], 270, 360, fill=fill)
        draw.pieslice([x0, y1 - radius*2, x0 + radius*2, y1], 90, 180, fill=fill)
        draw.pieslice([x1 - radius*2, y1 - radius*2, x1, y1], 0, 90, fill=fill)


def main():
    """主函数 - 演示用法"""
    generator = UIGenerator()

    print("🎨 UI 图片生成工具")
    print("=" * 50)

    # 生成示例图标
    print("\n📦 生成图标...")
    generator.generate_icon("icon-game", size=64, bg_color="#667eea", emoji="🎮", style="circle")
    generator.generate_icon("icon-star", size=64, bg_color="#f1c40f", emoji="⭐", style="circle")
    generator.generate_icon("icon-heart", size=64, bg_color="#e74c3c", emoji="❤️", style="circle")
    generator.generate_icon("icon-trophy", size=64, bg_color="#f39c12", emoji="🏆", style="rounded_square")

    # 生成示例按钮
    print("\n🔘 生成按钮...")
    generator.generate_button("btn-primary", width=200, height=60, bg_color="#667eea", text="开始游戏")
    generator.generate_button("btn-secondary", width=200, height=60, bg_color="#4ecdc4", text="设置")
    generator.generate_button("btn-danger", width=200, height=60, bg_color="#e74c3c", text="退出")

    # 生成渐变背景
    print("\n🌈 生成渐变背景...")
    generator.generate_gradient_bg("bg-purple", 800, 600, "#667eea", "#764ba2", "vertical")
    generator.generate_gradient_bg("bg-ocean", 800, 600, "#4ecdc4", "#556270", "diagonal")

    # 生成占位图
    print("\n🖼️  生成占位图...")
    generator.generate_placeholder("placeholder-400x300", 400, 300)
    generator.generate_placeholder("placeholder-square", 500, 500, text="游戏封面")

    print("\n" + "=" * 50)
    print(f"✅ 所有图片已生成到: {generator.output_dir}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
水果消消乐游戏背景生成器
生成清新、活泼、有趣的游戏面板背景

依赖：
    pip install pillow
"""

from PIL import Image, ImageDraw, ImageFilter
import os
import random
import math


class FruitMatchBackgroundGenerator:
    """水果消消乐背景生成器"""

    def __init__(self, output_dir: str = "public/images/generated"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    @staticmethod
    def hex_to_rgb(hex_color: str) -> tuple:
        """将十六进制颜色转换为 RGB"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def generate_fruit_match_background(
        self,
        name: str = "fruit-match-bg",
        width: int = 800,
        height: int = 1200,
        style: str = "fresh"
    ) -> str:
        """
        生成水果消消乐游戏背景

        Args:
            name: 文件名（不含扩展名）
            width: 宽度
            height: 高度
            style: 风格 (fresh=清新, sweet=甜美, vibrant=活力)

        Returns:
            生成的文件路径
        """
        # 创建基础图像
        img = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(img)

        # 根据风格选择配色
        if style == "fresh":
            # 清新绿色系
            color_top = self.hex_to_rgb("#a8e6cf")      # 薄荷绿
            color_bottom = self.hex_to_rgb("#dcedc1")   # 浅黄绿
            accent_colors = [
                self.hex_to_rgb("#ffaaa5"),  # 粉红
                self.hex_to_rgb("#ffd3b6"),  # 桃色
                self.hex_to_rgb("#a8e6cf"),  # 薄荷绿
                self.hex_to_rgb("#dcedc1"),  # 浅黄绿
            ]
        elif style == "sweet":
            # 甜美粉色系
            color_top = self.hex_to_rgb("#ffd6e8")      # 浅粉
            color_bottom = self.hex_to_rgb("#ffe4e1")   # 米粉
            accent_colors = [
                self.hex_to_rgb("#ffd6e8"),  # 浅粉
                self.hex_to_rgb("#ffb3d9"),  # 粉紫
                self.hex_to_rgb("#c9a0dc"),  # 淡紫
                self.hex_to_rgb("#ffdfd3"),  # 浅杏
            ]
        else:  # vibrant
            # 活力彩虹系
            color_top = self.hex_to_rgb("#ffeaa7")      # 亮黄
            color_bottom = self.hex_to_rgb("#fab1a0")   # 珊瑚橙
            accent_colors = [
                self.hex_to_rgb("#ffeaa7"),  # 亮黄
                self.hex_to_rgb("#fab1a0"),  # 珊瑚橙
                self.hex_to_rgb("#ff6b6b"),  # 西瓜红
                self.hex_to_rgb("#74b9ff"),  # 天蓝
            ]

        # 1. 绘制渐变背景
        self._draw_gradient(draw, width, height, color_top, color_bottom)

        # 2. 添加装饰性圆点（模拟水果的圆润感）
        self._draw_decorative_dots(draw, width, height, accent_colors)

        # 3. 添加光晕效果（增加梦幻感）
        img = self._add_glow_effect(img, accent_colors)

        # 4. 添加微妙的纹理
        img = self._add_subtle_texture(img)

        # 保存文件
        filepath = os.path.join(self.output_dir, f"{name}.png")
        img.save(filepath, 'PNG', quality=95)
        print(f"✓ Generated: {filepath}")
        return filepath

    def _draw_gradient(self, draw, width, height, color_top, color_bottom):
        """绘制垂直渐变"""
        for y in range(height):
            ratio = y / height
            r = int(color_top[0] * (1 - ratio) + color_bottom[0] * ratio)
            g = int(color_top[1] * (1 - ratio) + color_bottom[1] * ratio)
            b = int(color_top[2] * (1 - ratio) + color_bottom[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

    def _draw_decorative_dots(self, draw, width, height, colors):
        """绘制装饰性圆点"""
        # 设置随机种子以获得一致的结果
        random.seed(42)

        num_dots = 30
        for _ in range(num_dots):
            x = random.randint(0, width)
            y = random.randint(0, height)
            radius = random.randint(20, 80)
            color = random.choice(colors)

            # 添加透明度
            alpha = random.randint(30, 80)
            color_with_alpha = color + (alpha,)

            # 创建临时图像用于绘制半透明圆形
            temp = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            temp_draw = ImageDraw.Draw(temp)
            temp_draw.ellipse(
                [x - radius, y - radius, x + radius, y + radius],
                fill=color_with_alpha
            )

            # 合并到主图像（需要转换）
            # 注意：这里简化处理，直接在 draw 上绘制（实际会丢失透明度）
            # 如果需要真正的透明效果，需要使用图层合成
            draw.ellipse(
                [x - radius, y - radius, x + radius, y + radius],
                fill=color,
                outline=None
            )

    def _add_glow_effect(self, img, colors):
        """添加光晕效果"""
        # 创建光晕图层
        glow_layer = Image.new('RGBA', img.size, (255, 255, 255, 0))
        glow_draw = ImageDraw.Draw(glow_layer)

        random.seed(123)
        num_glows = 8

        for _ in range(num_glows):
            x = random.randint(0, img.width)
            y = random.randint(0, img.height)
            radius = random.randint(100, 200)
            color = random.choice(colors)

            # 绘制渐变光晕（从中心到边缘逐渐透明）
            for r in range(radius, 0, -10):
                alpha = int(20 * (r / radius))  # 透明度随半径递减
                glow_draw.ellipse(
                    [x - r, y - r, x + r, y + r],
                    fill=color + (alpha,)
                )

        # 应用高斯模糊使光晕更柔和
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=30))

        # 将光晕层合成到原图
        img_rgba = img.convert('RGBA')
        img_rgba = Image.alpha_composite(img_rgba, glow_layer)

        return img_rgba.convert('RGB')

    def _add_subtle_texture(self, img):
        """添加微妙的纹理"""
        # 创建噪点图层
        noise = Image.new('RGB', img.size)
        pixels = noise.load()

        random.seed(456)
        for y in range(img.height):
            for x in range(img.width):
                # 随机灰度值（非常微妙）
                gray = random.randint(0, 15)
                pixels[x, y] = (gray, gray, gray)

        # 混合噪点（非常低的透明度）
        return Image.blend(img, noise, alpha=0.03)

    def generate_all_styles(self, base_name: str = "fruit-match-bg"):
        """生成所有风格的背景"""
        styles = ["fresh", "sweet", "vibrant"]
        generated = []

        print("🍎 水果消消乐背景生成器")
        print("=" * 50)

        for style in styles:
            print(f"\n🎨 生成 {style} 风格背景...")
            filepath = self.generate_fruit_match_background(
                name=f"{base_name}-{style}",
                width=800,
                height=1200,
                style=style
            )
            generated.append(filepath)

        print("\n" + "=" * 50)
        print(f"✅ 已生成 {len(generated)} 张背景图片")
        print(f"📁 输出目录: {self.output_dir}")

        return generated


def main():
    """主函数"""
    generator = FruitMatchBackgroundGenerator()

    # 生成所有风格的背景
    generator.generate_all_styles()

    print("\n💡 提示：")
    print("  - fresh 风格：清新绿色系，适合自然主题")
    print("  - sweet 风格：甜美粉色系，适合梦幻主题")
    print("  - vibrant 风格：活力彩虹系，适合欢快主题")


if __name__ == "__main__":
    main()

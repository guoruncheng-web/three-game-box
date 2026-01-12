#!/usr/bin/env python3
"""
水果消消乐立体水果图片生成器
生成带有渐变、高光、阴影效果的立体水果 SVG
"""

import os
from typing import Tuple

class FruitGenerator:
    """立体水果 SVG 生成器"""

    def __init__(self, output_dir: str = "public/images/generated/fruits"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def _create_radial_gradient(self, id_name: str, color_light: str, color_dark: str) -> str:
        """创建径向渐变（立体效果）"""
        return f"""
    <radialGradient id="{id_name}" cx="35%" cy="35%">
      <stop offset="0%" style="stop-color:{color_light};stop-opacity:1" />
      <stop offset="50%" style="stop-color:{color_dark};stop-opacity:1" />
      <stop offset="100%" style="stop-color:{color_dark};stop-opacity:1" />
    </radialGradient>"""

    def _create_highlight(self, cx: float, cy: float, r: float) -> str:
        """创建高光效果"""
        return f"""
    <ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.6}"
             fill="white" opacity="0.4"
             transform="rotate(-30 {cx} {cy})"/>"""

    def _create_shadow(self) -> str:
        """创建底部阴影"""
        return """
    <ellipse cx="64" cy="110" rx="45" ry="8"
             fill="black" opacity="0.15"/>"""

    def generate_apple(self, filename: str = "apple.svg", size: int = 128):
        """生成苹果（红色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("appleGrad", "#ff6b6b", "#c92a2a")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 苹果主体 -->
  <path d="M 64 20 Q 40 20 30 45 Q 20 70 30 90 Q 40 105 64 105 Q 88 105 98 90 Q 108 70 98 45 Q 88 20 64 20 Z"
        fill="url(#appleGrad)" stroke="#a61e1e" stroke-width="1"/>

  <!-- 凹陷 -->
  <ellipse cx="64" cy="22" rx="8" ry="4" fill="#8b1a1a" opacity="0.5"/>

  <!-- 茎 -->
  <rect x="62" y="10" width="4" height="14" rx="2" fill="#5c4033"/>

  <!-- 叶子 -->
  <path d="M 68 18 Q 78 18 82 24 Q 78 28 70 26 Z"
        fill="#4caf50" stroke="#2e7d32" stroke-width="1"/>

  <!-- 高光 -->
{self._create_highlight(50, 35, 15)}
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_orange(self, filename: str = "orange.svg", size: int = 128):
        """生成橙子（橙色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("orangeGrad", "#ffa94d", "#ff6b35")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 橙子主体 -->
  <circle cx="64" cy="64" r="42" fill="url(#orangeGrad)" stroke="#d35400" stroke-width="1"/>

  <!-- 纹理点 -->
  <g opacity="0.3">
    <circle cx="45" cy="50" r="1.5" fill="#d35400"/>
    <circle cx="55" cy="45" r="1.5" fill="#d35400"/>
    <circle cx="70" cy="48" r="1.5" fill="#d35400"/>
    <circle cx="80" cy="55" r="1.5" fill="#d35400"/>
    <circle cx="50" cy="70" r="1.5" fill="#d35400"/>
    <circle cx="75" cy="75" r="1.5" fill="#d35400"/>
    <circle cx="60" cy="80" r="1.5" fill="#d35400"/>
  </g>

  <!-- 顶部茎 -->
  <rect x="62" y="16" width="4" height="8" rx="2" fill="#5c4033"/>
  <ellipse cx="64" cy="22" rx="6" ry="3" fill="#4caf50"/>

  <!-- 高光 -->
{self._create_highlight(48, 45, 18)}
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_lemon(self, filename: str = "lemon.svg", size: int = 128):
        """生成柠檬（黄色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("lemonGrad", "#fff176", "#ffd93d")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 柠檬主体（椭圆）-->
  <ellipse cx="64" cy="64" rx="38" ry="44"
           fill="url(#lemonGrad)" stroke="#f9ca24" stroke-width="1"/>

  <!-- 顶部突起 -->
  <ellipse cx="64" cy="22" rx="8" ry="10" fill="#f9ca24"/>

  <!-- 底部突起 -->
  <ellipse cx="64" cy="106" rx="6" ry="8" fill="#f0b922"/>

  <!-- 纹理 -->
  <g opacity="0.2">
    <circle cx="50" cy="55" r="1.5" fill="#e0a800"/>
    <circle cx="65" cy="50" r="1.5" fill="#e0a800"/>
    <circle cx="75" cy="65" r="1.5" fill="#e0a800"/>
    <circle cx="55" cy="75" r="1.5" fill="#e0a800"/>
  </g>

  <!-- 高光 -->
{self._create_highlight(50, 45, 16)}
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_grape(self, filename: str = "grape.svg", size: int = 128):
        """生成葡萄（紫色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("grapeGrad", "#b794f6", "#7c3aed")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 叶子 -->
  <path d="M 55 20 Q 40 25 35 35 Q 40 45 55 40 Z"
        fill="#4caf50" stroke="#2e7d32" stroke-width="1"/>

  <!-- 茎 -->
  <path d="M 60 18 Q 62 22 64 28"
        stroke="#5c4033" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- 葡萄粒（多个圆形组成串）-->
  <!-- 第一层 -->
  <circle cx="64" cy="35" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>

  <!-- 第二层 -->
  <circle cx="50" cy="50" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>
  <circle cx="78" cy="50" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>

  <!-- 第三层 -->
  <circle cx="64" cy="60" r="13" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>
  <circle cx="42" cy="68" r="11" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>
  <circle cx="86" cy="68" r="11" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>

  <!-- 第四层 -->
  <circle cx="54" cy="78" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>
  <circle cx="74" cy="78" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>

  <!-- 第五层 -->
  <circle cx="64" cy="92" r="12" fill="url(#grapeGrad)" stroke="#6d28d9" stroke-width="1"/>

  <!-- 高光（在几个葡萄粒上）-->
  <ellipse cx="60" cy="32" rx="5" ry="3" fill="white" opacity="0.5"/>
  <ellipse cx="46" cy="47" rx="4" ry="2.5" fill="white" opacity="0.5"/>
  <ellipse cx="60" cy="57" rx="5" ry="3" fill="white" opacity="0.5"/>
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_watermelon(self, filename: str = "watermelon.svg", size: int = 128):
        """生成西瓜（绿色外皮，红色果肉）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("melonGreenGrad", "#51cf66", "#2b8a3e")}
{self._create_radial_gradient("melonRedGrad", "#ff6b6b", "#fa5252")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 西瓜切片（半圆）-->
  <!-- 外皮 -->
  <path d="M 25 80 Q 25 35 64 20 Q 103 35 103 80 Z"
        fill="url(#melonGreenGrad)" stroke="#2b8a3e" stroke-width="2"/>

  <!-- 白色分界 -->
  <path d="M 30 78 Q 30 40 64 27 Q 98 40 98 78 Z"
        fill="#e9ecef" stroke="none"/>

  <!-- 红色果肉 -->
  <path d="M 33 76 Q 33 42 64 30 Q 95 42 95 76 Z"
        fill="url(#melonRedGrad)" stroke="none"/>

  <!-- 西瓜籽 -->
  <g fill="#212529">
    <ellipse cx="50" cy="55" rx="3" ry="5" transform="rotate(20 50 55)"/>
    <ellipse cx="64" cy="50" rx="3" ry="5" transform="rotate(-10 64 50)"/>
    <ellipse cx="78" cy="58" rx="3" ry="5" transform="rotate(15 78 58)"/>
    <ellipse cx="58" cy="68" rx="3" ry="5" transform="rotate(-20 58 68)"/>
    <ellipse cx="72" cy="70" rx="3" ry="5" transform="rotate(25 72 70)"/>
  </g>

  <!-- 高光 -->
  <ellipse cx="48" cy="45" rx="12" ry="8" fill="white" opacity="0.3" transform="rotate(-30 48 45)"/>
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_strawberry(self, filename: str = "strawberry.svg", size: int = 128):
        """生成草莓（粉红色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("strawberryGrad", "#ff6b9d", "#e03e6c")}
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 草莓主体 -->
  <path d="M 64 30 Q 45 30 35 50 Q 28 70 35 85 Q 45 100 64 105 Q 83 100 93 85 Q 100 70 93 50 Q 83 30 64 30 Z"
        fill="url(#strawberryGrad)" stroke="#c92a52" stroke-width="1"/>

  <!-- 叶子顶部 -->
  <g fill="#4caf50" stroke="#2e7d32" stroke-width="1">
    <path d="M 64 28 L 58 20 L 62 26 Z"/>
    <path d="M 64 28 L 70 20 L 66 26 Z"/>
    <path d="M 54 30 L 48 24 L 52 28 Z"/>
    <path d="M 74 30 L 80 24 L 76 28 Z"/>
    <path d="M 50 32 L 42 28 L 48 32 Z"/>
    <path d="M 78 32 L 86 28 L 80 32 Z"/>
  </g>

  <!-- 草莓籽（小黄点）-->
  <g fill="#ffeb3b" opacity="0.8">
    <ellipse cx="55" cy="50" rx="2" ry="2.5"/>
    <ellipse cx="64" cy="48" rx="2" ry="2.5"/>
    <ellipse cx="73" cy="52" rx="2" ry="2.5"/>
    <ellipse cx="50" cy="62" rx="2" ry="2.5"/>
    <ellipse cx="60" cy="60" rx="2" ry="2.5"/>
    <ellipse cx="68" cy="63" rx="2" ry="2.5"/>
    <ellipse cx="78" cy="65" rx="2" ry="2.5"/>
    <ellipse cx="48" cy="75" rx="2" ry="2.5"/>
    <ellipse cx="58" cy="74" rx="2" ry="2.5"/>
    <ellipse cx="70" cy="77" rx="2" ry="2.5"/>
    <ellipse cx="80" cy="78" rx="2" ry="2.5"/>
    <ellipse cx="55" cy="88" rx="2" ry="2.5"/>
    <ellipse cx="65" cy="90" rx="2" ry="2.5"/>
    <ellipse cx="73" cy="88" rx="2" ry="2.5"/>
  </g>

  <!-- 高光 -->
{self._create_highlight(52, 42, 14)}
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_peach(self, filename: str = "peach.svg", size: int = 128):
        """生成桃子（粉橙色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("peachGrad", "#ffb3ba", "#ff8c94")}
    <radialGradient id="peachBlush" cx="60%" cy="50%">
      <stop offset="0%" style="stop-color:#ffcccc;stop-opacity:0" />
      <stop offset="100%" style="stop-color:#ff6b9d;stop-opacity:0.3" />
    </radialGradient>
  </defs>

  <!-- 阴影 -->
{self._create_shadow()}

  <!-- 桃子主体（心形）-->
  <path d="M 64 25 Q 50 15 38 25 Q 25 35 25 50 Q 25 75 64 105 Q 103 75 103 50 Q 103 35 90 25 Q 78 15 64 25 Z"
        fill="url(#peachGrad)" stroke="#ff6b9d" stroke-width="1"/>

  <!-- 中间凹槽 -->
  <path d="M 64 25 Q 62 35 62 45"
        stroke="#e85d75" stroke-width="2" fill="none" opacity="0.5"/>

  <!-- 腮红效果 -->
  <ellipse cx="75" cy="60" rx="18" ry="20" fill="url(#peachBlush)"/>

  <!-- 叶子 -->
  <path d="M 64 22 L 70 12 Q 80 10 82 18 Q 78 24 72 22 Z"
        fill="#4caf50" stroke="#2e7d32" stroke-width="1"/>

  <!-- 茎 -->
  <rect x="62" y="16" width="4" height="8" rx="2" fill="#5c4033"/>

  <!-- 高光 -->
{self._create_highlight(48, 40, 16)}
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_cherry(self, filename: str = "cherry.svg", size: int = 128):
        """生成樱桃（深红色）"""
        svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size}" height="{size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
{self._create_radial_gradient("cherryGrad", "#ff6b6b", "#c92a2a")}
  </defs>

  <!-- 阴影 -->
  <ellipse cx="50" cy="110" rx="20" ry="5" fill="black" opacity="0.15"/>
  <ellipse cx="78" cy="110" rx="20" ry="5" fill="black" opacity="0.15"/>

  <!-- 茎（两根）-->
  <path d="M 64 20 Q 60 35 50 60"
        stroke="#5c4033" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 64 20 Q 68 35 78 60"
        stroke="#5c4033" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- 叶子 -->
  <path d="M 64 20 Q 74 18 78 24 Q 74 30 66 28 Z"
        fill="#4caf50" stroke="#2e7d32" stroke-width="1"/>

  <!-- 左边樱桃 -->
  <circle cx="50" cy="75" r="24" fill="url(#cherryGrad)" stroke="#a61e1e" stroke-width="1"/>
  <ellipse cx="42" cy="68" rx="8" ry="5" fill="white" opacity="0.4" transform="rotate(-30 42 68)"/>

  <!-- 右边樱桃 -->
  <circle cx="78" cy="80" r="24" fill="url(#cherryGrad)" stroke="#a61e1e" stroke-width="1"/>
  <ellipse cx="70" cy="73" rx="8" ry="5" fill="white" opacity="0.4" transform="rotate(-30 70 73)"/>
</svg>"""

        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg)
        return filepath

    def generate_all(self, size: int = 128) -> list:
        """生成所有水果"""
        fruits = []

        print("🍎 生成苹果...")
        fruits.append(self.generate_apple(size=size))

        print("🍊 生成橙子...")
        fruits.append(self.generate_orange(size=size))

        print("🍋 生成柠檬...")
        fruits.append(self.generate_lemon(size=size))

        print("🍇 生成葡萄...")
        fruits.append(self.generate_grape(size=size))

        print("🍉 生成西瓜...")
        fruits.append(self.generate_watermelon(size=size))

        print("🍓 生成草莓...")
        fruits.append(self.generate_strawberry(size=size))

        print("🍑 生成桃子...")
        fruits.append(self.generate_peach(size=size))

        print("🍒 生成樱桃...")
        fruits.append(self.generate_cherry(size=size))

        return fruits


def main():
    """主函数"""
    print("=" * 50)
    print("水果消消乐图片生成器")
    print("=" * 50)

    generator = FruitGenerator()

    print("\n开始生成立体水果图片...")
    fruits = generator.generate_all(size=128)

    print(f"\n✅ 成功生成 {len(fruits)} 个水果图片！")
    print(f"\n输出目录: {generator.output_dir}")
    print("\n生成的文件:")
    for fruit in fruits:
        print(f"  - {os.path.basename(fruit)}")

    print("\n⚠️  注意: 需要将 SVG 转换为 PNG 格式")
    print("可以使用以下命令转换:")
    print("  python3 .claude/skills/ui-generator/convert_svg_to_png.py")


if __name__ == "__main__":
    main()

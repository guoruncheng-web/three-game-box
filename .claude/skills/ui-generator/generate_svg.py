#!/usr/bin/env python3
"""
SVG 图标生成工具
自动生成矢量 SVG 图标

无需额外依赖
"""

import os
from typing import Optional


class SVGGenerator:
    """SVG 图标生成器"""

    def __init__(self, output_dir: str = "public/images/generated"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_icon(
        self,
        name: str,
        icon_type: str,
        size: int = 24,
        color: str = "#000000",
        stroke_width: int = 2
    ) -> str:
        """
        生成 SVG 图标

        Args:
            name: 文件名（不含扩展名）
            icon_type: 图标类型 (heart, star, circle, square, check, close, arrow, play, pause, etc.)
            size: 图标尺寸
            color: 颜色
            stroke_width: 线条宽度

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.svg")

        svg_content = self._get_svg_template(icon_type, size, color, stroke_width)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content)

        print(f"✓ Generated SVG: {filepath}")
        return filepath

    def _get_svg_template(self, icon_type: str, size: int, color: str, stroke_width: int) -> str:
        """获取 SVG 模板"""

        # SVG 头部
        header = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{stroke_width}" stroke-linecap="round" stroke-linejoin="round">'''

        # SVG 尾部
        footer = '</svg>'

        # 根据类型生成路径
        if icon_type == "heart":
            path = '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>'

        elif icon_type == "star":
            path = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'

        elif icon_type == "circle":
            path = '<circle cx="12" cy="12" r="10"></circle>'

        elif icon_type == "square":
            path = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>'

        elif icon_type == "check":
            path = '<polyline points="20 6 9 17 4 12"></polyline>'

        elif icon_type == "close":
            path = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'

        elif icon_type == "arrow-right":
            path = '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>'

        elif icon_type == "arrow-left":
            path = '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>'

        elif icon_type == "arrow-up":
            path = '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>'

        elif icon_type == "arrow-down":
            path = '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>'

        elif icon_type == "play":
            path = '<polygon points="5 3 19 12 5 21 5 3"></polygon>'

        elif icon_type == "pause":
            path = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'

        elif icon_type == "music":
            path = '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>'

        elif icon_type == "home":
            path = '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'

        elif icon_type == "user":
            path = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'

        elif icon_type == "settings":
            path = '<circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.2-13.7-4.2 4.2-4.2-4.2M5.2 18.3 9.4 14m4.8 0 4.2 4.2M1 12h6m6 0h6M5.2 5.7l4.2 4.2m4.2 0 4.2-4.2"></path>'

        elif icon_type == "search":
            path = '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>'

        elif icon_type == "trophy":
            path = '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>'

        elif icon_type == "gift":
            path = '<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>'

        elif icon_type == "gamepad":
            path = '<line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="6"></rect>'

        else:
            # 默认：简单圆形
            path = '<circle cx="12" cy="12" r="10"></circle>'

        return f"{header}\n  {path}\n{footer}"

    def generate_custom_icon(
        self,
        name: str,
        paths: str,
        size: int = 24,
        viewbox: str = "0 0 24 24"
    ) -> str:
        """
        生成自定义 SVG 图标

        Args:
            name: 文件名（不含扩展名）
            paths: SVG 路径字符串
            size: 图标尺寸
            viewbox: 视图盒子

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.svg")

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="{viewbox}">
  {paths}
</svg>'''

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content)

        print(f"✓ Generated custom SVG: {filepath}")
        return filepath


def main():
    """主函数 - 演示用法"""
    generator = SVGGenerator()

    print("🎨 SVG 图标生成工具")
    print("=" * 50)

    # 生成常用图标
    print("\n📦 生成图标...")
    icons = [
        ("icon-heart", "heart", "#e74c3c"),
        ("icon-star", "star", "#f1c40f"),
        ("icon-circle", "circle", "#667eea"),
        ("icon-check", "check", "#27ae60"),
        ("icon-close", "close", "#e74c3c"),
        ("icon-arrow-right", "arrow-right", "#3498db"),
        ("icon-arrow-left", "arrow-left", "#3498db"),
        ("icon-play", "play", "#27ae60"),
        ("icon-pause", "pause", "#f39c12"),
        ("icon-home", "home", "#667eea"),
        ("icon-user", "user", "#9b59b6"),
        ("icon-settings", "settings", "#95a5a6"),
        ("icon-search", "search", "#34495e"),
        ("icon-trophy", "trophy", "#f1c40f"),
        ("icon-gift", "gift", "#e91e63"),
        ("icon-gamepad", "gamepad", "#667eea"),
    ]

    for name, icon_type, color in icons:
        generator.generate_icon(name, icon_type, size=24, color=color)

    # 生成自定义图标示例
    print("\n✏️  生成自定义图标...")
    custom_path = '<circle cx="12" cy="12" r="10" fill="#667eea"/><path d="M8 12 L11 15 L16 9" stroke="white" stroke-width="2" fill="none"/>'
    generator.generate_custom_icon("icon-custom-check", custom_path)

    print("\n" + "=" * 50)
    print(f"✅ 所有 SVG 图标已生成到: {generator.output_dir}")
    print("\n💡 提示：SVG 图标可以在网页中直接使用，支持缩放不失真")


if __name__ == "__main__":
    main()

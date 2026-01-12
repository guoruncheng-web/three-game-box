#!/usr/bin/env python3
"""
UI 图片生成工具 (FFmpeg 版本)
使用 FFmpeg 命令生成游戏 UI 所需的图标、按钮、背景等图片资源

依赖：
    - ffmpeg (需要系统已安装)
    检查: ffmpeg -version
"""

import subprocess
import os
import sys
from typing import Tuple, Optional


class FFmpegUIGenerator:
    """基于 FFmpeg 的 UI 图片生成器"""

    def __init__(self, output_dir: str = "public/images/generated"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self._check_ffmpeg()

    @staticmethod
    def _check_ffmpeg():
        """检查 FFmpeg 是否已安装"""
        try:
            subprocess.run(
                ["ffmpeg", "-version"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Error: FFmpeg not found!")
            print("Please install FFmpeg first:")
            print("  macOS: brew install ffmpeg")
            print("  Ubuntu/Debian: sudo apt-get install ffmpeg")
            print("  Windows: Download from https://ffmpeg.org/download.html")
            sys.exit(1)

    def generate_solid_color(
        self,
        name: str,
        width: int = 400,
        height: int = 300,
        color: str = "#667eea"
    ) -> str:
        """
        生成纯色图片

        Args:
            name: 文件名（不含扩展名）
            width: 宽度
            height: 高度
            color: 颜色（十六进制，如 #667eea）

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.png")

        # 转换颜色格式（去除 #）
        color = color.lstrip('#')

        # FFmpeg 命令：生成纯色图片
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", f"color=c=0x{color}:size={width}x{height}:duration=0.1",
            "-frames:v", "1",
            "-y",  # 覆盖已存在的文件
            filepath
        ]

        self._run_command(cmd, f"Generating solid color: {name}")
        return filepath

    def generate_gradient(
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
        filepath = os.path.join(self.output_dir, f"{name}.png")

        # 转换颜色格式
        c1 = color_start.lstrip('#')
        c2 = color_end.lstrip('#')

        # 根据方向选择渐变参数
        if direction == "horizontal":
            gradient_type = "x0=0:x1=w"
        elif direction == "diagonal":
            gradient_type = "x0=0:y0=0:x1=w:y1=h"
        else:  # vertical
            gradient_type = "y0=0:y1=h"

        # FFmpeg 滤镜：生成渐变
        filter_complex = f"""
        color=c=black:s={width}x{height}:d=0.1[base];
        [base]geq='
            r=lerp(0x{c1[0:2]}, 0x{c2[0:2]}, {self._get_lerp_expr(direction, width, height)}):
            g=lerp(0x{c1[2:4]}, 0x{c2[2:4]}, {self._get_lerp_expr(direction, width, height)}):
            b=lerp(0x{c1[4:6]}, 0x{c2[4:6]}, {self._get_lerp_expr(direction, width, height)})
        '[out]
        """.replace('\n', '').strip()

        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", "color=c=black:s={}x{}:d=0.1".format(width, height),
            "-filter_complex", filter_complex,
            "-map", "[out]",
            "-frames:v", "1",
            "-y",
            filepath
        ]

        self._run_command(cmd, f"Generating gradient: {name}")
        return filepath

    def generate_rounded_rect(
        self,
        name: str,
        width: int = 200,
        height: int = 60,
        color: str = "#667eea",
        radius: int = 15
    ) -> str:
        """
        生成圆角矩形

        Args:
            name: 文件名（不含扩展名）
            width: 宽度
            height: 高度
            color: 颜色
            radius: 圆角半径

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.png")
        c = color.lstrip('#')

        # 使用 drawbox 滤镜创建圆角矩形
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", f"color=c=0x00000000:size={width}x{height}:duration=0.1",
            "-vf", f"drawbox=x=0:y=0:w={width}:h={height}:color=0x{c}FF:t=fill",
            "-frames:v", "1",
            "-y",
            filepath
        ]

        self._run_command(cmd, f"Generating rounded rect: {name}")
        return filepath

    def generate_circle(
        self,
        name: str,
        size: int = 64,
        color: str = "#667eea"
    ) -> str:
        """
        生成圆形图标

        Args:
            name: 文件名（不含扩展名）
            size: 尺寸（直径）
            color: 颜色

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.png")
        c = color.lstrip('#')

        # 创建透明背景 + 圆形
        radius = size // 2
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", f"color=c=0x00000000:size={size}x{size}:duration=0.1",
            "-vf", f"drawbox=x={radius}:y={radius}:w=1:h=1:color=0x{c}FF:t=fill,geq='alpha=if(hypot(X-{radius},Y-{radius})<{radius},255,0)'",
            "-frames:v", "1",
            "-y",
            filepath
        ]

        self._run_command(cmd, f"Generating circle: {name}")
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
            text: 显示的文字

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.png")
        c = bg_color.lstrip('#')

        if text is None:
            text = f"{width}x{height}"

        # 生成带文字的占位图
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", f"color=c=0x{c}:size={width}x{height}:duration=0.1",
            "-vf", f"drawtext=text='{text}':fontcolor=gray:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2",
            "-frames:v", "1",
            "-y",
            filepath
        ]

        self._run_command(cmd, f"Generating placeholder: {name}")
        return filepath

    def combine_images(
        self,
        name: str,
        images: list,
        layout: str = "horizontal"
    ) -> str:
        """
        合并多个图片

        Args:
            name: 输出文件名
            images: 图片路径列表
            layout: 布局方式 (horizontal, vertical)

        Returns:
            生成的文件路径
        """
        filepath = os.path.join(self.output_dir, f"{name}.png")

        if not images:
            print("❌ Error: No images to combine")
            return filepath

        # 构建 FFmpeg 输入
        inputs = []
        for img in images:
            inputs.extend(["-i", img])

        # 构建滤镜
        if layout == "horizontal":
            filter_str = f"hstack=inputs={len(images)}"
        else:  # vertical
            filter_str = f"vstack=inputs={len(images)}"

        cmd = ["ffmpeg"] + inputs + [
            "-filter_complex", filter_str,
            "-y",
            filepath
        ]

        self._run_command(cmd, f"Combining images: {name}")
        return filepath

    @staticmethod
    def _get_lerp_expr(direction: str, width: int, height: int) -> str:
        """获取渐变插值表达式"""
        if direction == "horizontal":
            return "X/W"
        elif direction == "diagonal":
            return "(X+Y)/(W+H)"
        else:  # vertical
            return "Y/H"

    @staticmethod
    def _run_command(cmd: list, description: str = ""):
        """运行 FFmpeg 命令"""
        try:
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
                text=True
            )
            if description:
                print(f"✓ {description}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error: {description}")
            print(f"Command: {' '.join(cmd)}")
            print(f"Error: {e.stderr}")
            sys.exit(1)


def main():
    """主函数 - 演示用法"""
    generator = FFmpegUIGenerator()

    print("🎨 UI 图片生成工具 (FFmpeg 版本)")
    print("=" * 50)

    # 生成纯色图标
    print("\n📦 生成图标...")
    generator.generate_circle("icon-purple", size=64, color="#667eea")
    generator.generate_circle("icon-yellow", size=64, color="#f1c40f")
    generator.generate_circle("icon-red", size=64, color="#e74c3c")
    generator.generate_circle("icon-orange", size=64, color="#f39c12")

    # 生成按钮背景
    print("\n🔘 生成按钮...")
    generator.generate_rounded_rect("btn-primary-bg", width=200, height=60, color="#667eea")
    generator.generate_rounded_rect("btn-secondary-bg", width=200, height=60, color="#4ecdc4")
    generator.generate_rounded_rect("btn-danger-bg", width=200, height=60, color="#e74c3c")

    # 生成渐变背景
    print("\n🌈 生成渐变背景...")
    generator.generate_gradient("bg-purple-gradient", 800, 600, "#667eea", "#764ba2", "vertical")
    generator.generate_gradient("bg-ocean-gradient", 800, 600, "#4ecdc4", "#556270", "diagonal")
    generator.generate_gradient("bg-sunset-gradient", 800, 600, "#ff6b9d", "#ffa726", "horizontal")

    # 生成占位图
    print("\n🖼️  生成占位图...")
    generator.generate_placeholder("placeholder-400x300", 400, 300)
    generator.generate_placeholder("placeholder-game-cover", 500, 500, "#e0e0e0", "Game Cover")

    # 生成纯色背景
    print("\n🎨 生成纯色背景...")
    generator.generate_solid_color("bg-light-gray", 800, 600, "#f8f9fa")
    generator.generate_solid_color("bg-purple", 800, 600, "#667eea")

    print("\n" + "=" * 50)
    print(f"✅ 所有图片已生成到: {generator.output_dir}")
    print("\n💡 提示：可以使用图片编辑工具添加 emoji 或文字")


if __name__ == "__main__":
    main()

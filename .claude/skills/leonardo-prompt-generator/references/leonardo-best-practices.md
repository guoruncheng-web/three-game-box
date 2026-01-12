# Leonardo.ai 提示词最佳实践

## Leonardo.ai 平台特点

Leonardo.ai 是一个强大的AI图像生成平台，特别擅长：
- 高质量的角色设计和人物肖像
- 游戏资产和概念艺术
- 产品设计和3D渲染风格
- 一致性角色生成

## 提示词结构

### 基础结构
```
[主题] + [风格] + [细节描述] + [技术参数] + [质量标签]
```

### 推荐顺序
1. **主体描述** - 要生成什么（角色、场景、物体）
2. **风格定义** - 艺术风格、渲染风格
3. **细节元素** - 颜色、光照、材质、氛围
4. **构图和视角** - 镜头角度、取景方式
5. **质量增强** - 质量关键词

## 风格关键词

### 通用风格
- `digital art` - 数字艺术
- `concept art` - 概念艺术
- `3D render` - 3D渲染
- `photorealistic` - 照片写实
- `anime style` - 动漫风格
- `pixel art` - 像素艺术
- `watercolor` - 水彩
- `oil painting` - 油画

### 游戏相关风格
- `game asset` - 游戏资产
- `isometric view` - 等距视角
- `mobile game art` - 手游美术
- `casual game style` - 休闲游戏风格
- `RPG character design` - RPG角色设计
- `UI icon` - UI图标

### 特殊效果
- `volumetric lighting` - 体积光
- `rim lighting` - 边缘光
- `god rays` - 上帝光线
- `depth of field` - 景深
- `motion blur` - 动态模糊
- `glow effect` - 发光效果

## 质量增强关键词

### 高质量通用标签
```
masterpiece, best quality, high resolution, extremely detailed,
professional, sharp focus, crisp details, 8k, HD
```

### 特定用途
- **角色设计**: `character sheet, multiple views, turnaround, reference sheet`
- **背景**: `wide shot, environment design, atmospheric, cinematic`
- **物品**: `product photography, studio lighting, clean background`
- **UI元素**: `flat design, vector art, clean lines, minimalist`

## Leonardo.ai 特定技巧

### 1. 使用否定提示词 (Negative Prompts)
避免不想要的元素：
```
blurry, low quality, distorted, deformed, ugly, bad anatomy,
watermark, signature, text, cropped, out of frame
```

### 2. 权重控制
使用括号增强或减弱某些元素：
- `(keyword)` - 轻微增强（1.1x）
- `((keyword))` - 中等增强（1.21x）
- `(keyword:1.5)` - 精确控制权重

### 3. 模型选择建议
- **Leonardo Diffusion XL** - 通用高质量
- **Leonardo Vision XL** - 照片级写实
- **Leonardo Anime XL** - 动漫风格
- **Leonardo Kino XL** - 电影级质量
- **3D Animation Style** - 3D角色和场景

## 针对不同类型的提示词模板

### 游戏角色
```
[character type], [style], [pose/action], [clothing description],
[color palette], [expression], character design, reference sheet,
clean background, [lighting], high quality, detailed
```

### 游戏背景
```
[scene type], [environment], [time of day], [weather/atmosphere],
[color scheme], [perspective], environment design, game background,
[mood], detailed, high resolution
```

### 游戏UI图标
```
[object], game icon, [style], centered composition, clean background,
[color scheme], flat design, vector art, simple, recognizable,
mobile game UI, [size] icon
```

### 游戏物品/道具
```
[item name], [material], [style], isometric view OR front view,
game asset, detailed texture, clean background, professional lighting,
high quality render, [theme/setting]
```

## 常见问题和解决方案

### 问题：生成的图片模糊
解决：添加 `sharp focus, high resolution, extremely detailed, crisp`

### 问题：角色面部变形
解决：添加 `beautiful face, perfect anatomy, symmetrical features`
否定词：`deformed, distorted, bad anatomy`

### 问题：颜色不协调
解决：指定明确的配色方案，如 `pastel color palette` 或 `warm colors, orange and pink tones`

### 问题：风格不一致
解决：在提示词开头明确指定单一风格，并使用权重加强

## 示例：水果消消乐游戏资产

### 游戏背景
```
Cute fruit-themed game background, soft gradient from pink to purple,
floating bubbles, kawaii style, cartoon fruits decorations on corners,
dreamy atmosphere, pastel colors, mobile game background,
clean center area for gameplay, whimsical, cheerful mood,
soft lighting, high quality, detailed
```

### 水果图标
```
Cute cartoon [fruit name], 3D style, glossy surface with highlights,
simple rounded shape, game icon, mobile game art, bright colors,
white outline, friendly expression, clean white background,
centered composition, isometric view, high quality render
```

### UI元素
```
Game UI button, rounded rectangle shape, gradient from [color1] to [color2],
soft shadow, glossy effect, cute style, mobile game interface,
clean design, modern, [size], high quality
```

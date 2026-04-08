# 炸金花游戏前端资源 - AI 图片提示词

> 平台：Leonardo.ai
> 风格：中国风 + 赛博朋克暗色系
> 用途：移动端 PWA 游戏
> 背景要求：透明背景（除游戏桌面和大厅背景外）
> 推荐模型：Leonardo Diffusion XL / Leonardo Kino XL

### 中文提示词（通义万相 / 即梦 / 可灵等）

- **国内模型**通常对 **中文描述** 友好，可直接用中文写主体、风格、禁忌；也可 **中英混用**（如「中国风赛博朋克，transparent background」）。
- 本文各节以 **英文** 为主（便于 Leonardo / 复用），需要时在对应小节下找 **「Positive（中文）」「Negative（中文）」**；未单独翻译的章节，可把英文 Positive/Negative **意译** 为中文使用，语义不变即可。
- 负面词建议始终包含：**不要文字、不要水印、不要变形**；需要透明底时加 **透明背景、不要白底**。

### 尺寸比例与生成工具预设（画面设置）

在 Leonardo、通义万相等平台的 **「画面设置 / 尺寸比例」** 中，优先选与目标资源一致的 **比例**，再选接近的 **像素档位**（各平台命名可能为 `1152×896`、`1344×768` 等）。

| 资源类型 | 建议比例 | 示例分辨率（可与工具预设对齐） | 说明 |
|----------|----------|-------------------------------|------|
| 二次确认弹窗底图 `dialog_bg.png` | **4:3** | **1152×896**（项目现网尺寸） | 横版 ornate 框，与弹层 `aspect-ratio: 1152/896` 一致 |
| 玩法说明弹窗背景（第 24 节） | **9:16** | **768×1344**、720×1280、1080×1920 | 竖长全幅出血，金框贴齐左右边缘，避免两侧黑条 |
| 玩法说明仅顶部装饰条 | **16:9** 或 **21:9** | 1344×768、宽条横图 | 只铺顶栏时裁切或单独出图 |
| 需要正方图标/小图 | **1:1** | 1024×1024 | 筹码、头像框等见各节 |
| **返回按钮图标**（第 25 节） | **1:1** | 256×256 或 512×512 | 透明底 PNG，前端可 `Image` 24～48dp |
| **大厅主按钮「人机对战」**（第 26-A 节） | 约 **5:1～6:1** 横条 | 640×120、720×128 | 橙金渐变圆角条，**无字**，前端叠文案 |
| **大厅「加入」侧按钮**（第 26-B 节） | **1:1** | 256×256、320×320 | 与主按钮同系小方钮，**无字** |

生成后再按前端实际用 `cover`/`contain` 做轻微裁切即可；**比例比绝对像素更重要**。

---

## 1. 游戏大厅背景

> 尺寸建议：1080x1920（竖屏移动端）

**Positive:**
```
Chinese poker game lobby background, cyberpunk dark style with traditional Chinese elements,
deep dark navy blue and black gradient base, ((neon red and gold accents)),
ancient Chinese palace architecture silhouette with neon outlines,
floating holographic poker cards and golden coins in the air,
dragon motifs with glowing cyberpunk neon traces, lantern-shaped neon lights,
atmospheric fog and particle effects, volumetric lighting from above,
mobile game background, portrait orientation, clean center area for UI overlay,
decorative elements on top and bottom edges, cinematic depth,
masterpiece, best quality, extremely detailed, 8k, professional
```

**Negative:**
```
blurry, low quality, distorted, bright, white background, cartoon cute style,
watermark, text, cluttered center, realistic photo, daylight scene,
western style, simple, flat, pixelated
```

---

## 2. 游戏桌面背景

> 尺寸建议：1080x1920（竖屏）

**Positive:**
```
Top-down view poker game table, ((Chinese style with cyberpunk aesthetics)),
dark green velvet table surface with subtle golden Chinese cloud patterns,
ornate golden border with dragon motifs and neon glow edges,
dim ambient lighting with focused spotlight on table center,
dark background fading to black around edges, rich luxurious texture,
traditional Chinese lattice patterns integrated with circuit board lines,
subtle holographic grid overlay, mobile game table background,
portrait orientation, clean center for card placement,
masterpiece, high quality, extremely detailed, 8k
```

**Negative:**
```
blurry, low quality, bright, white, cartoon, realistic photo,
cluttered, busy pattern, western casino, red felt, watermark, text,
top text, distorted perspective
```

---

## 3. 扑克牌背面

> 尺寸建议：200x280（单张牌）| 透明背景

**Positive:**
```
Playing card back design, ((Chinese cyberpunk style)), transparent background,
dark red and gold color scheme, intricate traditional Chinese dragon pattern,
symmetrical design with neon circuit line accents, metallic gold border frame,
central circular motif with yin-yang symbol and glowing edges,
Chinese cloud and wave patterns intertwined with digital circuit traces,
premium luxury feel, glossy reflective surface, game asset,
front view, centered composition, sharp edges, crisp details,
high quality render, professional card design, 8k
```

**Negative:**
```
blurry, low quality, asymmetric, western pattern, simple, plain,
text, numbers, face card, white background, colored background,
cartoon style, pixelated, warped
```

---

## 4. 筹码 - 小额 (10)

> 尺寸建议：120x120 | 透明背景

**Positive:**
```
Single casino poker chip, ((Chinese cyberpunk style)), transparent background,
dark blue base color with silver neon edge glow, top-down slight angle view,
embossed Chinese coin pattern in center (square hole motif),
metallic texture with holographic shimmer, neon blue circuit line details,
stacked ridged edges, "10" engraved subtly, game icon asset,
centered composition, clean isolated object, isometric view,
high quality 3D render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, multiple chips, background, flat, cartoon,
realistic photo, western design, red color, watermark, text overlay
```

---

## 5. 筹码 - 中额 (100)

> 尺寸建议：120x120 | 透明背景

**Positive:**
```
Single casino poker chip, ((Chinese cyberpunk style)), transparent background,
rich crimson red base color with golden neon edge glow, top-down slight angle view,
embossed Chinese dragon coin pattern in center,
metallic texture with holographic gold shimmer, neon gold circuit line details,
stacked ridged edges, "100" engraved subtly, game icon asset,
centered composition, clean isolated object, isometric view,
high quality 3D render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, multiple chips, background, flat, cartoon,
realistic photo, western design, watermark, text overlay
```

---

## 6. 筹码 - 大额 (1000)

> 尺寸建议：120x120 | 透明背景

**Positive:**
```
Single casino poker chip, ((Chinese cyberpunk premium style)), transparent background,
black and gold base color with bright golden neon edge glow, top-down slight angle view,
embossed imperial Chinese phoenix pattern in center,
premium metallic texture with holographic rainbow shimmer, neon gold and purple circuit details,
stacked ridged edges, "1K" engraved with glow, game icon asset,
centered composition, clean isolated object, isometric view,
high quality 3D render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, multiple chips, background, flat, cartoon,
realistic photo, western design, simple, plain, watermark
```

---

## 7. 玩家头像框

> 尺寸建议：160x160 | 透明背景

**Positive:**
```
Circular avatar frame border, ((Chinese cyberpunk ornate style)), transparent background,
dark metallic frame with golden dragon motifs wrapping around circle,
neon red and gold glowing edges, intricate Chinese lattice corner decorations,
circuit board trace patterns integrated into traditional design,
empty transparent center for avatar photo, subtle particle effects around frame,
holographic shimmer on metal surface, game UI element,
front view, centered, clean isolated asset,
high quality render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, face, person, photo inside, solid background,
simple circle, plain, western style, cartoon, pixelated, text
```

---

## 8. VIP 玩家头像框

> 尺寸建议：160x160 | 透明背景

**Positive:**
```
Premium VIP circular avatar frame, ((Chinese imperial cyberpunk style)), transparent background,
black and gold metallic frame with twin dragons flanking top crown ornament,
bright neon gold and purple glowing edges, imperial jade accents,
ornate Chinese cloud scrollwork with circuit patterns,
empty transparent center for avatar, floating golden particles,
holographic premium material, luminous gem stones at cardinal points,
game UI premium element, front view, centered, clean isolated asset,
high quality render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, face, person, solid background, simple,
plain circle, western crown, cartoon, cheap looking, pixelated
```

---

## 9. 操作按钮 - 跟注 (CALL)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI action button "CALL", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from dark teal #00695c to neon cyan #00e5ff,
metallic border with subtle golden Chinese pattern trim,
glossy surface with neon glow effect, inner text area,
cyberpunk circuit line accents on edges, slight 3D beveled effect,
mobile game interface button, centered composition,
modern premium design, high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat boring, cartoon cute,
realistic, 3D excessive, text, watermark, complex, busy
```

---

## 10. 操作按钮 - 加注 (RAISE)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI action button "RAISE", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from deep amber #e65100 to neon orange #ff9100,
metallic border with subtle golden dragon trim,
glossy surface with fiery neon glow effect, inner text area,
cyberpunk circuit line accents, slight 3D beveled effect with upward arrow motif,
mobile game interface button, centered composition,
modern premium design, high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat, cartoon, realistic,
text, watermark, complex, busy, dull colors
```

---

## 11. 操作按钮 - 弃牌 (FOLD)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI action button "FOLD", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from dark grey #37474f to muted steel #78909c,
metallic border with subtle silver Chinese pattern trim,
matte surface with dim neon glow, slightly desaturated look,
cyberpunk circuit line accents fading out, slight 3D beveled effect,
mobile game interface button, centered composition,
modern premium design, high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, bright colorful, cartoon,
realistic, text, watermark, complex, busy, vibrant
```

---

## 12. 操作按钮 - 看牌 (LOOK)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI action button "LOOK", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from deep purple #4a148c to neon violet #e040fb,
metallic border with subtle golden eye motif trim,
glossy surface with mystical neon purple glow, eye symbol accent,
cyberpunk circuit line accents, slight 3D beveled effect,
mobile game interface button, centered composition,
modern premium design, high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat, cartoon, realistic,
text, watermark, complex, busy, dull
```

---

## 13. 操作按钮 - 比牌 (COMPARE)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI action button "COMPARE", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from dark crimson #b71c1c to neon red #ff1744,
metallic border with crossed swords Chinese motif trim,
glossy surface with intense red neon glow, VS battle symbol accent,
cyberpunk circuit line accents with spark effects, slight 3D beveled effect,
mobile game interface button, centered composition,
modern premium design, high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat, cartoon, realistic,
text, watermark, complex, busy, peaceful, calm
```

---

## 14. 操作按钮 - 全押 (ALL IN)

> 尺寸建议：240x80 | 透明背景

**Positive:**
```
Game UI premium action button "ALL IN", ((Chinese cyberpunk style)), transparent background,
rounded rectangle shape, gradient from black #000000 to deep gold #ffd600,
ornate metallic golden border with Chinese imperial dragon trim,
glossy surface with intense golden neon glow and particle sparks,
cyberpunk circuit lines blazing with energy, strong 3D beveled effect,
flame-like energy emanating from edges, mobile game interface button,
centered composition, premium luxurious design,
high quality render, sharp edges, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat, cartoon, realistic,
text, watermark, simple, plain, dull, cheap looking
```

---

## 15. 牌型展示 - 豹子 (Triple/Three of a Kind)

> 尺寸建议：400x200 | 透明背景

**Positive:**
```
"Triple" poker hand type display banner, ((Chinese cyberpunk style)), transparent background,
three identical glowing poker cards fanning out with golden light burst behind,
dark background with ((intense golden neon explosion effect)),
Chinese characters floating with holographic effect,
dragon silhouette roaring behind cards, premium metallic text frame,
particle sparks and energy waves, dramatic lighting,
game UI victory banner element, centered composition,
high quality render, extremely detailed, 8k
```

**Negative:**
```
blurry, low quality, solid background, simple, plain, cartoon cute,
realistic photo, text heavy, cluttered, dull, flat lighting
```

---

## 16. 牌型展示 - 顺金 (Straight Flush)

> 尺寸建议：400x200 | 透明背景

**Positive:**
```
"Straight Flush" poker hand type display banner, ((Chinese cyberpunk style)), transparent background,
three sequential same-suit glowing poker cards in elegant fan arrangement,
((neon cyan and gold light streaks)) flowing through cards like energy,
Chinese phoenix silhouette behind with holographic wings,
electric circuit lightning effects connecting cards, premium metallic frame,
particle aurora and energy ribbons, dramatic cinematic lighting,
game UI victory banner element, centered composition,
high quality render, extremely detailed, 8k
```

**Negative:**
```
blurry, low quality, solid background, simple, plain, cartoon,
realistic, dull, flat, cluttered, text heavy
```

---

## 17. 牌型展示 - 金花 (Flush)

> 尺寸建议：400x200 | 透明背景

**Positive:**
```
"Flush" poker hand type display banner, ((Chinese cyberpunk style)), transparent background,
three same-suit glowing poker cards with flower petal particle effects,
((neon purple and pink light bloom)) radiating from cards,
Chinese lotus flower motif behind with neon outlines,
holographic shimmer and floating petals, metallic frame border,
soft energy glow and sparkle particles, elegant lighting,
game UI banner element, centered composition,
high quality render, extremely detailed, 8k
```

**Negative:**
```
blurry, low quality, solid background, simple, cartoon, realistic,
dull, flat, cluttered, aggressive, dark only
```

---

## 18. 胜利特效弹窗背景

> 尺寸建议：600x400 | 透明背景

**Positive:**
```
Victory celebration popup frame, ((Chinese cyberpunk style)), transparent background,
ornate golden frame with dragon and phoenix motifs on top corners,
dark translucent inner panel with holographic shimmer,
neon gold and red energy burst from center, Chinese coin shower effect,
circuit pattern borders glowing with golden light,
floating golden particles and sparkle effects around frame,
traditional Chinese scroll shape with cyberpunk modifications,
game UI popup overlay, centered composition, premium luxurious feel,
high quality render, extremely detailed, 8k
```

**Negative:**
```
blurry, low quality, solid opaque background, simple rectangle,
cartoon, realistic photo, plain, cheap, western style, text
```

---

## 19. 筹码堆/奖池显示框

> 尺寸建议：300x150 | 透明背景

**Positive:**
```
Poker chip pot display container, ((Chinese cyberpunk style)), transparent background,
stacked casino chips in golden tray with neon glow,
dark metallic tray with Chinese cloud engravings and circuit traces,
holographic number display floating above chips,
neon golden rim light around tray edges, scattered golden particles,
isometric view, game UI element, centered composition,
high quality 3D render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, solid background, flat 2D, cartoon,
realistic photo, western style, simple, plain, text
```

---

## 20. 倒计时/操作提示框

> 尺寸建议：200x200 | 透明背景

**Positive:**
```
Circular countdown timer UI element, ((Chinese cyberpunk style)), transparent background,
dark metallic ring with neon cyan glowing progress arc,
Chinese bagua (八卦) inspired octagonal inner design,
holographic center area for timer digits, circuit trace decorations,
pulsing neon glow animation suggestion, tick marks around circle,
subtle golden accent details, game UI timer element,
front view, centered composition, clean isolated asset,
high quality render, sharp details, 8k
```

**Negative:**
```
blurry, low quality, solid background, simple clock, cartoon,
realistic, western style, colorful, busy, text, numbers
```

---

## 21. 游戏 Logo / 标题

> 尺寸建议：600x200 | 透明背景

**Positive:**
```
"Zha Jin Hua" game logo title, ((Chinese calligraphy cyberpunk fusion style)), transparent background,
bold Chinese characters "炸金花" with metallic golden texture and neon red edge glow,
cyberpunk circuit patterns flowing through brush strokes,
three glowing poker cards (A, K, Q) arranged behind text,
dragon silhouette integrated into character strokes,
holographic shimmer and golden particle effects,
dark cinematic lighting with dramatic rim light,
game title logo, centered composition, premium design,
high quality render, extremely detailed, sharp, 8k
```

**Negative:**
```
blurry, low quality, solid background, simple text, plain font,
cartoon cute, realistic photo, English text only, western style,
small, thin lines, dull colors
```

---

## 22. 发牌动效帧 - 牌飞出效果

> 尺寸建议：300x200 | 透明背景

**Positive:**
```
Flying poker card with motion trail, ((Chinese cyberpunk style)), transparent background,
single poker card face-down flying diagonally with speed lines,
neon cyan motion blur trail behind card, energy spark particles,
card back showing Chinese dragon pattern with neon glow,
dynamic action pose, speed and energy feeling,
circuit trace light streaks following card path,
game animation frame asset, centered composition,
high quality render, sharp details, dynamic, 8k
```

**Negative:**
```
blurry, low quality, solid background, static, still, no motion,
cartoon, realistic, multiple cards, face up, text, watermark
```

---

## 23. 座位标记 - 空座/等待中

> 尺寸建议：120x120 | 透明背景

**Positive:**
```
Empty seat placeholder icon, ((Chinese cyberpunk minimal style)), transparent background,
circular dark metallic frame with dim neon blue dotted border,
plus sign (+) in center with soft cyan glow, "join" invitation feel,
subtle Chinese pattern watermark in background of circle,
circuit trace accents, slightly pulsing glow suggestion,
game UI seat marker, front view, centered, clean isolated,
high quality render, sharp details, 8k
```

**Negative:**
```
blurry, low quality, solid background, person, avatar, face,
bright, colorful, busy, complex, cartoon, realistic, text
```

---

## 24. 玩法说明弹窗背景

> **用途：** 炸金花「玩法说明」底部弹层（`ZhajinhuaGuidePopup`）整面板底图；与二次确认弹窗 `dialog_bg.png` 同系：**深色鎏金雕花外框 + 中间深色内容区**。前端常用 **`background-size: cover`** 铺满宽度，故素材需 **左右贴边、全幅出血**，避免出现两侧黑边或窄框外留白。  
> **尺寸建议：** **9:16** 竖幅（与现网 `public/zhajinhua/rule_bg.png` 参考 **768×1344** 一致）；生成工具可选 **720×1280、1080×1920、768×1344**。构图以 **画幅左右边缘即为金色外框外沿** 为准。  
> **导出：** **不透明 PNG**；外圈可为纯黑以便融进蒙层，但 **不要在画面左右留空黑条**——装饰框应撑满整宽。

> **常见坑：生成图出现左右黑边（黑条）**  
> - **原因：** 模型按「电影宽银幕」或「中间一块 UI」输出，在 **9:16 画布** 左右留了 **matte / letterbox**；或装饰框只画了中间一截，两侧未画到边。  
> - **提示词上：** 下述 Positive 已加 **full canvas coverage / every pixel filled with art / no matte**；Negative 已加 **cinematic black bars、21:9、pillarbox** 等。可再叠一句：**「整幅 9:16 竖图，无任何左右黑边，金属边框贴齐画布最左最右像素」**。  
> - **出图后：** 用修图软件 **左右各裁掉 2%～5%** 黑条；或用平台 **扩图/Outpaint** 向两侧补画框；或用 **16:9 出图再裁成 9:16** 有时反而更稳（视模型而定）。  
> - **前端：** 工程里已用 `cover` + **与框内深色接近的实色底**（填充素材里透明像素），若仍有缝可略提高 `background-size` 或 **换无透明缝素材**。

> **常见坑：上中下「宽度」不一致、侧沿有空隙（透明棋盘格）**  
> - **现象：** 左右装饰在 **顶部、中部、底部** 外凸程度不同，最外侧竖边不是一条直线，或 **PNG 带透明通道**，与弹层叠放时出现 **透明缝隙**（棋盘格）。  
> - **提示词上：** 要求 **左右外轮廓为两条平行竖线**（从顶到底对齐），**上中下段最外侧像素对齐**，不要「只有四角外凸、中段内凹」；并写明 **fully opaque PNG, no transparency, no alpha holes along edges**。  
> - **出图后：** 在修图软件里 **合并为不透明图层**，用 **与金框相近的深青灰** 填满侧缘透明区；或 **向外侧轻微扩边 3～8px** 再压平。  
> - **前端：** `background-color` 使用与内板接近的 **#162a30** 一类色，可减轻透明缝观感（见 `ZhajinhuaGuidePopup`）。

**Positive:**
```
Full-bleed vertical mobile game panel background, ((Chinese fantasy "Zha Jin Hua" poker UI)),
strict portrait 9:16 canvas, ((every pixel of the image must be filled with opaque artwork)) — no transparency, no alpha channel holes, no checkerboard gaps,
((the outermost left silhouette and outermost right silhouette must be two straight parallel vertical lines)) from top to bottom — consistent border width, no staggered profile where top/bottom corners stick out wider than the middle section,
the ((ornate gold and bronze carved frame)) MUST touch the extreme left and extreme right edges — no pillarboxing, no letterboxing, no side gutters,
not a cinematic widescreen composition — this is a full mobile UI panel, not a movie frame with black bars,
thick symmetrical decorative metal borders on left, right, and bottom; dragon or imperial seal motif at top center (abstract silhouette, no readable text),
inner field: dark navy charcoal vertical wood grain or brushed stone texture, subtle vignette, warm rim light from top,
thin double golden pinstripe inset border, premium 3D metallic bevel, cyberpunk neon gold edge highlights,
large calm dark central area reserved for scrolling rules text, uncluttered middle, no icons or buttons,
export as fully opaque image, masterpiece, sharp focus, 8k, game UI matte painting, seamless left and right edges, rectangular outer bounding box
```

**Negative:**
```
blurry, low quality, watermark, readable text, letters, numbers, logo,
transparency, alpha channel, semi-transparent edges, checkerboard, transparent gaps along left or right edge,
wavy side outline, inconsistent frame width between top middle and bottom, corner ornaments wider than mid-section side rails,
black vertical bars on sides, cinematic letterbox, movie aspect ratio 21:9, ultra-wide matte,
empty black regions on sides, pillarbox, narrow UI panel floating on pure black background,
UI screenshot, fake buttons, playing cards and chips as hero subject, cluttered center, pure white background, cartoon kids style,
western Vegas neon only, asymmetric frame, fisheye, tilted perspective, cropped frame
```

**Positive（中文）:**
```
竖屏 9:16 手机游戏「玩法说明」全幅面板背景，中国风幻想炸金花界面，
整张图 **完全不透明**，不要透明通道、不要边缘透明像素、不要棋盘格缝隙，
**左右最外侧轮廓必须是两条笔直、平行的竖线**（从上到下一刀齐），上段/中段/下段 **外沿宽度一致**，不要四角外凸、中段内凹造成侧缝，
（鎏金与古铜色立体雕花金属框）紧贴画布最左、最右边缘，不要左右黑边、不要中间窄条浮在大黑底上，
不是电影截图，不要 21:9 超宽加黑边，
左右与下沿为厚重对称雕花，顶部正中可有龙首或玺印感装饰（抽象剪影，无可读文字），
内区为深炭灰至藏青竖向木纹或拉丝石纹，略有过曝的顶侧暖光，
内圈细双道金线勾边，赛博霓虹金边高光，3D 金属倒角，
中间留出大块干净深色区域专供叠字与滚动，中心不要放按钮和图标，
外轮廓为规整矩形，全幅出血，8K，清晰锐利
```

**Negative（中文）:**
```
模糊，低质量，水印，可读文字，字母数字，商标，
透明底，半透明边，棋盘格透明，左右边缘透明洞，
左右外轮廓波浪形、上中下宽度不一致、四角外凸中段内缩，
左右黑条，电影宽银幕黑边，21:9 加黑边，上下大黑边，
画面左右纯黑留白，中间窄条浮在黑底上，Pillarbox 黑边，
界面截图，假按钮，扑克牌或筹码作为画面主体占满中心，中心杂乱，
纯白底，低幼卡通，真人，纯拉斯维加斯霓虹，
画框不对称，鱼眼，倾斜透视，画框被裁切
```

---

## 25. 返回按钮图标

> **用途：** 炸金花及游戏盒内左上角「返回上一页 / 大厅」的图标按钮贴图；项目内见 **`public/zhajinhua/back.png`**（`zjhAssets.backButton`，`next/image` 常用 24×24～48×48 显示，源图宜 2～4 倍分辨率）。  
> **尺寸建议：** **1:1**，导出 **256×256** 或 **512×512**（或 1024×1024 再缩小）。  
> **格式：** **透明背景 PNG**；箭头为主体，避免整张图铺满不透明底，便于叠在圆角按钮或毛玻璃上。

**Positive:**
```
Game UI back navigation icon, ((Chinese cyberpunk style)), transparent background,
left-pointing chevron or arrow glyph, bold readable silhouette,
metallic silver-white or pale gold arrow with subtle neon cyan or amber edge glow,
thin traditional Chinese cloud or circuit trace ornament hugging the arrow (optional, minimal),
rounded soft stroke caps, centered in square canvas with safe padding margin,
no circle plate, no filled square button background — icon only floating on alpha,
high contrast for dark UI header, mobile game HUD icon asset,
clean vector-like edges, crisp anti-aliased, front view, symmetrical vertical balance,
high quality render, sharp details, professional, 8k
```

**Negative:**
```
blurry, low quality, opaque square background, filled circle button, 3D extruded block,
text, letters, watermark, realistic photo, hand, finger,
multiple arrows, curved back icon, western style only, cartoon cute, cluttered,
bright white solid background, colored backdrop, drop shadow as heavy blob
```

**Positive（中文）:**
```
游戏 UI 返回图标，中国风赛博朋克，透明背景，
朝左的尖角折线箭头或单箭头，轮廓清晰粗壮易辨认，
银白或淡金色箭头，边缘带轻微霓虹青或琥珀色描边，
可点缀极细祥云或电路纹（可选，要少），
笔画端点圆润，在正方形画布内居中，四周留安全边距，
不要圆形底板，不要整块不透明方形按钮——仅箭头悬浮在透明底上，
适合深色顶栏，高对比，手机游戏 HUD 小图标，
边缘锐利类似矢量，抗锯齿干净，正面平视，竖直方向平衡，
高清，细节清晰，专业，8K
```

**Negative（中文）:**
```
模糊，低质量，不透明方形底，实心圆形按钮，厚重 3D 挤出块，
文字，字母，水印，真人照片，手，手指，
多个箭头，弯曲返回符号，纯西式，低幼卡通，杂乱，
纯白实心底，彩色不透明底，大块脏阴影
```

---

## 26. 大厅主操作按钮（人机对战 / 加入）

> **用途：** 炸金花 **大厅**（lobby）底部主行动条：左侧宽幅 **「人机对战（练习）」**，房间号输入框右侧 **「加入」**。与界面一致：**亮橙至深橙纵向渐变**、大圆角、轻微立体与内发光；与 **「快速匹配」**（线框次要钮）形成主次对比。  
> **注意：** 出图 **不要带「人机对战」「加入」等文字**（文案由前端 `Button` 渲染，便于改字与多语言）。仅需 **按钮底板/质感**。  
> **格式：** **透明背景 PNG**（或与不透明橙底二选一，叠字时建议透明边）；可切 **9-slice** 时优先横条左右可拉伸中间区。

### 26-A 「人机对战（练习）」主按钮（宽幅）

> **尺寸建议：** 横条 **约 5:1～6:1**，如 **640×120**、**720×128**、**960×160**。

**Positive:**
```
Mobile game primary CTA button background only, ((Chinese fantasy cyberpunk casino lobby style)), transparent background,
wide horizontal rounded rectangle, large corner radius capsule-like shape,
((vertical gradient)) from vivid orange #ff8c42 to deep burnt orange #c2410c, subtle inner highlight along top edge,
soft 3D beveled extrusion, gentle inner glow, metallic gold micro-rim on outer edge optional,
premium glossy lacquer feel, centered empty area for text overlay — absolutely no text, no Chinese characters,
high-end mobile game UI asset, front orthographic view, sharp clean edges, 8k
```

**Negative:**
```
blurry, low quality, text, Chinese characters, English, numbers, watermark,
icons, playing cards, full lobby screenshot, secondary outline-only button style,
flat solid orange only, neon pink, western slot machine, cartoon sticker,
opaque white background, busy pattern inside button
```

**Positive（中文）:**
```
手机游戏主操作按钮底板（只要背景不要字），中国风幻想赛博赌场大厅，透明底，
横向宽圆角条，大圆角接近胶囊形，
亮橙色到深橙红纵向渐变，上沿略亮仿内高光，
轻微 3D 浮雕与内发光，外圈可极细金属金边（可选），
漆光质感，中间留白给程序叠字——绝对不要任何文字汉字英文，
高端手游 UI，正视扁平投影，边缘锐利，8K
```

**Negative（中文）:**
```
模糊，低质量，文字，汉字，英文，数字，水印，
图标，扑克，整张大厅截图，线框次要按钮样式，
纯平单色无渐变，玫红霓虹，西式老虎机，低幼贴纸，
白实底，按钮内部杂乱纹理
```

### 26-B 「加入」侧按钮（小方钮）

> **尺寸建议：** 近 **1:1**，如 **256×256**、**320×320**（显示尺寸小于主按钮，源图可略大）。

**Positive:**
```
Mobile game small square CTA button background only, ((same style as wide orange primary button)), transparent background,
rounded square shape, moderate corner radius, matching ((orange vertical gradient)) and bevel style,
compact tile next to input field, empty center for two-character text overlay — no text rendered in image,
consistent lighting with golden rim accent, premium mobile game UI, front view, crisp, 8k
```

**Negative:**
```
blurry, text, letters, watermark, different color scheme from orange primary,
circle only, long horizontal bar, huge size, cluttered, cartoon,
white background, icons, arrows
```

**Positive（中文）:**
```
与上面主按钮同系列的「小方钮」底板（不要字），透明底，
圆角方形，圆角适中，橙金纵向渐变与浮雕质感与 26-A 一致，
贴在输入框旁的小块按钮，中心留白叠两字——图中不要出现文字，
金边点缀可与主钮一致，正视，清晰，8K
```

**Negative（中文）:**
```
模糊，文字，水印，与主钮色差过大，
纯圆无边形，细长横条，尺寸过大像主钮，杂乱，低幼卡通，
白底，图标，箭头
```

---

## 通用负面提示词（适用于所有资源）

```
blurry, low quality, distorted, deformed, ugly, watermark, signature,
text overlay, cropped, out of frame, duplicate, mutation,
poorly drawn, jpeg artifacts, pixelated, noise, grain,
white background (用于需要透明背景的资源)
```

**通用负面提示词（中文，可与英文择一或混用）:**

```
模糊，低质量，变形，畸形，丑，水印，签名，
文字叠加，裁切出框，重复，突变，
绘制粗糙，jpeg 压缩伪影，像素化，噪点，颗粒感，
白底（需要透明背景时不要）
```

---

## Leonardo.ai 生成参数建议

| 参数 | 推荐值 |
|------|--------|
| 模型 | Leonardo Diffusion XL 或 Leonardo Kino XL |
| 图片尺寸 | 按各资源建议尺寸 |
| Guidance Scale | 7-9（越高越贴合提示词） |
| Steps | 30-50 |
| Scheduler | Euler / DPM++ 2M |
| 背景移除 | 生成后使用 Leonardo 内置的 Background Removal |

## 批量生成建议

1. **优先生成**：游戏桌面背景 → Logo → 扑克牌背面 → 筹码（3种）→ 牌桌操作按钮（6个）→ **返回图标**（第 25 节）→ **大厅主按钮人机对战 / 加入**（第 26 节，透明底无字）
2. **次优先**：头像框 → 牌型特效 → 胜利弹窗 → 奖池框 → **玩法说明弹窗背景**（第 24 节，与 `dialog_bg` 风格统一）
3. **最后**：动效帧 → 座位标记 → 倒计时器

## 色彩规范

| 元素 | 主色 | 辅色 | 发光色 |
|------|------|------|--------|
| 背景/桌面 | #0d1117 深黑 | #1a237e 深蓝 | - |
| 金色系 | #ffd600 金 | #ff8f00 暗金 | #ffea00 亮金 |
| 红色系 | #b71c1c 暗红 | #d32f2f 中红 | #ff1744 霓虹红 |
| 青色系 | #006064 深青 | #00838f 中青 | #00e5ff 霓虹青 |
| 紫色系 | #4a148c 深紫 | #7b1fa2 中紫 | #e040fb 霓虹紫 |

---

> **说明：** 英文提示词针对 Leonardo.ai 优化；使用通义万相等国内工具时可直接采用各节 **中文** 提示词或中英混写。生成后建议使用平台的抠图/去底功能获取透明背景 PNG。需要精确尺寸的 UI 元素可在生成后用图片编辑工具裁剪。

---

## 阿里云百炼（通义万相）批量生成（本项目脚本）

在 `.env.local` 中配置 `DASHSCOPE_API_KEY` 后，可用仓库脚本按**本文各节的 Positive/Negative** 调用万相 `wanx-v1`（异步任务），产出保存到 `public/images/generated/zhajinhua/`，并写入同目录 `manifest.json`。

```bash
pnpm run generate:zhajinhua-assets -- --dry-run
pnpm run generate:zhajinhua-assets -- --id=1
pnpm run generate:zhajinhua-assets -- --from=1 --to=5
```

万相仅支持少量固定分辨率，脚本会按「尺寸建议」映射到 `1024*1024` / `720*1280` / `1280*720`；透明底与精确裁切仍需后期处理。详见 `scripts/generate-zhajinhua-assets-bailian.mjs` 顶部注释。

英文文件名与游戏内 URL 对照见 **`docs/zhajinhua-asset-paths.md`**（与 `public/images/generated/zhajinhua/manifest.json` 同步）。

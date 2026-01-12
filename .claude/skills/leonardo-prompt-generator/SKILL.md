---
name: leonardo-prompt-generator
description: Generate and optimize AI image prompts for Leonardo.ai platform. Use when user needs to: (1) Create prompts for game assets, characters, backgrounds, or UI elements, (2) Optimize existing prompts for better results, (3) Generate prompts for specific art styles or themes, (4) Get guidance on Leonardo.ai prompt best practices. Particularly useful for game development assets, concept art, and mobile game graphics.
---

# Leonardo.ai Prompt Generator

Generate high-quality AI image prompts optimized for Leonardo.ai platform.

## Quick Start

### For New Prompts

When user describes what they want to generate:

1. **Understand the request** - Identify the type (character, background, icon, etc.)
2. **Select appropriate template** - Use templates from `assets/prompt-templates.md`
3. **Apply Leonardo.ai best practices** - Follow guidelines in `references/leonardo-best-practices.md`
4. **Structure the prompt** - Use the recommended format:
   ```
   [Subject] + [Style] + [Details] + [Technical] + [Quality Tags]
   ```
5. **Add negative prompts** - Include common unwanted elements
6. **Present complete prompt** - Show both positive and negative prompts

### For Prompt Optimization

When user provides an existing prompt to improve:

1. **Analyze current prompt** - Identify missing elements or issues
2. **Apply enhancements**:
   - Add specific style keywords
   - Include quality tags if missing
   - Add technical parameters (lighting, composition)
   - Clarify ambiguous descriptions
3. **Add negative prompts** if not present
4. **Explain changes** made and why

## Core Capabilities

### 1. Game Asset Generation

**For Game Backgrounds:**
- Use wide aspect ratio compositions
- Include "clean center area for gameplay"
- Specify color schemes (pastel, vibrant, dark, etc.)
- Add atmospheric elements on edges
- Consider mobile game requirements

**Template structure:**
```
[Theme] game background, [style], [color palette],
[atmosphere], mobile game background, clean center for gameplay,
[decorative elements], [lighting], high quality, detailed
```

**Example:**
```
Positive: Fruit match game background, kawaii cute style,
gradient from soft pink to lavender purple, dreamy magical atmosphere,
mobile game background, clean center area for gameplay,
floating cartoon fruits and sparkles on corners, strawberries and grapes decorations,
soft volumetric lighting, pastel color palette, whimsical, cheerful mood,
high quality, extremely detailed, 8k

Negative: dark, scary, realistic, photo, cluttered center,
text, watermark, low quality, blurry
```

**For Game Icons/Objects:**
- Specify isometric or front view
- Use "game icon" or "game asset" keywords
- Include "clean background" or "transparent background"
- Add outline or glow effects for visibility
- Consider icon size context

**Template structure:**
```
[Object], [material/texture], [style], game icon, [view angle],
[colors], clean background, [outline style], centered,
mobile game UI, high quality render, sharp details
```

**For Game Characters:**
- Include "character design" or "character sheet"
- Specify pose and expression
- Detail clothing and accessories
- Consider "turnaround" or "multiple views" if needed
- Add "reference sheet" for consistency

### 2. Style Specification

Always specify a clear art style. Common styles for Leonardo.ai:

- **3D Styles**: `3D render, Pixar style, 3D animation, octane render`
- **2D Styles**: `digital art, concept art, anime style, cartoon`
- **Game Styles**: `mobile game art, casual game style, isometric game art`
- **Realistic**: `photorealistic, hyperrealistic, photo, cinematic`
- **Artistic**: `watercolor, oil painting, ink drawing, vector art`

Use style keywords early in the prompt for stronger influence.

### 3. Quality Enhancement

Always include quality tags at the end:

**General quality:**
```
masterpiece, best quality, high resolution, extremely detailed,
professional, sharp focus, 8k, HD
```

**Specific use cases:**
- **Characters**: `perfect anatomy, beautiful, detailed features`
- **Backgrounds**: `wide shot, atmospheric, cinematic lighting`
- **Icons**: `clean design, crisp details, sharp edges`
- **3D**: `high poly, detailed texture, professional render`

### 4. Negative Prompts

Always provide negative prompts to avoid common issues:

**Standard negative prompts:**
```
blurry, low quality, distorted, deformed, ugly, bad anatomy,
watermark, signature, text, cropped, out of frame, duplicate,
mutation, extra limbs, poorly drawn
```

**Additional by type:**
- **Characters**: `bad face, asymmetric eyes, deformed hands`
- **Backgrounds**: `cluttered, messy, chaotic, too busy`
- **Icons**: `complex, detailed background, unclear, pixelated`

### 5. Leonardo.ai Specific Features

**Weight Control:**
- Use `(keyword)` for 1.1x emphasis
- Use `((keyword))` for 1.21x emphasis
- Use `(keyword:1.5)` for precise control

**Model Selection Guidance:**
- **Leonardo Diffusion XL**: General purpose, high quality
- **Leonardo Vision XL**: Photo-realistic images
- **Leonardo Anime XL**: Anime and manga style
- **3D Animation Style**: 3D characters and objects
- **Leonardo Kino XL**: Cinematic quality

Mention appropriate model when relevant to user's request.

## Workflow for Common Requests

### Request: "Generate prompt for [game asset]"

1. Read `assets/prompt-templates.md` to find appropriate template
2. Read relevant sections from `references/leonardo-best-practices.md`
3. Fill template with specific details
4. Add quality tags and negative prompts
5. Present prompt with explanation

### Request: "Optimize this prompt: [user's prompt]"

1. Analyze provided prompt structure
2. Identify missing elements (style, quality tags, specifics)
3. Reference `references/leonardo-best-practices.md` for improvements
4. Restructure if needed
5. Present optimized version with change log

### Request: "How do I make [specific effect]?"

1. Check `references/leonardo-best-practices.md` for relevant keywords
2. Provide specific technical terms and structure
3. Show example prompt
4. Explain weight control if needed

## Examples

### Example 1: Mobile Game Fruit Icon

**User Request:** "Create prompt for cute grape icon for match-3 game"

**Generated Prompt:**
```
Positive: Cute cartoon grape cluster, 3D glossy style,
round purple grapes with highlights and reflections,
kawaii cute expression with sparkle in eyes,
game icon, isometric view, vibrant purple and pink colors,
clean white background, white outline glow effect,
centered composition, mobile game UI, friendly and cheerful,
high quality render, sharp details, professional, 8k

Negative: realistic, photo, dark, scary, complex background,
blurry, low quality, distorted, pixelated, flat
```

**Explanation:** Used 3D style for modern look, added glossy highlights for appeal, included outline for visibility, specified isometric view for consistency.

### Example 2: Game Background

**User Request:** "Generate background for bubble shooter game"

**Generated Prompt:**
```
Positive: Magical bubble shooter game background,
dreamy fantasy style, soft gradient from sky blue to purple pink,
floating iridescent bubbles scattered on edges, clean center area for gameplay,
sparkles and light particles, cute clouds in corners,
soft ambient lighting with gentle glow, pastel color palette,
mobile game background, whimsical cheerful atmosphere,
wide aspect ratio, high quality, extremely detailed, 8k

Negative: realistic, photo, dark, cluttered center, busy,
complex details in middle, text, watermark, low quality, blurry,
narrow, portrait orientation
```

**Explanation:** Emphasized clean center for gameplay, used edge decoration only, specified wide aspect ratio, added atmospheric elements.

## Tips for Best Results

1. **Be Specific**: "cute cartoon strawberry with smile" > "fruit"
2. **Order Matters**: Put most important elements first
3. **Use Technical Terms**: "volumetric lighting" > "nice light"
4. **Specify Colors**: "pastel pink #ffb3d9" > "pink"
5. **Add Context**: "for mobile game UI" helps model understand purpose
6. **Test Iterations**: Suggest trying variations with different style keywords
7. **Aspect Ratio**: Mention appropriate ratio (16:9 for backgrounds, 1:1 for icons)

## Resources

- **`references/leonardo-best-practices.md`**: Comprehensive guide to Leonardo.ai prompting techniques, style keywords, and quality enhancement
- **`assets/prompt-templates.md`**: Ready-to-use templates for common use cases with example fill-ins

## Common Issues and Solutions

**Issue**: Generated images are blurry
→ Add: `sharp focus, high resolution, crisp details, 8k`

**Issue**: Wrong style/not matching request
→ Strengthen style keywords with weights: `((3D render))` or `(kawaii style:1.5)`

**Issue**: Unwanted elements appear
→ Add specific items to negative prompt

**Issue**: Inconsistent results
→ Be more specific in description, add more detail keywords

**Issue**: Colors don't match
→ Specify exact color palette, use hex codes or color names

## 生成的图片需要是透明背景
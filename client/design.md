# Bento Grid Dark Theme - Visual Design System

## 1. 核心设计理念 (Core Philosophy)

本设计采用“Bento Grid（便当盒）”布局风格的深色主题 (Dark Mode)。整体视觉强调：
纯净的深色背景，放弃传统的纯灰 (Gray/Zinc)，转而使用带有极弱蓝紫倾向的极致深色 (#0A0A0B)。
发光的结构线，边框不使用实体颜色，而是使用带透明度的白色 (white/5, white/10) 来勾勒层级。
高对比度的强调色，以 Indigo（靛蓝）为主色调，配合少量纯白 (white) 形成强烈的视觉焦点。
圆润的几何感，大量使用大圆角 (rounded-3xl, rounded-2xl) 构建区块。
精细的排版 (Typography)，对标签和辅助信息使用极小的全大写字母配合紧凑的字间距。

## 2. 颜色规范 (Color Palette)

请在 Tailwind CSS 中严格使用以下色彩体系：
背景色 (Backgrounds)
App 底色 (Body/Root): bg-[#0A0A0B]
Bento 顶级卡片 (Cards): bg-white/5 (主要) 或 bg-[#0F0F11]
次级内容区块 (Sub-surfaces): bg-[#141417]
组件内部填充 (Inputs/Items): bg-[#0A0A0B] 或 bg-white/5
边框色 (Borders)
放弃固体灰色，全部采用白色半透明：
主区块边框 (Cards): border-white/10
次级分隔线 (Dividers/Items): border-white/5
悬停高亮 (Hover states): 提升透明度，如 hover:border-white/20 或 hover:border-indigo-500/30
文字色 (Typography Colors)
放弃 gray 或 zinc，统一使用 slate 色系：
正文基础色 (Base): text-slate-300
标题/高亮 (Headings/Active): text-white
次要信息 (Secondary): text-slate-400
辅助信息/占位符 (Muted/Placeholders): text-slate-500
强调色 (Accent - Indigo)
主按钮/高亮图标: indigo-500, indigo-600
文字高亮/数据: text-indigo-400
发光背景/次级强调: bg-indigo-500/10 或 bg-indigo-500/20

## 3. 圆角与结构 (Border Radius & Spacing)

便当盒风格对圆角极其敏感，请遵循以下层级：
顶级 Bento 卡片 (Main Sections): rounded-3xl (搭配 p-6 或 p-8 的内边距)
列表项/内部区块 (List Items): rounded-2xl (搭配 p-4 内边距)
交互控件 (Buttons/Inputs): rounded-xl 或 rounded-lg
极小标签/装饰点 (Tags/Badges): rounded-md 或 rounded-full

## 4. 排版排布规范 (Typography Guidelines)

字体配置: 全局使用 font-sans，数据/密码/代码块强制使用 font-mono。
主标题: text-white font-semibold
模块小标题 (Section Labels): 必须使用极其现代的样式，Tailwind类为：
text-[10px] uppercase tracking-tighter text-slate-500 font-bold block
强调数据: 使用 font-mono text-xl font-bold text-indigo-400 tracking-wider

## 5. 核心组件代码范例 (Component Recipes)

### 5.1 Bento 卡片容器 (Bento Card)

```Html
<section class="bg-white/5 border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
  <!-- 内容 -->
</section>
```

### 5.2 列表项/次级卡片 (List Item / Inner Card)

包含细微的交互反馈和边框高亮。

```Html
<div class="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141417] p-4 transition-all hover:border-indigo-500/30 hover:bg-white/5">
  <!-- 内容 -->
</div>
```

### 5.3 图标容器 (Icon Wrappers)

Bento 风格中图标通常不裸露，而是放置在带有强调色背景的方块中：

```Html
<div class="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500">
  <Icon class="w-5 h-5" />
</div>
```

### 5.4 按钮样式 (Buttons)

主按钮 (Primary - Solid):
bg-white text-indigo-900 px-6 py-2.5 text-sm font-bold rounded-xl shadow-xl hover:bg-slate-100 transition-all
(反色按钮在暗黑模式下显得极其高级)

主按钮 (Primary - Colored):
bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:bg-indigo-500 transition-colors

次级按钮 (Secondary/Ghost):
bg-transparent border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 rounded-xl hover:bg-white/5 hover:text-white transition-colors

### 5.5 输入框 (Inputs)

```Html
<input class="w-full rounded-xl border border-white/10 bg-[#141417] px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all" />
```

## 6. 特殊视觉效果 (Special Effects)

### 6.1 光晕与装饰 (Ambient Blurs)

用于打破暗黑模式的沉闷感，在卡片边缘放置不可交互的模糊色块：

```Html
<div class="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
```

### 6.2 悬停底部反光线 (Bottom Highlight on Hover)

用于列表项的极简反馈，默认透明，悬停时显示一条微弱的渐变底部边线：

```Html
<div class="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
```

### 6.3 全局滚动条 (Custom Scrollbar)

放置在全局 CSS 或 index.css 中：

```CSS


@layer utilities {
.custom-scrollbar::-webkit-scrollbar {
width: 6px;
height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
@apply bg-white/10 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
@apply bg-white/20;
}
}
```

"Please implement the UI components following the Bento Grid Dark Theme Design System provided above. Strictly use the specified Tailwind CSS classes (white/5, white/10 for borders, slate for text, indigo for accents) and adhere to the exact border-radius (3xl, 2xl, xl) and typography rules (e.g., text-[10px] uppercase tracking-tighter)."

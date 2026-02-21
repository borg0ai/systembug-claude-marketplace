---
name: CSS Design System Architect
description: 核心设计系统与 CSS 架构规范，融合了业内顶尖专家（如 BEM, ITCSS, 原子设计, 现代流体排版, 防守型 CSS）的最佳实践共识。
---

# CSS Design System 核心执法指南

当需要编写、审查或重构任何具有规模化、系统化要求的 CSS 代码（如组件库、核心业务 UI 等）时，**必须严格遵守以下六大专家维度的规范**。

## 1. 架构与层级 (The BEM & ITCSS Way)

**目标**：消除全局污染，控制特异性（Specificity），保持高可复用性。

- **三层 Token 架构**：CSS 变量必须按 `Primitive (原始值) -> Semantic (语义层/主题层) -> Component (组件层)` 拆分。禁止在组件内部直接写死物理颜色 HEX 码。
- **职责分离的 ITCSS**：
    - `reset.css/global.css`：只负责最基础的跨浏览器重置和 HTML A11y 基线。
    - `objects/` 类名以 `.o-` 开头（如 `.o-grid`）：提取纯布局逻辑，不包含任何外观 UI 样式（如背景、边距线）。
    - `components/` 类名遵循 `.block__element--modifier`。
- **防嵌套底线**：**BEM 命名空间下严禁超过 2 层的选择器嵌套**。优先通过组合类名而非 DOM 结构依赖来覆盖样式。

## 2. 现代流体排版与布局 (Modern Layout & Spacing)

**目标**：丢弃死板的断点和陈旧的物理边距，拥抱自适应与跨语言支持。

- **流体字号**：禁止使用固定的 `px` 甚至纯粹死板的 `rem` 定义主系统字号。必须使用 `clamp(min, func, max)`。
- **逻辑属性**：所有涉及内外边距的属性强制要求使用逻辑属性，即 `padding-inline`, `margin-block` 代替 `padding-left`, `margin-top`，保障 RTL 语言下排版的坚不可摧。
- **现代弹性布局**：
    - 首选原生 CSS Grid 的 `repeat(auto-fit, minmax(...))` 实现自适应折行。
    - 响应式调整优先使用 **容器查询 (Container Queries, `@container`)**，慎用全局视口绑定的媒体查询 (`@media`)。

## 3. 防守型 CSS (Defensive Architecture)

**目标**：像应对敌意攻击一样应对无法预料的真实世界内容。

- **溢出保护底线**：涉及文本的长内容容器、Flex/Grid 内部的弹性项，**必须显式声明** `min-width: 0` 和 `overflow-wrap: break-word` (或 `text-overflow: ellipsis`)。
- **多媒体骨架**：图片与媒体元素必须配置 `object-fit` 或固定 `aspect-ratio`，辅以友好的占位背景，防止 CLS (累积布局偏移)。

## 4. UI 现代化与焦点一致性 (Inputs & A11y Consistency)

**目标**：保障全局组件呈现出极简、一致、现代的交互感。

- **输入框（Input & Textarea）一致性**：必须具备统一的尺寸控制（如固定基础高度 + 统一的水平 `padding-inline`），并且禁用 `textarea` 引发 CLS 的自由拖拽。
- **焦点状态 (Focus) 革命**：
    - **禁止粗暴的 `outline: none`** 除非你提供了替代方案。
    - 核心组件库的 `:focus-visible` 状态应该使用 `box-shadow` 附带 `transition` (如 150ms ease) 配合主色变体 (`--color-primary`) 渲染出现代化的“外发光”反馈，从而替代生硬的浏览器原生黑/黄轮廓线。
- **状态层级管控**：明确定义 `--color-danger` 等异常状态 Token，并通过 CSS 变量穿透到底层 DOM，确保视觉语言反馈的一致性。

## 执行指引

当用户要求“应用这套规范”或者“基于设计系统进行开发”时，请自动扫描现有代码并对标上述 4 大准则。任何严重违背（如 `!important` 满天飞、写死 px 断点、毫无防备的文字溢出）都应该受到重构与纠正。

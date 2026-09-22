# Akasha

> **An all-in-one productivity app combining calendar, multi-level todos, habit tracking, and daily journal.**  
> 一款集动态日历、无限多级待办清单、习惯打卡与随笔日记于一体的个人计划管理工具。

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-IndexedDB-orange?style=flat-square)](https://dexie.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📖 简介 (Introduction)

**Akasha** 是一款简洁实用、本地优先（Local-First）的个人计划与时间管理工具。

日常生活中，我们经常需要在不同的应用间来回切换：在日历里查日程、在待办软件里拆任务、在打卡工具里记习惯、在备忘录里写随笔。

Akasha 将**自适应动态日历、多级待办清单、规律习惯追踪、固定日程规划以及随笔复盘**整合为一体。操作直观自然，无需在多款工具间割裂跳转。同时，所有数据均存储在本地浏览器 IndexedDB 数据库中，无需登录账号，私密、快速且支持离线使用。

---

## ✨ 核心特性 (Key Features)

### 1. 顶层架构：领域与项目 (Areas & Projects)
* **人生领域定义**：自由开辟长期关注领域（如：工作事业、学业提升、生活理财、健康身心等）。
* **项目生命周期**：项目归属于具体领域，支持自定义专属色彩标定。
* **三位一体聚合**：在项目详情中无缝管理该项目关联的**习惯打卡**、**固定日程**与**待办任务**。
* **自动计算完成度**：根据待办事项完成比例，实时动态更新项目进度条与百分比。

### 2. 执行攻坚：无限多级待办树 (Recursive Todo Tree)
* **无限深度分解**：支持任意层级的大任务 ➔ 阶段任务 ➔ 具体行动的嵌套拆解。
* **树节点交互**：支持独立折叠/展开多级分支，父子状态双向联动。
* **多维深度属性**：
  * **重要度评分**：P1 ~ P10 滑块精细化打分，一眼锚定高优先级事项。
  * **智能截止预警**：支持设定开始与截止时间，动态呈现“今日截止”、“剩余 N 天”、“逾期 N 天”告警。
  * **备忘与备注**：支持为每个待办附加详尽说明。
* **复合筛选与排序**：支持按项目筛选、按进行中/已完成/今日截止/逾期过滤，支持按权重与日期排序。

### 3. 规律生活：多频次习惯打卡 (Habits Tracker)
* **灵活周期支持**：
  * **每日习惯**：支持按早晨（Morning）、下午（Afternoon）、晚上（Evening）、全天（Anytime）时段分类。
  * **周期习惯**：支持每周特定频次、每两周（双周）、每月固定频次习惯。
* **正向反馈与连胜激励**：自动记录每日打卡历史，统计当前连胜天数（Current Streak）与历史最佳打卡记录。

### 4. 时间规约：固定日程安排 (Schedules)
* **周期性规约**：支持特定单次日期日程、每周固定日日程（如每周一例会）、每月固定日日程（如每月10日）。
* **项目关联**：将固定日程与具体项目关联，在时间轴上保持清晰的归属边界。

### 5. 时间全景：自适应动态月历 (Calendar Dashboard)
* **自适应高度**：单元格随当天内容多少智能伸缩扩展，任务充实时自如展开，空闲时整洁紧凑。
* **多源信息聚合**：在单一月历视图中同时整合**固定日程**、**截止待办事项**以及**随笔日记标记**。
* **跨模块穿透交互**：
  * 点击空白处或日期：一键调起当日随笔/日记速写。
  * 点击日程标签：弹出日程详情与删除管理，杜绝误触冒泡。
  * 点击待办芯片：自动定位跳转至待办视图并直接弹出属性编辑面板。

### 6. 反思沉淀：随笔与每日复盘 (Daily Journal)
* **日期驱动书写**：支持任意日期的随笔撰写，记录心得、情绪状态与当日复盘。
* **月度归档目录**：侧边栏支持“全部记录”与“按月份筛选”切换，卡片直观显示日期与文字摘要，点击即可即时载入编辑。

### 7. 全局检索与系统设置 (Global Tools & System Settings)
* **全景穿透搜索**：快捷检索项目、待办、习惯、日程与随笔，结果一键穿透直达。
* **抽屉式流型设置**：
  * **明暗双主题**：纯净浅色（Clean Light）与沉浸深色（Deep Dark）平滑过渡。
  * **界面字号缩放**：提供小、标准、大三档字体调控，全局自适应等比缩放。
  * **霞鹜文楷正文字体**：默认搭载温润清爽的霞鹜文楷屏幕字体（LXGW WenKai），阅读舒适。
  * **数据自主可控**：支持一键导出/导入全量 JSON 备份，支持一键清空重置为完全空白数据集。

---

## 🛠️ 技术栈 (Tech Stack)

* **核心框架**：[Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
* **开发语言**：[TypeScript](https://www.typescriptlang.org/)
* **构建工具**：[Vite 8](https://vitejs.dev/)
* **样式处理**：[Tailwind CSS 4](https://tailwindcss.com/)
* **本地数据库**：[Dexie.js](https://dexie.com/) (HTML5 IndexedDB 高性能封装)
* **图标组件**：[Lucide Vue Next](https://lucide.dev/)
* **视觉粒子**：[canvas-confetti](https://github.com/catdad/canvas-confetti)
* **正文字体**：[LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai)

---

## 🚀 快速上手 (Getting Started)

### 环境要求 (Prerequisites)
* Node.js >= 18.0.0
* npm >= 9.0.0 (或 pnpm / yarn)

### 安装与运行 (Installation & Dev)

```bash
# 1. 克隆代码仓库
git clone https://github.com/yyzmiao/Akasha.git

# 2. 进入项目目录
cd Akasha

# 3. 安装项目依赖
npm install

# 4. 启动本地开发服务
npm run dev
```

默认开发服务将运行在：`http://localhost:5173/` (端口冲突时顺延)

### 生产构建与预览 (Build & Preview)

```bash
# 构建生产包
npm run build

# 本地预览生产构建产物
npm run preview
```

---

## 📂 目录结构 (Project Structure)

```text
Akasha/
├── public/                # 静态资源与 PWA 清单
│   └── manifest.json      # 应用清单配置
├── src/
│   ├── components/        # 核心功能组件
│   │   ├── CalendarView.vue    # 自适应动态月历看板
│   │   ├── GlobalSearch.vue    # 全局全景穿透搜索
│   │   ├── HabitsView.vue      # 习惯打卡与连胜管理
│   │   ├── JournalView.vue     # 随笔撰写与历史归档
│   │   ├── Navbar.vue          # 顶栏导航与主题/搜索控制
│   │   ├── ProjectView.vue     # 领域与项目卡片、三位一体详情
│   │   ├── SettingsDrawer.vue  # 抽屉式流型设置与数据备份
│   │   ├── TodoTreeItem.vue    # 无限多级待办递归项
│   │   └── TodoView.vue        # 待办清单多维筛选与管理
│   ├── db/
│   │   └── index.ts            # Dexie.js 本地 IndexedDB 模式与初始数据
│   ├── types/
│   │   └── index.ts            # 全局 TypeScript 接口定义
│   ├── utils/
│   │   ├── date.ts             # 日历算法与周期时间处理工具
│   │   └── tree.ts             # 无限多级任务树遍历与递归工具
│   ├── App.vue                 # 根组件与顶层状态流
│   ├── main.ts                 # 应用入口挂载
│   └── style.css               # 全局样式与 Tailwind 基础配置
├── index.html             # 单页应用 HTML 模板
├── package.json           # 项目元数据与依赖配置
├── tsconfig.json          # TypeScript 编译配置
└── vite.config.ts         # Vite 构建配置
```

---

## 🔒 隐私与数据安全 (Privacy & Local-First)

* **100% 本地存储**：所有领域、项目、日程、习惯、打卡记录与随笔均直接存放在您设备本地浏览器的 IndexedDB 数据库中。
* **零云端依赖**：无需注册账号，不向任何远程服务器发送您的私人日程与笔记内容。
* **自主备份与迁移**：随时可通过设置面板导出标准的 `.json` 格式数据文件，在不同设备间无损导入与迁移。

---

## 📄 开源许可 (License)

本项目基于 [MIT License](LICENSE) 协议开源。

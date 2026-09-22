# Akasha

<p align="center">
  <img src="public/icon-check-512.png" width="96" height="96" alt="Akasha Logo" />
</p>

<p align="center">
  <strong>一个开源、简洁且注重隐私的个人日程计划、日历与待办管理工具。</strong><br>
  <em>An open-source, clean, and privacy-first personal planner, calendar, and todo app.</em>
</p>

<p align="center">
  <a href="README.md"><strong>简体中文</strong></a> •
  <a href="README_EN.md">English</a>
</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://dexie.com/"><img src="https://img.shields.io/badge/Dexie.js-IndexedDB-orange?style=flat-square" alt="Dexie.js"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"></a>
</p>

---

## 📖 简介

**Akasha** 是一个开源、轻量且纯粹由本地驱动的个人日程计划、动态日历与多级待办事项管理工具。

日常生活中，我们常常需要在不同的应用之间来回切换：在日历里查日程、在待办软件里拆任务、在打卡工具里记习惯、在备忘录里写随笔——多款工具割裂跳转，既繁琐又分散精力。

**Akasha 将这些常用的计划与待办功能融为一体：**  
它汇集了**自适应动态月历、无限多级待办清单、规律习惯打卡、固定日程规划以及随笔日记**。界面直观清爽，专注于日常任务的高效规划与时间管理。

坚持 **本地优先（Local-First）** 与 **零监控隐私** 原则，所有数据只存放在您设备本地浏览器的 IndexedDB 数据库中。无需注册账号，零云端上传，毫秒级即时响应，全离线可用，并支持安装为桌面或手机独立应用（PWA）。

---

## ✨ 核心特性

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

### 7. 全局检索与个性化定制 (Global Tools & Preferences)
* **全景穿透搜索**：快捷检索项目、待办、习惯、日程与随笔，结果一键穿透直达。
* **全界面等比缩放**：内置 90%（紧凑）、100%（标准）、108%（舒适）、118%（大屏）四档全局无损比例缩放。
* **多字体风格一键切换**：支持霞鹜文楷（文雅温润）、系统默认黑体（现代利落）、典雅宋体（沉稳内敛）。
* **明暗双主题**：纯净浅色（Clean Light）与沉浸深色（Deep Dark）平滑过渡。
* **数据自主可控**：支持一键导出/导入全量 JSON 备份，支持一键清空重置为完全空白数据集。

### 8. 渐进式 Web 应用 (PWA & Mobile Ready)
* **独立应用模式**：全面适配 Android Chrome WebAPK 与 iOS Safari 添加到主屏幕，无浏览器地址栏与安全角标，呈现原生全屏体验。
* **离线服务工作线程**：内置 Service Worker 预缓存，断网状态下照常加载与操作。

---

## 🛠️ 技术栈 (Tech Stack)

* **核心框架**：[Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
* **开发语言**：[TypeScript](https://www.typescriptlang.org/)
* **构建工具**：[Vite 8](https://vitejs.dev/)
* **样式处理**：[Tailwind CSS 4](https://tailwindcss.com/)
* **本地数据库**：[Dexie.js](https://dexie.com/) (HTML5 IndexedDB 高性能封装)
* **图标组件**：[Lucide Vue Next](https://lucide.dev/)
* **视觉粒子**：[canvas-confetti](https://github.com/catdad/canvas-confetti)
* **默认字体**：[LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai)

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

# 3. 安装依赖
npm install

# 4. 启动本地开发服务
npm run dev
```

默认开发服务运行在：`http://localhost:5173/`

### 生产构建与预览 (Build & Preview)

```bash
# 构建生产包
npm run build

# 本地预览生产构建产物
npm run preview
```

### Docker 容器化部署 (Docker Deployment)

项目内置轻量多阶段 `Dockerfile` 与 `docker-compose.yml`，可一键完成静态资源编译与生产环境 Nginx 伺服：

```bash
# 启动容器服务 (默认映射宿主机 8080 端口)
docker compose up -d --build
```

如需配置生产反向代理、SSL 证书与安全访问控制 (HTTP Basic Auth)，可参考 `deploy/nginx-proxy.conf`：

```bash
# 生成密码凭证文件 (可选)
htpasswd -b -c deploy/.htpasswd username your_secure_password
```

> **注意**：若开启 Basic Auth，请务必放行 PWA 清单 (`/manifest.json`)、Service Worker (`/sw.js`) 及图标资源，确保 Android/iOS 桌面独立应用模式与离线缓存正常运转。

---

## 📂 目录结构 (Project Structure)

```text
Akasha/
├── deploy/                # 生产部署与反向代理模板
│   ├── .htpasswd.example  # Basic Auth 凭据模版
│   └── nginx-proxy.conf   # 生产 Nginx 反向代理配置模版
├── public/                # 静态资源、图标与 PWA 清单
│   ├── icon-check-192.png # PWA 192x192 高清图标
│   ├── icon-check-512.png # PWA 512x512 高清图标
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
├── Dockerfile             # 多阶段构建生产镜像配置
├── docker-compose.yml     # 一键编排容器配置
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

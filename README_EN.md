# Akasha

<p align="center">
  <img src="public/icon-check-512.png" width="96" height="96" alt="Akasha Logo" />
</p>

<p align="center">
  <strong>An open-source, clean, and privacy-first personal planner, calendar, and todo app.</strong><br>
  <em>一个开源、简洁且注重隐私的个人日程计划、日历与待办管理工具。</em>
</p>

<p align="center">
  <a href="README.md">简体中文</a> •
  <a href="README_EN.md"><strong>English</strong></a>
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

## 📖 Introduction

**Akasha** is an open-source, lightweight, and local-first personal planner, dynamic calendar, and multi-level todo app.

In our daily routines, we often find ourselves juggling multiple separate apps: checking schedules in calendars, breaking down tasks in todo lists, tracking habits in habit apps, and jotting notes in memo pads — switching back and forth is both cumbersome and distracting.

**Akasha brings these daily essentials together into one clean, unified tool:**  
It combines an **adaptive dynamic monthly calendar, infinite multi-level todo lists, habit streak tracking, fixed schedules, and daily journaling**. The interface is intuitive, uncluttered, and tailored for daily task planning and time management.

Built with a steadfast **Local-First** and privacy-first approach, all your data is stored strictly inside your browser's IndexedDB. No registration required, zero cloud tracking, sub-millisecond responsiveness, 100% offline-ready, and fully installable as a standalone desktop or mobile application (PWA).

---

## ✨ Key Features

### 1. Life Architecture: Areas & Projects
* **Life Areas**: Establish long-term domains of life (e.g., Career, Learning, Wealth & Living, Health & Mind).
* **Project Lifecycle**: Organize projects under specific areas with custom color identifiers.
* **Unified Trinity Hub**: Manage associated **Habits**, **Schedules**, and **Todos** seamlessly in the project detail cockpit.
* **Dynamic Progress Calculation**: Automatically recalculates completion percentages and progress bars based on associated task states.

### 2. Execution Engine: Infinite Recursive Todo Tree
* **Unlimited Depth**: Decompose massive goals into phases and granular actions with infinite nesting levels.
* **Interactive Tree Nodes**: Fold or expand nested branches with bidirectional state propagation between parent and child tasks.
* **Rich Metadata**:
  * **Priority Rating**: P1 to P10 slider to instantly spotlight high-impact tasks.
  * **Smart Due Warnings**: Visual alerts for "Due Today", "N Days Left", and "Overdue by N Days".
  * **Detailed Notes**: Add memos and context directly to each task.
* **Compound Filters & Sorting**: Filter by project, active/completed status, due today, or overdue; sort dynamically by weight or date.

### 3. Rhythmic Living: Multi-Frequency Habit Tracker
* **Flexible Cadence**:
  * **Daily Habits**: Categorized by time of day (Morning, Afternoon, Evening, Anytime).
  * **Periodic Habits**: Specific frequencies per week, bi-weekly (fortnightly), or monthly targets.
* **Streaks & Positive Reinforcement**: Logs daily completion history with current streak count and personal best records.

### 4. Time Cadence: Fixed Schedules
* **Recurring & Milestone Rules**: Single-instance dates, weekly recurring days (e.g., Monday syncs), or monthly dates (e.g., 10th of every month).
* **Project Association**: Connect schedules to specific projects to establish unambiguous temporal boundaries.

### 5. Bird's Eye View: Adaptive Dynamic Calendar
* **Smart Elastic Height**: Calendar rows and cells adapt dynamically to the amount of content—expanding smoothly when packed with items and remaining compact when empty.
* **Multi-Source Synthesis**: Aggregates fixed schedules, task deadlines, and journal reflection markers on a single monthly view.
* **Cross-Module Deep Navigation**:
  * Click on empty cell/date to start journaling for that day.
  * Click schedule chips to inspect or manage schedule details.
  * Click todo chips to immediately jump to the Todo view with the detail drawer opened.

### 6. Mindful Reflection: Daily Journal & Archives
* **Date-Driven Writing**: Jot down thoughts, emotional reflections, and evening reviews for any chosen day.
* **Monthly Archives**: Easily toggle between all records and month-filtered archives with text snippets and instant editing.

### 7. Global Command & Aesthetics
* **Omnipresent Search**: Quickly locate projects, todos, habits, schedules, and journal entries with one-click deep navigation.
* **UI Scale Control**: Switch between 90% (Compact), 100% (Standard), 108% (Comfortable), and 118% (Large Display) without blurriness.
* **Typography Switcher**: Seamlessly switch between LXGW WenKai (warm & elegant), System Sans-serif (modern & sharp), and Classical Serif.
* **Light / Dark Dual Themes**: Clean Light and Deep Dark modes with smooth transitions.
* **Complete Data Sovereignty**: One-click full JSON export/import and instant dataset reset.

### 8. Progressive Web App (PWA & Mobile Ready)
* **Standalone App Mode**: Fully optimized for Android Chrome WebAPK and iOS Safari "Add to Home Screen" — zero URL bar, no badge overlay, genuine native app feeling.
* **Offline Service Worker**: Built-in caching strategy ensures fast loading and complete functionality without internet access.

---

## 🛠️ Tech Stack

* **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vitejs.dev/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Local Storage**: [Dexie.js](https://dexie.com/) (HTML5 IndexedDB wrapper)
* **Icons**: [Lucide Vue Next](https://lucide.dev/)
* **Celebration Effects**: [canvas-confetti](https://github.com/catdad/canvas-confetti)
* **Default Font**: [LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai)

---

## 🚀 Getting Started

### Prerequisites
* Node.js >= 18.0.0
* npm >= 9.0.0 (or pnpm / yarn)

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/yyzmiao/Akasha.git

# 2. Enter project directory
cd Akasha

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

The dev server will run at: `http://localhost:5173/`

### Production Build & Preview

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Docker Deployment

A lightweight multi-stage `Dockerfile` and `docker-compose.yml` are included for instant containerized building and Nginx serving:

```bash
# Build and run container in detached mode (maps host port 8080:80)
docker compose up -d --build
```

For reverse proxying, SSL termination, and HTTP Basic Auth, refer to `deploy/nginx-proxy.conf`:

```bash
# Generate credential file (optional)
htpasswd -b -c deploy/.htpasswd username your_secure_password
```

> **Note**: If enabling Basic Auth, ensure PWA manifests (`/manifest.json`), Service Worker (`/sw.js`), and app icons are excluded from authentication to preserve standalone mobile installation.

---

## 📂 Project Structure

```text
Akasha/
├── deploy/                # Deployment and reverse proxy templates
│   ├── .htpasswd.example  # Basic Auth credential template
│   └── nginx-proxy.conf   # Production Nginx reverse proxy template
├── public/                # Static assets, icons, and PWA manifest
│   ├── icon-check-192.png # PWA 192x192 HD icon
│   ├── icon-check-512.png # PWA 512x512 HD icon
│   └── manifest.json      # Web App Manifest
├── src/
│   ├── components/        # UI and functional components
│   │   ├── CalendarView.vue    # Adaptive dynamic calendar
│   │   ├── GlobalSearch.vue    # Global omnipresent search
│   │   ├── HabitsView.vue      # Habit tracking and streaks
│   │   ├── JournalView.vue     # Journal writing and archives
│   │   ├── Navbar.vue          # Top navigation and search control
│   │   ├── ProjectView.vue     # Area and project cockpits
│   │   ├── SettingsDrawer.vue  # Preferences and data backup drawer
│   │   ├── TodoTreeItem.vue    # Recursive multi-level todo item
│   │   └── TodoView.vue        # Filterable multi-level todo list
│   ├── db/
│   │   └── index.ts            # Dexie.js schema and sample seed
│   ├── types/
│   │   └── index.ts            # Global TypeScript interfaces
│   ├── utils/
│   │   ├── date.ts             # Calendar and date algorithms
│   │   └── tree.ts             # Recursive task tree utilities
│   ├── App.vue                 # Root component and top-level state
│   ├── main.ts                 # App entry point
│   └── style.css               # Global styles & Tailwind configuration
├── Dockerfile             # Multi-stage production container image
├── docker-compose.yml     # Docker compose orchestration
├── index.html             # Single-page HTML shell
├── package.json           # Project metadata & dependencies
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

---

## 🔒 Privacy & Local-First

* **100% Local Storage**: All areas, projects, schedules, habits, check-ins, and journal entries are stored strictly in your browser's IndexedDB.
* **Zero Cloud Tracking**: No user registration required. Nothing is ever sent to any remote server without your explicit command.
* **Data Sovereignty**: Export and import standard `.json` backup files at any moment to migrate between devices seamlessly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

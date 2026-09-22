# Akasha

<p align="center">
  <img src="public/icon-check-512.png" width="96" height="96" alt="Akasha Logo" />
</p>

<p align="center">
  <strong>An open-source, clean personal planner, calendar, and todo app that can be deployed on your own computer or server.</strong><br>
  <em>一个开源、简洁的个人日程计划、日历与待办管理工具，可部署在自己的电脑或服务器上。</em>
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

**Akasha** is an open-source, lightweight personal planner, dynamic calendar, and multi-level todo app that can be deployed on your own computer or server.

In our daily routines, we often find ourselves juggling between multiple separate apps: checking schedules in calendars, breaking down tasks in todo lists, tracking habits in habit apps, and jotting notes in memo pads — switching back and forth is both cumbersome and distracting.

**Akasha brings these daily essentials together into one clean, unified tool:**  
It combines an **adaptive dynamic monthly calendar, infinite multi-level todo lists, habit streak tracking, fixed schedules, and daily journaling**. The interface is intuitive, uncluttered, and tailored for daily task planning and time management.

Easily deployed on your personal computer (PC / Mac) or private cloud server (VPS). Built with a **Local-First** architecture, all your data is stored directly in your browser's IndexedDB. No registration required, no cloud dependencies, instant response times, 100% offline-ready, and fully installable as a standalone desktop or mobile application (PWA).

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

## 🚀 Deployment Guide

This project can be deployed on your **personal computer** or **cloud server**, offering lightweight and flexible setups:

### 1. Deploy on Your Own Computer (Local PC / Mac)

#### Option A: Run locally with Node.js
```bash
# 1. Clone repository and navigate into directory
git clone https://github.com/yyzmiao/Akasha.git
cd Akasha

# 2. Install dependencies
npm install

# 3. Start local development server (runs at http://localhost:5173/)
npm run dev
```

#### Option B: One-click local Docker startup
```bash
# Build and run container locally (visit http://localhost:8080)
docker compose up -d --build
```

---

### 2. Deploy on Your Own Server (VPS / Cloud)

#### Step 1: Start container with Docker Compose
```bash
# Clone the repository on your server
git clone https://github.com/yyzmiao/Akasha.git
cd Akasha

# Launch container service (mapped to host port 8080)
docker compose up -d --build
```

#### Step 2: Configure Nginx reverse proxy & Basic Auth (Optional)

Refer to the included production template [`deploy/nginx-proxy.conf`](deploy/nginx-proxy.conf) and credential template [`deploy/.htpasswd.example`](deploy/.htpasswd.example).

<details>
<summary><strong>👉 Click to expand: Complete Server Nginx Reverse Proxy & HTTP Basic Auth Guide</strong></summary>

<br>

Akasha is a local-first application. When hosting on a public cloud server, combining **Nginx reverse proxy** with **HTTP Basic Auth** provides a rock-solid, lightweight layer of web access security without needing a heavy user backend.

##### 1. Install `htpasswd` Utility
Depending on your server distribution:
```bash
# Ubuntu / Debian
sudo apt update && sudo apt install -y apache2-utils

# CentOS / RHEL / AlmaLinux
sudo yum install -y httpd-tools
```

##### 2. Generate Credentials File
Create the password file in your Nginx configuration directory (e.g. `/etc/nginx/conf.d/`):
```bash
# Create file and add your initial user (-c creates a new file, -b passes password inline)
htpasswd -b -c /etc/nginx/conf.d/.htpasswd your_username your_secure_password

# Add subsequent users or update existing passwords (omit -c to avoid overwriting)
htpasswd -b /etc/nginx/conf.d/.htpasswd new_user their_password

# Inspect the file (passwords are stored as salted secure hashes)
cat /etc/nginx/conf.d/.htpasswd
```

##### 3. Configure Nginx Reverse Proxy & PWA Whitelist
Create or update your server block (e.g. `/etc/nginx/conf.d/akasha.conf`), forwarding traffic to the container port (`8080` by default), while configuring HTTP Basic Auth and PWA exemptions:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    charset utf-8;
    server_tokens off;
    gzip on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    # Enforce HTTP Basic Auth globally
    auth_basic "Akasha Restricted Access";
    auth_basic_user_file /etc/nginx/conf.d/.htpasswd;

    # Critical PWA Exemption: Allow manifest retrieval for mobile installation
    location = /manifest.json {
        auth_basic off;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin *;
    }

    # Critical PWA Exemption: Allow Service Worker registration
    location = /sw.js {
        auth_basic off;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }

    # Critical PWA Exemption: Allow desktop & home screen icons
    location ~* ^/(icon-.*\.png|apple-touch-icon.*\.png|favicon\..*)$ {
        auth_basic off;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin *;
    }

    # Main Web Application Reverse Proxy (Protected by Basic Auth)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Pro Tip**: When installing a PWA on Android (via Chrome WebAPK) or iOS (via Safari Add to Home Screen), background workers fetch `/manifest.json` and `/sw.js` without interactive auth prompt capabilities. The `auth_basic off;` rules above are critical: they allow browsers to detect the PWA metadata cleanly while keeping the entire web app interface securely locked.

##### 4. Test & Reload Nginx
```bash
# Verify syntax
nginx -t

# Reload configuration seamlessly
nginx -s reload
```

Navigate to `https://your-domain.com`. The browser will trigger a native credential prompt — enter your username and password to log in.

</details>

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

## 💾 Local Storage & Data Management

* **Browser Local Storage**: All areas, projects, schedules, habits, check-ins, and journal entries are stored strictly in your browser's IndexedDB.
* **Zero Cloud Dependencies**: No user registration required; operates completely independent of any remote backend.
* **Data Backup & Migration**: Export and import standard `.json` backup files at any time to migrate between devices seamlessly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

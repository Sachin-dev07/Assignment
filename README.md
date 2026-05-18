# 📬 Notification Priority Inbox — Jenkins CI/CD Pipeline

> **Assignment 1 · Jenkins CI/CD Pipeline**
> Student ID: `12420019`

---

## 📌 Overview

This project implements a **Priority Inbox** service for a notification system, fully integrated with a **Jenkins CI/CD pipeline** that automatically builds and runs the application on every code push.

The service fetches notifications from a remote evaluation API, ranks them using a **priority scoring algorithm**, and outputs the **Top 10 highest-priority notifications**.

---

## 🗂️ Repository Structure

```
Assignment/
├── Jenkinsfile                      # CI/CD pipeline definition
├── notification_system_design.md    # System design document
├── README.md                        # This file
└── notification_app_be/             # Backend application
    ├── priority_inbox.ts            # TypeScript source (main logic)
    ├── priority_inbox.js            # Compiled JavaScript output
    ├── package.json                 # Node.js dependencies & scripts
    ├── tsconfig.json                # TypeScript compiler config
    └── dist/
        └── priority_inbox.js        # tsc build output
```

---

## 🧠 Priority Scoring Algorithm

Notifications are ranked using:

```
Score = (TypeWeight × 1,000,000,000) + UnixTimestampSeconds
```

| Notification Type | Weight |
|-------------------|--------|
| `Placement`       | 3 (highest) |
| `Result`          | 2 |
| `Event`           | 1 (lowest) |

- **Type always dominates** — a `Placement` always outranks any `Result` or `Event`
- Within the same type, **more recent notifications rank higher**

### Data Structure
A **Min-Heap of fixed size 10** is used to efficiently maintain the Top-10:
- Insertion: `O(log 10)` → effectively `O(1)`
- Supports future real-time streaming inserts efficiently

---

## ⚙️ Jenkins CI/CD Pipeline

The `Jenkinsfile` defines a **6-stage pipeline** that auto-triggers on every GitHub push:

```
📥 Checkout  →  ⚙️ Setup Node.js  →  📦 Install Deps
    →  🔨 Compile TypeScript  →  🚀 Run App  →  📁 Archive Results
```

| Stage | Description |
|-------|-------------|
| **Checkout** | Pulls the latest code from GitHub |
| **Setup Node.js** | Verifies Node.js & npm are available |
| **Install Dependencies** | Runs `npm install` inside `notification_app_be/` |
| **Compile TypeScript** | Runs `npm run build` (tsc) to compile `.ts` → `.js` |
| **Run Priority Inbox** | Executes `node dist/priority_inbox.js`, output saved to log |
| **Archive Results** | Archives `priority_inbox_output.log` as a Jenkins artifact |

**Auto-trigger:** The pipeline uses `githubPush()` to automatically run on every push to the repository.

---

## 🚀 Running Locally

### Prerequisites
- Node.js `>= 18`
- npm

### Steps

```bash
# 1. Navigate to the backend app
cd notification_app_be

# 2. Install dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Run the app
node dist/priority_inbox.js
```

Or run directly in development mode (no build step):

```bash
npm run dev
```

### Expected Output

```
📡 Fetching notifications from API...
✅ Successfully fetched N notifications.

╔══════════════════════════════════════════╗
║    🔔 TOP 10 PRIORITY NOTIFICATIONS      ║
╚══════════════════════════════════════════╝

#1  [PLACEMENT]  Weight: 3  Score: 3000000XXXXXXXXX
    ID        : <id>
    Message   : <message>
    Timestamp : <timestamp>
    ──────────────────────────────────────
...

✅ Priority Inbox processing complete.
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Strongly-typed application logic |
| **Node.js 18** | Runtime environment |
| **Jenkins** | CI/CD pipeline automation |
| **GitHub** | Source control & webhook trigger |

---

## 📋 Scripts (`package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node priority_inbox.js` | Run compiled JS directly |
| `build` | `tsc` | Compile TypeScript → JavaScript |
| `dev`   | `ts-node priority_inbox.ts` | Run TS directly (dev mode) |

---

## 🔗 Repository

**GitHub:** [https://github.com/Sachin-dev07/Assignment](https://github.com/Sachin-dev07/Assignment)

# 🐒 Monkey & Banana AI Planning System

> A complete **AISC (AI & Cognitive Science) college project** implementing the classic Monkey and Banana problem with real AI planning algorithms, animated game UI, and a live reasoning dashboard.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)

---

## 🎯 What is This?

The **Monkey and Banana Problem** is a classic AI planning benchmark: a monkey in a room sees a banana hanging from the ceiling (out of reach). A wooden box is on the floor. The monkey must plan a sequence of actions — walk, push the box, climb, and grab — to get the banana.

This project implements:
- **Real BFS/DFS planning** that computes solutions dynamically
- **Animated jungle game** where the monkey executes the computed plan
- **Live AI reasoning dashboard** with search tree, action log, and metrics
- **Manual play mode** with action validation
- **Vercel serverless backend** for the planning API

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Local development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/monkey-banana-ai.git
cd monkey-banana-ai

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** In development, API calls fall back to the browser-based planner automatically if the serverless functions aren't running. The game works fully without the backend.

### Production build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
monkey-banana-ai/
├── api/                        # Vercel Serverless Functions
│   ├── health.ts               # GET /api/health
│   ├── solve.ts                # POST /api/solve
│   └── validate-move.ts        # POST /api/validate-move
├── src/
│   ├── ai/
│   │   └── planner.ts          # BFS + DFS algorithms
│   ├── game/
│   │   └── gameLogic.ts        # State transitions, action validation
│   ├── components/
│   │   ├── game/               # GameScene, MonkeySVG, BoxSVG, BananaSVG
│   │   ├── ai/                 # StateCard, ActionLog, SearchTree, etc.
│   │   ├── controls/           # ControlsBar
│   │   └── education/          # EducationSection
│   ├── services/
│   │   └── api.ts              # Frontend API service with local fallback
│   ├── types/
│   │   └── game.ts             # Shared TypeScript types
│   ├── styles/
│   │   └── main.css            # Complete design system
│   ├── App.tsx                 # Main orchestration
│   └── main.tsx                # Entry point
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json                 # Vercel deployment config
└── README.md
```

---

## 🧠 AI Algorithms

### State Representation
```typescript
interface GameState {
  monkeyPosition: 'Left' | 'Center' | 'Right';
  boxPosition:    'Left' | 'Center' | 'Right';
  bananaPosition: 'Left' | 'Center' | 'Right';
  monkeyOnBox:    boolean;
  hasBanana:      boolean;
}
```

### Actions with Preconditions
| Action | Preconditions | Effect |
|--------|--------------|--------|
| WALK | Monkey on floor, target is adjacent | Monkey moves to target |
| PUSH_BOX | Monkey on floor, at box position, target adjacent | Box + monkey move |
| CLIMB_BOX | Monkey on floor, at box position | monkeyOnBox = true |
| DESCEND_BOX | Monkey on box | monkeyOnBox = false |
| GRAB_BANANA | Monkey on box, box at banana position | hasBanana = true |

### BFS vs DFS
- **BFS**: Queue-based, finds shortest solution (fewest actions), guaranteed optimal
- **DFS**: Stack-based, explores deeply, not guaranteed shortest path, less memory for some graphs

---

## 🔌 API Endpoints

### `GET /api/health`
Returns service health status.

```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z", "version": "1.0.0" }
```

### `POST /api/solve`
Runs BFS or DFS from the given initial state.

**Request:**
```json
{
  "initialState": {
    "monkeyPosition": "Left",
    "boxPosition": "Center",
    "bananaPosition": "Right",
    "monkeyOnBox": false,
    "hasBanana": false
  },
  "algorithm": "BFS",
  "maxStates": 500
}
```

**Response:**
```json
{
  "success": true,
  "plan": [...],
  "exploredNodes": [...],
  "edges": [...],
  "statesGenerated": 12,
  "statesExpanded": 8,
  "solutionLength": 4,
  "planningTime": 2
}
```

### `POST /api/validate-move`
Validates a single action against the current state.

---

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: GitHub Integration (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Monkey & Banana AI Planning System"
   git remote add origin https://github.com/YOUR_USERNAME/monkey-banana-ai.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select the repository
4. Vercel auto-detects the Vite framework — click **Deploy**
5. Your app will be live at `https://monkey-banana-ai.vercel.app`

### Verify Deployment

After deploying, test these URLs:
- `https://your-app.vercel.app` — Main game
- `https://your-app.vercel.app/api/health` — Health check
- `https://your-app.vercel.app/api/solve` — POST with JSON body

---

## 🎮 How to Play

### AI Mode
1. Click **🤖 AI Solve** — the BFS planner computes a solution and animates it
2. Watch the AI reasoning dashboard on the right update in real time
3. Use **⏮ ⏸ ⏭** to step through the plan manually
4. Switch to **DFS** in the algorithm selector to compare approaches

### Manual Mode
1. Click **👋 Manual** to control the monkey yourself
2. **Click the monkey** — triggers a context-aware action
3. **Click the box** — walk toward or push the box
4. **Click the banana** — attempt to grab (will explain why it fails if invalid)

### Controls
| Control | Action |
|---------|--------|
| 🤖 AI Solve | Run planner + animate solution |
| ⏮ | Step backward |
| ⏸/▶ | Pause / Resume |
| ⏭ | Step forward |
| ↺ Reset | Restore initial state |
| 🎲 New | Next scenario |
| Algorithm | Select BFS or DFS |
| Speed | Slow / Normal / Fast |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)               │
│  ┌──────────────┐    ┌────────────────────────────────┐  │
│  │  Game Panel  │    │      AI Reasoning Panel         │  │
│  │  ──────────  │    │  ───────────────────────────   │  │
│  │ GameScene    │    │  StateCard | ActionLog          │  │
│  │ MonkeySVG    │    │  SearchTree | MetricsCard       │  │
│  │ BoxSVG       │    │  ThinkingIndicator              │  │
│  │ BananaSVG    │    └────────────────────────────────┘  │
│  └──────────────┘                                         │
│           │                                               │
│    ┌──────▼──────┐                                       │
│    │  api.ts     │ ← Frontend API service                │
│    │  (+ local   │   with local fallback                  │
│    │  fallback)  │                                        │
│    └──────┬──────┘                                       │
└───────────┼──────────────────────────────────────────────┘
            │ HTTP POST
┌───────────▼──────────────────────────────────────────────┐
│              Vercel Serverless Functions (api/)            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  /api/solve → src/ai/planner.ts (BFS/DFS)           │ │
│  │  /api/validate-move → src/game/gameLogic.ts          │ │
│  │  /api/health → status check                          │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📚 Educational Context

This project demonstrates:
- **Symbolic AI planning** — representing problems as state + actions + goals
- **State-space search** — exploring reachable states to find goal states
- **BFS optimality** — why level-by-level search guarantees shortest solutions
- **Action preconditions** — why invalid actions must be rejected
- **Informed vs uninformed search** — BFS vs DFS tradeoffs

See the **Educational** section in the app for detailed explanations.

---

## 🛠️ Development Notes

- The game logic in `src/game/gameLogic.ts` and `src/ai/planner.ts` is shared between frontend and backend
- The frontend has a local fallback: if `/api/solve` fails, it runs the algorithm in-browser
- All animation timers are properly cleaned up on reset/unmount
- State history is maintained for true step-backward functionality

---

## 📄 License

MIT — free to use for educational purposes.

---

*Built as an AISC college project — demonstrating AI planning, BFS/DFS search, and interactive visualization.*

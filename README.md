# 3D Todo Fullstack Template

A fullstack todo / timer app named **CHRONOS** with a full-viewport WebGL visual — a GPU-driven 3D sphere (or torus-knot particle sculpture) that reacts in real time to the running timer. Supports three timer modes (timer, stopwatch, pomodoro), four visual styles (blob, lattice, metamorph, particles), and four color themes (blue, teal, rose, amber).

## Features

- Three timer modes: countdown timer, stopwatch, pomodoro
- Four WebGL visual modes, switchable at runtime:
  - **Blob** — FBM noise sphere
  - **Lattice** — crystal field
  - **Metamorph** — Perlin + wireframe cage
  - **Particles** — torus-knot point sculpture with mouse-driven rotation
- Four color themes (blue, teal, rose, amber) that recolor both the UI and the shader
- Todo list with per-item durations (click a todo to load its timer)
- Auth-gated per-user todo persistence via tRPC + MySQL
- Live shader parameters (fluid density, turbulence, hue shift, breath rate) with sliders

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3 + shadcn/ui
- Three.js + @react-three/fiber + @react-three/drei
- Custom GLSL vertex + fragment shaders in `src/shaders/`
- tRPC 11 + Hono + Drizzle ORM + MySQL
- Kimi OAuth 2.0 authentication
- React Router v7

## Quick Start

1. Clone / extract this template
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and Kimi OAuth credentials
4. Run database migrations: `npx drizzle-kit push`
5. Run the dev server: `npm run dev`
6. Build for production: `npm run build`

## Configuration

This template does not use `src/config.ts`. All content is inline English UI strings — edit them directly in the component files:

- **`src/App.tsx`** — timer state labels, `VISUAL MODE` chrome, main shell, `SYS // 60 FPS` footer
- **`src/sections/ControlPanel.tsx`** — brand `CHRONOS`, subtitle, mode labels, state pill, slider names, presets, button text, login/logout affordance
- **`src/sections/TodoList.tsx`** — `TODO LIST`, empty / completed states, `ADD NEW TASK`, `Task name…`, `DURATION`, `ADD TASK`
- **`src/types/theme.ts`** — the four named themes (blue / teal / rose / amber) and their panel colors
- **`api/todo-router.ts`** — server-side starter todos (optional; leave empty for a clean first-login experience)

See `info.md` (outer folder) for layout character limits and the full theme schema.

## Theme System

Themes live in `src/types/theme.ts`. When the theme changes, `App.tsx` writes CSS variables (`--panel-dark`, `--panel-mid`, `--panel-light`, `--accent`, `--accent-soft`, `--text-muted`) to `document.documentElement`. Every UI element reads from these variables, and the shaders consume `color1 / color2 / color3` via three.js uniforms — so adding or recoloring a theme only requires editing `src/types/theme.ts`.

## Database Schema

Two tables, defined in `db/schema.ts`:

- **`users`** — Kimi OAuth-managed (id, unionId, name, email, avatar, role)
- **`todos`** — user-owned todos (id, userId, title, durationMs, completedAt, createdAt)

Seed script: `db/seed.ts` can bootstrap todos for a given `userId`.

## Required Assets

No images or videos required. Every visual is procedural (custom GLSL + three.js geometry).

## Project Structure

```
.
├── api/                # tRPC routers (auth, todo), Hono server, Kimi OAuth
├── contracts/          # Shared tRPC types
├── db/                 # Drizzle schema, migrations, seed
├── public/             # Static assets
├── src/
│   ├── sections/       # ControlPanel, TodoList, MorphCanvas (shader mount)
│   ├── shaders/        # GLSL vertex + fragment for the four visual modes
│   ├── types/          # theme.ts
│   ├── hooks/          # useTodos, useAuth
│   └── App.tsx
├── Dockerfile
├── drizzle.config.ts
├── .backend-features.json  # Declares ["auth", "db"]
└── .env.example
```

## Design

- Backgrounds and UI tints come from the active theme's CSS variables
- Fonts: Inter body; ultra-black weight for the big time display; tabular-nums for numbers
- The center shader geometry scales and rotates based on `isRunning / isCompleted / timeRatio`

## Notes

- Don't modify the GLSL shader files unless you're comfortable in GLSL
- A brightness floor (`c1 * 0.5 + vec3(...)`) inside the shaders keeps dark regions tinted by the active theme — removing it will regress the amber / rose / teal themes
- The frontend uses local state for todos by default; when authenticated it switches to the tRPC-backed `api/todo-router.ts` via `useTodos`

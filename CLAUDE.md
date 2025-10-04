# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Wizard Duel** - A real-time multiplayer gesture-based combat game where 2 players use body movements captured via laptop cameras to cast spells and battle each other. Built for HackHarvard 2025.

## Commands

### Development
```bash
# Install all dependencies (run from root)
pnpm install

# Run server (Terminal 1)
pnpm dev:server

# Run client (Terminal 2)
pnpm dev:client
```

Server runs on: http://localhost:3000
Client runs on: http://localhost:5173

### Testing Multiplayer
Open client on two browsers/laptops:
1. Player 1: Create Lobby → get 4-char code
2. Player 2: Join Lobby with code
3. Both: Click "Ready to Battle"
4. Game auto-starts with 3-2-1 countdown

### Manual Move Testing (Console)
```javascript
// In browser console while in active game
window.testMoves.fireball()
window.testMoves.shield()
window.testMoves.lightning()
// etc.
```

## Architecture

### Monorepo Structure
- **pnpm workspace** with two packages: `server/` and `client/`
- Server: Hono + Socket.IO (TypeScript, CommonJS)
- Client: Vite + React + Zustand (TypeScript, ESM)

### Server Architecture (`server/src/`)
- **index.ts** - Server bootstrap, Socket.IO connection handler
- **lobby.ts** - Room management, 4-char code generation, player join/leave
- **game.ts** - Combat logic, move resolution, event log (3s interaction window), HP tracking
- **types.ts** - Shared TypeScript types for events, game state, moves

**Key Server Concepts:**
- **Server-authoritative**: All game state, timestamping, and interaction resolution happens on server
- **Event log system**: 3-second sliding window for move interactions (fireball cancels waterblast, etc.)
- **Phase-based state machine**: `LOBBY_WAITING → LOBBY_READY → ROUND_START → ROUND_ACTIVE → ROUND_END → GAME_END → PHOTO_BOOTH`
- **Best of 3 rounds**: First to 2 round wins takes the game
- **Rooms stored in-memory Map** - no database (hackathon scope)

### Client Architecture (`client/src/`)
```
net/
  socket.ts       # Socket.IO singleton, typed events, connection management
  useSocket.ts    # React hook for socket event subscription

game/
  store.ts        # Zustand state store (phase, players, HP, rounds, moves)
  testMoves.ts    # Console test utilities (window.testMoves.*)

ui/
  Lobby.tsx       # Create/join lobby UI
  Game.tsx        # Main game canvas
  HUD.tsx         # HP bars, round counter, move notifications

vision/           # TODO: MediaPipe Hands + Pose pipeline
fx/               # TODO: Three.js particle effects

components/ui/    # shadcn/ui component library (8bit theme variants)
```

**Key Client Concepts:**
- **Path aliases**: `@/*` maps to `src/*` (configured in tsconfig + vite.config)
- **Zustand store**: Single source of truth for game state
- **Socket.IO hook**: `useSocket.ts` handles real-time event subscriptions in React
- **shadcn/ui**: Component library with custom 8-bit theme variants in `components/ui/8bit/`
- **Gesture detection (TODO)**: Will run MediaPipe locally at 15 FPS, emit discrete `cast` events

### Move System

**7 Moves Total:**
1. **Fireball** - 15 dmg, cancels Water Blast
2. **Water Blast** - 12 dmg, cancels Fireball
3. **Lightning** - 20 dmg, stuns opponent 2s
4. **Shield** - 0 dmg, blocks next attack for 1s
5. **Counter** - 10 dmg, breaks shield + 5 bonus dmg
6. **Meteor** - 25 dmg, 1.2s windup, unblockable
7. **Job Application** - 10 dmg, shoots job application PNG (humor move)

**Interaction System:**
- Moves have `windupTime` before resolving (400-1200ms)
- Server maintains 3s event log for chronological interaction checks
- Interaction types: `cancel`, `block`, `counter`, `stun`
- All moves are **unmissable** (auto-hit unless blocked/countered)

### Game Flow

```
LOBBY_WAITING (waiting for 2nd player)
  ↓
LOBBY_READY (2 players present)
  ↓ (both click "Ready")
ROUND_START (3-2-1 countdown, 3s)
  ↓
ROUND_ACTIVE (combat, move casting, HP tracking)
  ↓ (player HP = 0)
ROUND_END (show round winner, 3s delay)
  ↓ (if winner has < 2 rounds)
ROUND_START (next round)
  ↓ (if winner has 2 rounds)
GAME_END (show game winner, 2s delay)
  ↓
PHOTO_BOOTH (3-2-1 countdown, capture both cameras)
```

### Tech Stack Details

**Server:**
- Hono (lightweight web framework, preferred over Express)
- Socket.IO v4 (WebSocket + fallbacks)
- TypeScript with `ts-node` for dev, `nodemon` for hot reload

**Client:**
- React 19 + Vite 7
- Zustand (state management)
- shadcn/ui + Tailwind CSS v4 (UI components)
- Socket.IO Client
- MediaPipe Hands + Pose (on-device vision, 15 FPS target)
- TensorFlow.js (vision model runtime)
- Three.js (particle effects - TODO)

**Package Manager:**
- **pnpm only** - use `pnpm dlx` instead of `npx`

## Implementation Status

### ✅ Complete
- Server lobby system, room codes, matchmaking
- Server game state orchestration, round/HP tracking
- Server move interaction logic (cancel, block, counter, stun)
- Client Socket.IO connection + typed events
- Client Zustand game state store
- Lobby UI (create/join with codes)
- Game UI shell with HUD (HP bars, round notifications)
- Phase-based routing (lobby → game → end)
- Real-time event handling (moves, damage, interactions)
- Manual test utilities (`window.testMoves.*`)

### 🚧 TODO
- **Vision pipeline** - MediaPipe Hands + Pose, gesture detection FSM, camera feed
- **Visual effects** - Three.js particles, attack animations, camera overlay
- **Audio** - SFX (whoosh, explosion, shield), upbeat background music
- **Photo booth** - End game 3-2-1 countdown, camera capture, winner/loser composite
- **End game flow** - Winner screen, play again button

## Development Notes

- **All game logic is server-authoritative** - clients only render state and send discrete actions
- **Use pnpm dlx**, not npx (project convention)
- **Server uses CommonJS** (`module: "CommonJS"` in tsconfig), client uses ESM
- **shadcn/ui components** - both regular and 8-bit theme variants available in `client/src/components/ui/`
- **Socket events are fully typed** - see `types.ts` for event schemas
- **Player effects** (shield, stun) are tracked with expiration timestamps
- **Event log cleanup** happens automatically to prevent memory leaks (3s TTL)
- **Rooms are ephemeral** - deleted when empty (no persistence layer)

## Aesthetic / UX Notes

- **Party game vibes** - fun-optimized, upbeat/hyper (not tense)
- **Bright colors, exaggerated effects**
- **All attacks are unmissable** - no dodging, only blocking/countering
- **Job Application move** should be hilarious (find funny stock photo)
- **Photo booth** should have over-the-top winner/loser treatments

# FIREBALL 🔥⚡

A real-time multiplayer gesture-based combat game where players use their body movements to cast spells and battle each other. Built for HackHarvard 2025.

## What We've Built So Far ✅

### Server (Complete)
- **Lobby System**: Create/join lobbies with 4-character codes
- **Game State Management**: Full round-based system (best of 3)
- **Event Log System**: 3-second interaction window for move cancellations
- **Move Interaction Logic**: Fireball cancels Water Blast, Shield blocks, Counter breaks shield, etc.
- **HP Tracking**: Real-time damage calculation and round/game winner determination

### Client (Complete - Core Infrastructure)
- **Lobby UI**: Create lobby or join with code
- **Socket.IO Integration**: Real-time bidirectional communication
- **Game State Store**: Zustand-based state management
- **HUD**: HP bars, round counter, move notifications
- **Phase Management**: Automatic transitions through game flow

### Game Flow (Working)
```
LOBBY_WAITING → LOBBY_READY (2 players)
→ ROUND_START (3-2-1 countdown)
→ ROUND_ACTIVE (combat)
→ ROUND_END (HP = 0)
→ [repeat if < 2 wins, else → GAME_END]
```

## What's Left to Build 🚧

### High Priority (Core Gameplay)
1. **Vision Pipeline** (`client/src/vision/`)
   - MediaPipe Hands + Pose initialization
   - Landmark extraction and feature engineering
   - Gesture FSM (finite state machine) for 7 moves
   - Camera feed display

2. **Move Detection**
   - Implement 7 gesture recognizers:
     - Fireball (Kamehameha)
     - Water Blast (arms crossed → sweep)
     - Lightning (Zeus pose)
     - Shield (boxing stance)
     - Counter (cross-block → open)
     - Meteor (arms up → slam down)
     - Job Application (prayer hands → shoots PNG lol)
   - Connect gesture detection to `socket.emit("cast", move, timestamp)`

3. **Visual Effects** (`client/src/fx/`)
   - Three.js particle systems for each move
   - Attack animations (projectiles moving toward opponent)
   - Hit/block/interaction effects
   - Camera feed as background layer

### Medium Priority (Polish)
4. **Audio System**
   - Web Audio API for SFX (whoosh, explosion, shield, heal)
   - Background music (upbeat/hyper party vibes)
   - Audio manager with volume controls

5. **Photo Booth** (`client/src/ui/PhotoBooth.tsx`)
   - 3-2-1 countdown after game end
   - Capture both camera feeds
   - Split-screen winner/loser composite
   - Replay button → back to lobby

6. **End Game Flow**
   - Winner announcement screen
   - Transition to photo booth
   - Play again functionality

### Nice to Have
- Gesture calibration screen (teach 3 samples per move)
- Skeletal overlay for debugging gestures
- Combat log display
- Move cooldowns/charge indicators
- Better mobile responsiveness

## Tech Stack

**Server:**
- Hono (lightweight web framework)
- Socket.IO (WebSocket communication)
- TypeScript

**Client:**
- React + Vite
- Socket.IO Client
- Zustand (state management)
- shadcn/ui + Tailwind CSS v4 (UI components)
- Three.js (particles/effects)
- MediaPipe Hands + Pose (gesture detection)
- TensorFlow.js (vision models)

## Project Structure

```
server/src/
  index.ts       # Server bootstrap + Socket.IO setup
  types.ts       # Shared types (moves, game state, events)
  lobby.ts       # Room management, matchmaking
  game.ts        # Combat logic, event log, interactions

client/src/
  net/
    socket.ts    # Socket.IO connection + type definitions
    useSocket.ts # React hook for socket events
  game/
    store.ts     # Zustand game state store
  ui/
    Lobby.tsx    # Lobby create/join UI
    Game.tsx     # Main game canvas
    HUD.tsx      # HP bars, notifications
  vision/        # TODO: MediaPipe pipeline
  fx/            # TODO: Three.js effects
```

## Running the Project

### Install Dependencies
```bash
pnpm install
```

### Development
```bash
# Terminal 1: Run server
pnpm dev:server

# Terminal 2: Run client
pnpm dev:client
```

Server: http://localhost:3000  
Client: http://localhost:5173

### Testing Multiplayer
1. Open client on two laptops (or two browser windows)
2. Player 1: Click "Create Lobby", get code (e.g., ABCD)
3. Player 2: Enter code and click "Join Lobby"
4. Both click "Ready to Battle"
5. Game starts with 3-2-1 countdown

## Next Steps for Team

### To Test Lobby System (Works Now!)
1. Run both server and client
2. Test create/join flow on two devices
3. Verify phase transitions (LOBBY → ROUND_START → ROUND_ACTIVE)
4. Check console logs for Socket.IO events

### To Add Gesture Detection
1. Create `client/src/vision/detector.ts`
2. Initialize MediaPipe: `HandLandmarker` + `PoseLandmarker`
3. Get camera feed: `navigator.mediaDevices.getUserMedia()`
4. Run inference loop at 15 FPS
5. Extract features from landmarks (angles, distances, velocities)
6. Build FSM for each gesture (hold time, thresholds)
7. On gesture detected: `socket.emit("cast", moveType, Date.now())`

### To Add Visual Effects
1. Create `client/src/fx/particles.ts`
2. Set up Three.js scene with camera/renderer
3. Build particle system factory for each move
4. Listen to `moveExecuted` socket event
5. Spawn particles and animate toward opponent
6. Display camera feed as background via `<video>` element + canvas overlay

## The 7 Moves

| Move | Gesture | Damage | Special |
|------|---------|--------|---------|
| Fireball | Hands at chest → push forward | 15 | Cancels Water Blast |
| Water Blast | Arms crossed → sweep out | 12 | Cancels Fireball |
| Lightning | One arm up, one forward | 20 | Stuns opponent (2s) |
| Shield | Boxing stance (fists up) | 0 | Blocks next attack (1s) |
| Counter | Cross-block → open | 10 | Breaks shield + 5 bonus dmg |
| Meteor | Arms raised → slam down | 25 | Slow (1.2s), can't be blocked |
| Job Application | Prayer hands | 10 | Shoots PNG at opponent (lol) |

## Interaction Rules

- **Cancel**: Fireball + Water Blast = both nullified
- **Block**: Shield active = next attack blocked (unless Meteor/Counter)
- **Counter**: Breaks active shield + deals bonus damage
- **Stun**: Lightning stuns opponent for 2s (can't cast)

## Known Issues / TODOs

- [ ] Camera not yet initialized
- [ ] Gestures not detected (vision pipeline needed)
- [ ] No visual effects yet
- [ ] No audio
- [ ] Photo booth not implemented
- [ ] Need play again button at end
- [ ] Inline styles (fine for hackathon but could extract to CSS modules)

## Debug Tips

**Server logs:**
```
Player connected: <socket_id>
Lobby created: ABCD by <socket_id>
Player <socket_id> joined lobby ABCD
Phase change: ROUND_START
Move executed: fireball by <socket_id>
```

**Client console:**
```javascript
// Check connection
console.log(useGameStore.getState())

// Manually test casting
import { getSocket } from './net/socket'
getSocket().emit("cast", "fireball", Date.now())
```

## Resources

- [MediaPipe Hands Docs](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- [MediaPipe Pose Docs](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [Three.js Particles](https://threejs.org/docs/#api/en/objects/Points)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)

## Party Game Aesthetic Notes

- **Upbeat/hyper music**, not tense
- **Fun-optimized** visuals (bright colors, exaggerated effects)
- **All moves unmissable** (attacks auto-hit unless blocked)
- **Job Application PNG** should be hilarious (find a funny stock photo)
- **Photo booth** should have over-the-top winner/loser treatments

---

Built with ❤️ and chaos at HackHarvard 2025


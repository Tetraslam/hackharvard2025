import type { Server, Socket } from "socket.io";
import { getGameState, updateGameState } from "./lobby";
import type {
  ClientToServerEvents,
  GameState,
  MoveEvent,
  MoveType,
  PlayerEffect,
  ServerToClientEvents,
  SocketData,
} from "./types";

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

interface MoveDefinition {
  damage: number;
  windupTime: number;
  cancels?: MoveType[];
  canceledBy?: MoveType[];
  breaksShield?: boolean;
  canBeBlocked?: boolean;
  stuns?: boolean;
}

const MOVES: Record<MoveType, MoveDefinition> = {
  fireball: {
    damage: 15,
    windupTime: 400,
    cancels: ["waterblast"],
    canceledBy: ["waterblast"],
    canBeBlocked: true,
  },
  waterblast: {
    damage: 12,
    windupTime: 300,
    cancels: ["fireball"],
    canceledBy: ["fireball"],
    canBeBlocked: true,
  },
  lightning: { damage: 20, windupTime: 500, canBeBlocked: true, stuns: true },
  shield: { damage: 0, windupTime: 200, canBeBlocked: false },
  counter: {
    damage: 10,
    windupTime: 300,
    breaksShield: true,
    canBeBlocked: false,
  },
  meteor: { damage: 25, windupTime: 1200, canBeBlocked: false },
  jobapplication: { damage: 10, windupTime: 600, canBeBlocked: true },
};

const INTERACTION_WINDOW_MS = 3000;
const SHIELD_DURATION_MS = 1000;
const STUN_DURATION_MS = 2000;

export function handleCast(
  io: Server,
  socket: TypedSocket,
  move: MoveType,
  _clientTimestamp: number,
): void {
  const roomCode = socket.data.roomCode;
  if (!roomCode) {
    socket.emit("error", "Not in a room");
    return;
  }

  const gameState = getGameState(roomCode);
  if (!gameState) {
    socket.emit("error", "Game state not found");
    return;
  }

  if (gameState.phase !== "ROUND_ACTIVE") {
    socket.emit("error", "Round not active");
    return;
  }

  const player = gameState.players.get(socket.id);
  if (!player) {
    socket.emit("error", "Player not found");
    return;
  }

  const stunEffect = player.activeEffects.find(
    (e) => e.type === "stun" && e.expiresAt > Date.now(),
  );
  if (stunEffect) {
    socket.emit("error", "You are stunned!");
    return;
  }

  const serverTimestamp = Date.now();
  const moveEvent: MoveEvent = {
    playerId: socket.id,
    move,
    timestamp: serverTimestamp,
    resolved: false,
    damage: MOVES[move].damage,
  };

  gameState.eventLog.push(moveEvent);
  cleanupEventLog(gameState);

  io.to(roomCode).emit("moveExecuted", {
    playerId: socket.id,
    move,
    timestamp: serverTimestamp,
  });

  setTimeout(() => {
    resolveMoveEffect(io, roomCode, moveEvent);
  }, MOVES[move].windupTime);
}

function resolveMoveEffect(
  io: Server,
  roomCode: string,
  moveEvent: MoveEvent,
): void {
  const gameState = getGameState(roomCode);
  if (!gameState) return;

  if (moveEvent.resolved) return;
  moveEvent.resolved = true;

  const player = gameState.players.get(moveEvent.playerId);
  if (!player) return;

  const opponentId = Array.from(gameState.players.keys()).find(
    (id) => id !== moveEvent.playerId,
  );
  if (!opponentId) return;

  const opponent = gameState.players.get(opponentId);
  if (!opponent) return;

  const moveDef = MOVES[moveEvent.move];

  if (moveEvent.move === "shield") {
    const shieldEffect: PlayerEffect = {
      type: "shield",
      expiresAt: Date.now() + SHIELD_DURATION_MS,
    };
    player.activeEffects.push(shieldEffect);
    updateGameState(roomCode, gameState);
    return;
  }

  const recentOpponentMoves = gameState.eventLog.filter(
    (e) =>
      e.playerId === opponentId &&
      e.timestamp > moveEvent.timestamp - INTERACTION_WINDOW_MS &&
      e.timestamp < moveEvent.timestamp,
  );

  if (moveDef.cancels) {
    for (const cancelMove of moveDef.cancels) {
      const cancelEvent = recentOpponentMoves.find(
        (e) => e.move === cancelMove && !e.resolved,
      );
      if (cancelEvent) {
        cancelEvent.resolved = true;
        io.to(roomCode).emit("interaction", {
          moves: [moveEvent.move, cancelMove],
          type: "cancel",
          players: [moveEvent.playerId, opponentId],
        });
        updateGameState(roomCode, gameState);
        return;
      }
    }
  }

  const activeShield = opponent.activeEffects.find(
    (e) => e.type === "shield" && e.expiresAt > Date.now(),
  );

  if (activeShield && moveDef.canBeBlocked) {
    if (moveDef.breaksShield) {
      opponent.activeEffects = opponent.activeEffects.filter(
        (e) => e.type !== "shield",
      );
      const bonusDamage = 5;
      opponent.hp -= bonusDamage;
      io.to(roomCode).emit("interaction", {
        moves: [moveEvent.move],
        type: "counter",
        players: [moveEvent.playerId, opponentId],
      });
      io.to(roomCode).emit("damageDealt", {
        targetId: opponentId,
        damage: bonusDamage,
        newHp: opponent.hp,
      });
    } else {
      io.to(roomCode).emit("interaction", {
        moves: [moveEvent.move],
        type: "block",
        players: [opponentId, moveEvent.playerId],
      });
      updateGameState(roomCode, gameState);
      return;
    }
  } else {
    opponent.hp -= moveDef.damage;
    io.to(roomCode).emit("damageDealt", {
      targetId: opponentId,
      damage: moveDef.damage,
      newHp: opponent.hp,
    });
  }

  if (moveDef.stuns) {
    const stunEffect: PlayerEffect = {
      type: "stun",
      expiresAt: Date.now() + STUN_DURATION_MS,
    };
    opponent.activeEffects.push(stunEffect);
  }

  if (opponent.hp <= 0) {
    endRound(io, roomCode, moveEvent.playerId, opponentId);
  }

  updateGameState(roomCode, gameState);
}

function endRound(
  io: Server,
  roomCode: string,
  winnerId: string,
  loserId: string,
): void {
  const gameState = getGameState(roomCode);
  if (!gameState) return;

  const winner = gameState.players.get(winnerId);
  const loser = gameState.players.get(loserId);
  if (!winner || !loser) return;

  winner.roundsWon++;
  gameState.phase = "ROUND_END";

  io.to(roomCode).emit("roundEnd", {
    winnerId,
    loserId,
    winnerRounds: winner.roundsWon,
    loserRounds: loser.roundsWon,
  });

  if (winner.roundsWon >= 2) {
    setTimeout(() => {
      endGame(io, roomCode, winnerId, loserId);
    }, 3000);
  } else {
    setTimeout(() => {
      startNextRound(io, roomCode);
    }, 3000);
  }

  updateGameState(roomCode, gameState);
}

function startNextRound(io: Server, roomCode: string): void {
  const gameState = getGameState(roomCode);
  if (!gameState) return;

  gameState.currentRound++;
  gameState.phase = "ROUND_START";
  gameState.eventLog = [];

  gameState.players.forEach((player) => {
    player.hp = 100;
    player.activeEffects = [];
  });

  io.to(roomCode).emit("gamePhaseChange", "ROUND_START", {
    round: gameState.currentRound,
  });

  setTimeout(() => {
    gameState.phase = "ROUND_ACTIVE";
    io.to(roomCode).emit("gamePhaseChange", "ROUND_ACTIVE");
    updateGameState(roomCode, gameState);
  }, 3000);

  updateGameState(roomCode, gameState);
}

function endGame(
  io: Server,
  roomCode: string,
  winnerId: string,
  loserId: string,
): void {
  const gameState = getGameState(roomCode);
  if (!gameState) return;

  gameState.phase = "GAME_END";
  gameState.winner = winnerId;

  io.to(roomCode).emit("gameEnd", {
    winnerId,
    loserId,
  });

  setTimeout(() => {
    gameState.phase = "PHOTO_BOOTH";
    io.to(roomCode).emit("gamePhaseChange", "PHOTO_BOOTH");
    updateGameState(roomCode, gameState);
  }, 2000);

  updateGameState(roomCode, gameState);
}

function cleanupEventLog(gameState: GameState): void {
  const now = Date.now();
  gameState.eventLog = gameState.eventLog.filter(
    (e) => e.timestamp > now - INTERACTION_WINDOW_MS,
  );
}

export function handlePlayAgain(io: Server, socket: TypedSocket): void {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;

  const gameState = getGameState(roomCode);
  if (!gameState) return;

  gameState.phase = "LOBBY_READY";
  gameState.currentRound = 0;
  gameState.eventLog = [];
  gameState.winner = undefined;

  gameState.players.forEach((player) => {
    player.hp = 100;
    player.roundsWon = 0;
    player.ready = true;
    player.activeEffects = [];
  });

  updateGameState(roomCode, gameState);

  setTimeout(() => {
    const updatedState = getGameState(roomCode);
    if (updatedState) {
      updatedState.currentRound++;
      updatedState.phase = "ROUND_START";
      io.to(roomCode).emit("gamePhaseChange", "ROUND_START", {
        round: updatedState.currentRound,
      });

      setTimeout(() => {
        if (updatedState.phase === "ROUND_START") {
          updatedState.phase = "ROUND_ACTIVE";
          io.to(roomCode).emit("gamePhaseChange", "ROUND_ACTIVE");
          updateGameState(roomCode, updatedState);
        }
      }, 3000);

      updateGameState(roomCode, updatedState);
    }
  }, 1000);
}

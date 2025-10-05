import { io, type Socket } from "socket.io-client";

export type MoveType = 
  | "fireball" 
  | "waterblast" 
  | "lightning" 
  | "shield" 
  | "counter" 
  | "meteor" 
  | "jobapplication";

export type GamePhase = 
  | "LOBBY_WAITING"
  | "LOBBY_READY"
  | "ROUND_START"
  | "ROUND_ACTIVE"
  | "ROUND_END"
  | "GAME_END"
  | "PHOTO_BOOTH";

export interface Player {
  hp: number;
  roundsWon: number;
  ready: boolean;
  activeEffects: PlayerEffect[];
}

export interface PlayerEffect {
  type: "shield" | "stun";
  expiresAt: number;
}

interface ClientToServerEvents {
  createLobby: (name: string, callback: (code: string) => void) => void;
  joinLobby: (code: string, name: string, callback: (success: boolean, error?: string, players?: Record<string, { name: string }>) => void) => void;
  ready: () => void;
  unready: () => void;
  cast: (move: MoveType, clientTimestamp: number) => void;
  photoReady: () => void;
  playAgain: () => void;
  rtcOffer: (offer: RTCSessionDescriptionInit) => void;
  rtcAnswer: (answer: RTCSessionDescriptionInit) => void;
  rtcIceCandidate: (candidate: RTCIceCandidateInit) => void;
}

interface ServerToClientEvents {
  lobbyCreated: (code: string) => void;
  lobbyJoined: (success: boolean, error?: string, players?: Record<string, { name: string }>) => void;
  playerJoined: (playerId: string, playerName: string, playerCount: number) => void;
  playerLeft: (playerId: string) => void;
  playerReady: (playerId: string) => void;
  playerUnready: (playerId: string) => void;
  gamePhaseChange: (phase: GamePhase, data?: Record<string, unknown>) => void;
  gameStateUpdate: (state: {
    players: Record<string, Player>;
    currentRound: number;
    phase: GamePhase;
  }) => void;
  moveExecuted: (data: {
    playerId: string;
    move: MoveType;
    timestamp: number;
  }) => void;
  interaction: (data: {
    moves: MoveType[];
    type: "cancel" | "block" | "counter" | "stun";
    players: string[];
  }) => void;
  damageDealt: (data: {
    targetId: string;
    damage: number;
    newHp: number;
  }) => void;
  roundEnd: (data: {
    winnerId: string;
    loserId: string;
    winnerRounds: number;
    loserRounds: number;
  }) => void;
  gameEnd: (data: {
    winnerId: string;
    loserId: string;
  }) => void;
  error: (message: string) => void;
  rtcOffer: (fromId: string, offer: RTCSessionDescriptionInit) => void;
  rtcAnswer: (fromId: string, answer: RTCSessionDescriptionInit) => void;
  rtcIceCandidate: (fromId: string, candidate: RTCIceCandidateInit) => void;
}

// Use the same host as the current page, but port 3000 for the server
const SERVER_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socketInstance) {
    socketInstance = io(SERVER_URL, {
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function connectSocket(): void {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket(): void {
  socketInstance?.disconnect();
}


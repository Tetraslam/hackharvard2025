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
  id: string;
  name: string;
  hp: number;
  roundsWon: number;
  ready: boolean;
  activeEffects: PlayerEffect[];
}

export interface PlayerEffect {
  type: "shield" | "stun";
  expiresAt: number;
}

export interface MoveEvent {
  playerId: string;
  move: MoveType;
  timestamp: number;
  resolved: boolean;
  damage?: number;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Map<string, Player>;
  currentRound: number;
  eventLog: MoveEvent[];
  winner?: string;
}

export interface ClientToServerEvents {
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

export interface ServerToClientEvents {
  lobbyCreated: (code: string) => void;
  lobbyJoined: (success: boolean, error?: string, players?: Record<string, { name: string }>) => void;
  playerJoined: (playerId: string, playerName: string, playerCount: number) => void;
  playerLeft: (playerId: string) => void;
  playerReady: (playerId: string) => void;
  playerUnready: (playerId: string) => void;
  gamePhaseChange: (phase: GamePhase, data?: Record<string, unknown>) => void;
  gameStateUpdate: (state: {
    players: Record<string, Omit<Player, "id">>;
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

export type InterServerEvents = Record<string, never>;

export interface SocketData {
  roomCode?: string;
  playerId: string;
}


import { create } from "zustand";
import type { GamePhase, MoveType, Player } from "../net/socket";

interface GameStore {
  phase: GamePhase;
  roomCode: string | null;
  playerId: string | null;
  playerName: string | null;
  opponentId: string | null;
  opponentName: string | null;
  players: Record<string, Player>;
  currentRound: number;
  lastMove: { playerId: string; move: MoveType; timestamp: number } | null;
  lastInteraction: { type: string; moves: MoveType[] } | null;
  winnerId: string | null;
  error: string | null;
  isReady: boolean;
  opponentReady: boolean;
  
  setPhase: (phase: GamePhase) => void;
  setRoomCode: (code: string) => void;
  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setOpponentId: (id: string) => void;
  setOpponentName: (name: string) => void;
  updatePlayers: (players: Record<string, Player>) => void;
  updatePlayerHp: (playerId: string, hp: number) => void;
  setCurrentRound: (round: number) => void;
  setLastMove: (move: { playerId: string; move: MoveType; timestamp: number }) => void;
  setLastInteraction: (interaction: { type: string; moves: MoveType[] }) => void;
  setWinner: (winnerId: string) => void;
  setError: (error: string | null) => void;
  setReady: (ready: boolean) => void;
  setOpponentReady: (ready: boolean) => void;
  reset: () => void;
}

const initialState = {
  phase: "LOBBY_WAITING" as GamePhase,
  roomCode: null,
  playerId: null,
  playerName: null,
  opponentId: null,
  opponentName: null,
  players: {},
  currentRound: 0,
  lastMove: null,
  lastInteraction: null,
  winnerId: null,
  error: null,
  isReady: false,
  opponentReady: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),
  
  setRoomCode: (code) => set({ roomCode: code }),
  
  setPlayerId: (id) => set({ playerId: id }),
  
  setPlayerName: (name) => set({ playerName: name }),
  
  setOpponentId: (id) => set({ opponentId: id }),
  
  setOpponentName: (name) => set({ opponentName: name }),
  
  updatePlayers: (players) => set({ players }),
  
  updatePlayerHp: (playerId, hp) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerId]: { ...state.players[playerId], hp },
      },
    })),
  
  setCurrentRound: (round) => set({ currentRound: round }),
  
  setLastMove: (move) => set({ lastMove: move }),
  
  setLastInteraction: (interaction) => set({ lastInteraction: interaction }),
  
  setWinner: (winnerId) => set({ winnerId }),
  
  setError: (error) => set({ error }),
  
  setReady: (ready) => set({ isReady: ready }),
  
  setOpponentReady: (ready) => set({ opponentReady: ready }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  reset: () => set(initialState),
}));


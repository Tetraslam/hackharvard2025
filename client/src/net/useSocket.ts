import { useEffect } from "react";
import { playBgm } from "@/lib/utils";
import { useGameStore } from "../game/store";
import { connectSocket, getSocket } from "./socket";

export function useSocketEvents() {
  const {
    setPhase,
    setPlayerId,
    setOpponentId,
    setOpponentName,
    updatePlayers,
    updatePlayerHp,
    setCurrentRound,
    setLastMove,
    setLastInteraction,
    setWinner,
    setError,
    setOpponentReady,
    playerId,
  } = useGameStore();

  useEffect(() => {
    const socket = getSocket();
    connectSocket();

    if (!socket.hasListeners("connect")) {
      socket.on("connect", () => {
        console.log("Connected to server:", socket.id);
        if (socket.id) {
          setPlayerId(socket.id);
        }
      });
    }

    socket.on("playerJoined", (joinedPlayerId: string, playerName: string) => {
      console.log("Player joined:", joinedPlayerId, playerName);
      if (playerId && joinedPlayerId !== playerId) {
        setOpponentId(joinedPlayerId);
        setOpponentName(playerName);
      }
    });

    socket.on("playerLeft", (leftPlayerId: string) => {
      console.log("Player left:", leftPlayerId);
      if (leftPlayerId === useGameStore.getState().opponentId) {
        setOpponentId(null);
        setOpponentReady(false);
      }
    });

    socket.on("playerReady", (readyPlayerId: string) => {
      console.log("Player ready:", readyPlayerId);
      if (readyPlayerId === useGameStore.getState().opponentId) {
        setOpponentReady(true);
      }
    });

    socket.on("playerUnready", (unreadyPlayerId: string) => {
      console.log("Player unready:", unreadyPlayerId);
      if (unreadyPlayerId === useGameStore.getState().opponentId) {
        setOpponentReady(false);
      }
    });

    socket.on("gamePhaseChange", (phase, data) => {
      console.log("Phase change:", phase, data);
      setPhase(phase);
      if (data && "round" in data) {
        setCurrentRound(data.round as number);
      }

      // Audio routing
      if (phase === "LOBBY_WAITING" || phase === "LOBBY_READY") {
        playBgm("/audio/bgm_upbeat.mp3", 0.35);
      } else if (phase === "ROUND_ACTIVE") {
        playBgm("/audio/bgm_battle.mp3", 0.45);
      } else if (phase === "GAME_END" || phase === "PHOTO_BOOTH") {
        playBgm("/audio/bgm_upbeat.mp3", 0.35);
      }
    });

    socket.on("gameStateUpdate", (state) => {
      console.log("Game state update:", state);
      updatePlayers(state.players);
      setCurrentRound(state.currentRound);
      setPhase(state.phase);
    });

    socket.on("moveExecuted", (data) => {
      console.log("Move executed:", data);
      setLastMove(data);
    });

    socket.on("interaction", (data) => {
      console.log("Interaction:", data);
      setLastInteraction({ type: data.type, moves: data.moves });
      setTimeout(() => setLastInteraction(null), 2000);
    });

    socket.on("damageDealt", (data) => {
      console.log("Damage dealt:", data);
      updatePlayerHp(data.targetId, data.newHp);
    });

    socket.on("roundEnd", (data) => {
      console.log("Round end:", data);
      updatePlayers({
        [data.winnerId]: {
          hp: 100,
          roundsWon: data.winnerRounds,
          ready: false,
          activeEffects: [],
        },
        [data.loserId]: {
          hp: 0,
          roundsWon: data.loserRounds,
          ready: false,
          activeEffects: [],
        },
      });
    });

    socket.on("gameEnd", (data) => {
      console.log("Game end:", data);
      setWinner(data.winnerId);
    });

    socket.on("error", (message) => {
      console.error("Server error:", message);
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off("connect");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("playerReady");
      socket.off("playerUnready");
      socket.off("gamePhaseChange");
      socket.off("gameStateUpdate");
      socket.off("moveExecuted");
      socket.off("interaction");
      socket.off("damageDealt");
      socket.off("roundEnd");
      socket.off("gameEnd");
      socket.off("error");
    };
  }, [
    setPhase,
    setPlayerId,
    setOpponentId,
    updatePlayers,
    updatePlayerHp,
    setCurrentRound,
    setLastMove,
    setLastInteraction,
    setWinner,
    setError,
    setOpponentReady,
    playerId,
    setOpponentName,
  ]);
}

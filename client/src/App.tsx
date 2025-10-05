import { useEffect } from "react";
import { useGameStore } from "@/game/store";
import { useSocketEvents } from "@/net/useSocket";
import { Game } from "@/ui/Game";
import { Lobby } from "@/ui/Lobby";
import { Rules } from "@/ui/Rules";

function App() {
  useSocketEvents();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const { phase, currentView } = useGameStore();

  // Handle rules view
  if (currentView === "rules") {
    return <Rules />;
  }

  const isLobby = phase === "LOBBY_WAITING" || phase === "LOBBY_READY";
  const isGame =
    phase === "ROUND_START" ||
    phase === "ROUND_ACTIVE" ||
    phase === "ROUND_END" ||
    phase === "PHOTO_BOOTH" ||
    phase === "GAME_END";

  if (isLobby) {
    return <Lobby />;
  }

  if (isGame) {
    return <Game />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">FIREBALL</h1>
        <p className="text-muted-foreground">Phase: {phase}</p>
      </div>
    </div>
  );
}

export default App;

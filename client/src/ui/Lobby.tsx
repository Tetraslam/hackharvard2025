import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/8bit/avatar";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Input } from "@/components/ui/8bit/input";
import { Label } from "@/components/ui/8bit/label";
import { Separator } from "@/components/ui/8bit/separator";
import { useGameStore } from "@/game/store";
import { getSocket } from "@/net/socket";

export function Lobby() {
  const nameInputId = useId();
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    roomCode,
    setRoomCode,
    phase,
    playerId,
    playerName: storedPlayerName,
    opponentId,
    opponentName,
    setPlayerName: storePlayerName,
    setOpponentId,
    setOpponentName,
  } = useGameStore();

  const handleCreate = () => {
    if (!playerName.trim()) return;

    setLoading(true);
    const socket = getSocket();
    socket.emit("createLobby", playerName, (code: string) => {
      setRoomCode(code);
      storePlayerName(playerName);
      setLoading(false);
    });
  };

  const handleJoin = () => {
    if (!joinCode || joinCode.length !== 4 || !playerName.trim()) {
      return;
    }

    setLoading(true);
    const socket = getSocket();
    socket.emit(
      "joinLobby",
      joinCode.toUpperCase(),
      playerName,
      (
        success: boolean,
        error?: string,
        players?: Record<string, { name: string }>,
      ) => {
        setLoading(false);
        if (success) {
          setRoomCode(joinCode.toUpperCase());
          storePlayerName(playerName);

          if (players) {
            const otherPlayer = Object.entries(players).find(
              ([id]) => id !== socket.id,
            );
            if (otherPlayer) {
              setOpponentId(otherPlayer[0]);
              setOpponentName(otherPlayer[1].name);
            }
          }
        } else {
          console.error(error);
        }
      },
    );
  };

  const handleReady = () => {
    const socket = getSocket();
    socket.emit("ready");
  };

  if (!roomCode) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 md:p-8">
        <div className="relative z-10 w-full max-w-5xl space-y-40 md:space-y-56">
          <div className="space-y-6 md:space-y-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold retro leading-[1.8]">
              FIREBALL
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-[2.5]">
              Cast spells with your body. May the best wizard win.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-12">
            {/* Create Lobby Panel */}
            <Card className="flex flex-col flex-1 min-h-[600px] md:min-h-[650px]">
              <CardHeader className="pb-8 pt-12 px-12">
                <CardTitle className="text-2xl md:text-3xl retro leading-[1.8] text-center">
                  Create New Lobby
                </CardTitle>
                <CardDescription className="text-center text-sm md:text-base leading-[2.5] mt-6">
                  Start a new game and share the code with a friend
                </CardDescription>
                <Separator className="mt-12" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-10 px-16 py-8 pb-12">
                <Label
                  htmlFor={nameInputId}
                  className="text-base md:text-lg leading-[2] mb-2"
                >
                  Your Name
                </Label>
                <Input
                  id={nameInputId}
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your wizard name"
                  maxLength={20}
                  className="text-base md:text-lg h-16 px-8 py-6"
                />

                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading || !playerName.trim()}
                  className="w-full text-base md:text-lg h-16 mt-auto retro"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Lobby ▶"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Join Lobby Panel */}
            <Card className="flex flex-col flex-1 min-h-[600px] md:min-h-[650px]">
              <CardHeader className="pb-8 pt-12 px-12">
                <CardTitle className="text-2xl md:text-3xl retro leading-[1.8] text-center">
                  Join Existing Lobby
                </CardTitle>
                <CardDescription className="text-center text-sm md:text-base leading-[2.5] mt-6">
                  Enter the 4-character code from your friend
                </CardDescription>
                <Separator className="mt-12" />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-10 px-16 py-8 pb-12">
                <Label className="text-base md:text-lg leading-[2] mb-2">
                  Lobby Code
                </Label>
                <Input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={4}
                  className="text-center text-xl md:text-2xl lg:text-3xl font-mono uppercase tracking-[0.5em] h-16 px-8 py-6"
                />

                <Label className="text-base md:text-lg leading-[2] mb-2">
                  Your Name
                </Label>
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your wizard name"
                  maxLength={20}
                  className="text-base md:text-lg h-16 px-8 py-6"
                />

                <Button
                  type="button"
                  onClick={handleJoin}
                  disabled={
                    loading ||
                    !joinCode ||
                    joinCode.length !== 4 ||
                    !playerName.trim()
                  }
                  variant="secondary"
                  size="lg"
                  className="w-full text-base md:text-lg h-16 mt-auto retro"
                >
                  Join Lobby ▶
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-8">
      <div className="relative z-10 w-full max-w-6xl space-y-20">
        <div className="text-center space-y-10">
          <h1 className="text-6xl font-bold retro leading-[1.8]">
            Lobby: {roomCode}
          </h1>
          <p className="text-lg text-muted-foreground leading-[2.5]">
            {phase === "LOBBY_WAITING"
              ? "Waiting for players to join..."
              : "All players ready!"}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader className="space-y-6 pb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-bold retro">
                    {storedPlayerName?.charAt(0).toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-3xl retro leading-[1.8]">
                    {storedPlayerName || "You"}
                  </CardTitle>
                  <Badge>Ready</Badge>
                </div>
              </div>
              <Separator />
              <CardDescription className="font-mono text-xs leading-[2]">
                ID: {playerId?.slice(0, 12)}...
              </CardDescription>
            </CardHeader>
          </Card>

          {opponentId && opponentName ? (
            <Card>
              <CardHeader className="space-y-6 pb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl font-bold retro">
                      {opponentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-3xl retro leading-[1.8]">
                      {opponentName}
                    </CardTitle>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                </div>
                <Separator />
                <CardDescription className="font-mono text-xs leading-[2]">
                  ID: {opponentId.slice(0, 12)}...
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex h-full min-h-[200px] items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="text-6xl opacity-20 retro">?</div>
                  <CardDescription className="text-lg leading-[2.5]">
                    Waiting for opponent...
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {phase === "LOBBY_READY" && (
          <div className="flex justify-center pt-10">
            <Button
              type="button"
              onClick={handleReady}
              size="lg"
              className="text-2xl px-16 py-10 retro"
            >
              Ready to Battle
            </Button>
          </div>
        )}

        {phase === "LOBBY_WAITING" && opponentId === null && (
          <Card>
            <CardContent className="py-10 text-center space-y-6">
              <p className="text-base text-muted-foreground leading-[2.5]">
                Share this code with your opponent:
              </p>
              <p className="retro text-5xl leading-[2]">{roomCode}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

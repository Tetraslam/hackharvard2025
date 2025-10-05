import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { disconnectSocket, getSocket } from "@/net/socket";

interface PhotoBoothProps {
  visible: boolean;
}

export function PhotoBooth({ visible }: PhotoBoothProps) {
  const [count, setCount] = useState(3);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureRef = useRef<() => void>(() => {});
  const { playerId, opponentId, players, playerName, opponentName, winnerId } =
    useGameStore();
  // define stable capture function
  captureRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const local = document.querySelector<HTMLVideoElement>(
      "video[data-local='true']",
    );
    const remote = document.querySelector<HTMLVideoElement>(
      "video[data-remote='true']",
    );
    // We'll still render even if one stream is missing

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, width, height);

    // keep aspect ratio (contain)
    const drawContain = (
      video: HTMLVideoElement,
      x: number,
      y: number,
      w: number,
      h: number,
      mirror = false,
    ) => {
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;
      const scale = Math.min(w / vw, h / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.save();
      if (mirror) {
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, dw, dh);
      } else {
        ctx.drawImage(video, dx, dy, dw, dh);
      }
      ctx.restore();
    };

    const margin = 24;
    const boxW = width / 2 - margin * 1.5;
    const boxH = height - margin * 6;
    if (local) {
      drawContain(local, margin, margin * 3, boxW, boxH, true);
    } else {
      ctx.fillStyle = "#222";
      ctx.fillRect(margin, margin * 3, boxW, boxH);
      ctx.fillStyle = "#888";
      ctx.font = "28px monospace";
      ctx.fillText("No local video", margin + 24, margin * 3 + 48);
    }
    if (remote) {
      drawContain(remote, width - boxW - margin, margin * 3, boxW, boxH, true);
    } else {
      const rx = width - boxW - margin;
      ctx.fillStyle = "#222";
      ctx.fillRect(rx, margin * 3, boxW, boxH);
      ctx.fillStyle = "#888";
      ctx.font = "28px monospace";
      ctx.fillText("No remote video", rx + 24, margin * 3 + 48);
    }

    ctx.fillStyle = "#fff";
    ctx.font = "72px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FIREBALL - GG", width / 2, 72);

    setImageUrl(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    if (!visible) return;
    setImageUrl(null);
    setCount(3);
    const id = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    const timeout = setTimeout(() => captureRef.current(), 3500);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="w-[1100px]">
        <CardHeader>
          <CardTitle className="text-center text-3xl retro">
            Match Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!imageUrl && (
            <div className="text-center">
              <div className="text-6xl retro mb-2">Pose in {count}</div>
              <div className="text-sm text-muted-foreground">
                Hold your best victory stance
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          {imageUrl && (
            <div className="space-y-6">
              <img
                src={imageUrl}
                alt="Endgame capture"
                className="w-full rounded"
              />
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-xl retro">{playerName || "You"}</div>
                  <div className="text-sm text-muted-foreground">
                    Rounds Won:{" "}
                    {playerId ? (players[playerId]?.roundsWon ?? 0) : 0}
                  </div>
                </div>
                <div>
                  <div className="text-xl retro">
                    {opponentName || "Opponent"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rounds Won:{" "}
                    {opponentId ? (players[opponentId!]?.roundsWon ?? 0) : 0}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg">
                  Winner:{" "}
                  <span className="retro">
                    {winnerId === playerId
                      ? playerName || "You"
                      : opponentName || "Opponent"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  onClick={() => {
                    const socket = getSocket();
                    socket.emit("playAgain");
                  }}
                >
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    disconnectSocket();
                    useGameStore.getState().reset();
                  }}
                >
                  Return to Menu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

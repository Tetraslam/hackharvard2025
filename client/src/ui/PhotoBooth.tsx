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
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captureRef = useRef<() => void>(() => {});
  const captureLocalRef = useRef<() => void>(() => {});
  const captureRemoteRef = useRef<() => void>(() => {});
  const { playerId, opponentId, players, playerName, opponentName, winnerId } =
    useGameStore();

  // Capture individual local video
  captureLocalRef.current = () => {
    const local = document.querySelector<HTMLVideoElement>(
      "video[data-local='true']",
    );
    if (!local) return;

    const width = 640;
    const height = 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, width, height);

    // Draw local video (mirrored)
    const vw = local.videoWidth || 640;
    const vh = local.videoHeight || 480;
    const scale = Math.min(width / vw, height / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.save();
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(local, 0, 0, dw, dh);
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.font = "36px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PLAYER", width / 2, height / 2);

    setLocalImageUrl(canvas.toDataURL("image/png"));
  };

  // Capture individual remote video
  captureRemoteRef.current = () => {
    const remote = document.querySelector<HTMLVideoElement>(
      "video[data-remote='true']",
    );
    if (!remote) return;

    const width = 640;
    const height = 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, width, height);

    // Draw remote video (mirrored)
    const vw = remote.videoWidth || 640;
    const vh = remote.videoHeight || 480;
    const scale = Math.min(width / vw, height / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.save();
    ctx.translate(dx + dw, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(remote, 0, 0, dw, dh);
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.font = "36px monospace";
    ctx.textAlign = "center";
    ctx.fillText("OPPONENT", width / 2, height / 2);

    setRemoteImageUrl(canvas.toDataURL("image/png"));
  };

  // Legacy composite capture function (for fallback)
  captureRef.current = () => {
    captureLocalRef.current();
    captureRemoteRef.current();
  };

  useEffect(() => {
    if (!visible) return;
    // Reset all image states
    setImageUrl(null);
    setLocalImageUrl(null);
    setRemoteImageUrl(null);
    setCount(3);
    const id = setInterval(() => setCount((c) => (c > 0 ? c - 1 : 0)), 1000);
    const timeout = setTimeout(() => {
      // Capture both individual images
      captureLocalRef.current();
      captureRemoteRef.current();
    }, 3500);
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
          {!localImageUrl && !remoteImageUrl && (
            <div className="text-center">
              <div className="text-6xl retro mb-2">Pose in {count}</div>
              <div className="text-sm text-muted-foreground">
                Hold your best victory stance
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {localImageUrl && remoteImageUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Local Player Image */}
                <div>
                  <div className="text-center mb-2">
                    <div className="text-xl retro text-blue-400">
                      {playerName || "You"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Local Capture
                    </div>
                  </div>
                  <img
                    src={localImageUrl}
                    alt={`${playerName || "You"} - Local capture`}
                    className="w-full rounded border-2 border-blue-500"
                  />
                </div>

                {/* Remote Player Image */}
                <div>
                  <div className="text-center mb-2">
                    <div className="text-xl retro text-red-400">
                      {opponentName || "Opponent"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Remote Capture
                    </div>
                  </div>
                  <img
                    src={remoteImageUrl}
                    alt={`${opponentName || "Opponent"} - Remote capture`}
                    className="w-full rounded border-2 border-red-500"
                  />
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

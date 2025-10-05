import { useEffect, useRef, useState } from "react";
import { Camera } from "@/components/Camera";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { getSocket } from "@/net/socket";
import { PhotoBooth } from "@/ui/PhotoBooth";
import { HUD } from "./HUD";

export function Game() {
	const { phase, playerId, opponentId, players, currentRound } = useGameStore();
	const canvasRef = useRef<HTMLCanvasElement>(null!);
	const { isInitialized, detectedGesture, processFrame } =
		usePoseDetection(canvasRef);
	const [lastCastAt, setLastCastAt] = useState(0);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const peerRef = useRef<RTCPeerConnection | null>(null);

	const playerHp = playerId ? (players[playerId]?.hp ?? 100) : 100;
	const opponentHp = opponentId ? (players[opponentId]?.hp ?? 100) : 100;

	// Handle gesture detection -> emit cast with cooldown
	useEffect(() => {
		if (detectedGesture?.isDetected && phase === "ROUND_ACTIVE") {
			const now = Date.now();
			if (now - lastCastAt < 800) return;
			setLastCastAt(now);
			const socket = getSocket();
			socket.emit("cast", detectedGesture.move as any, now);
		}
	}, [detectedGesture, phase, lastCastAt]);

	// WebRTC signaling + media setup
	useEffect(() => {
		const socket = getSocket();
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
		});
		peerRef.current = pc;

		pc.onicecandidate = (e) => {
			if (e.candidate) socket.emit("rtcIceCandidate", e.candidate.toJSON());
		};
		pc.ontrack = (e) => {
			const [stream] = e.streams;
			if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
		};

		// Attach local tracks from Camera's <video>
		const videoEl = document.querySelector<HTMLVideoElement>(
			"video[playsinline][muted]",
		);
		if (videoEl && (videoEl as any).srcObject) {
			const localStream = (videoEl as any).srcObject as MediaStream;
			for (const t of localStream.getTracks()) {
				pc.addTrack(t, localStream);
			}
		}

		socket.on("rtcOffer", async (_from, offer) => {
			await pc.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);
			socket.emit("rtcAnswer", answer);
		});
		socket.on("rtcAnswer", async (_from, answer) => {
			await pc.setRemoteDescription(new RTCSessionDescription(answer));
		});
		socket.on("rtcIceCandidate", async (_from, cand) => {
			try {
				await pc.addIceCandidate(new RTCIceCandidate(cand));
			} catch {}
		});

		(async () => {
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			socket.emit("rtcOffer", offer);
		})();

		return () => {
			socket.off("rtcOffer");
			socket.off("rtcAnswer");
			socket.off("rtcIceCandidate");
			pc.close();
			peerRef.current = null;
		};
	}, []);

	if (phase === "ROUND_START") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center space-y-10">
					<h1
						className="text-9xl font-black animate-pulse retro"
						style={{ lineHeight: "1.5" }}
					>
						Round {currentRound}
					</h1>
					<p
						className="text-2xl text-muted-foreground retro"
						style={{ lineHeight: "2" }}
					>
						Get ready...
					</p>
				</div>
			</div>
		);
	}

return (
		<>
		<div className="relative h-screen w-screen overflow-hidden bg-background">
			<HUD
				playerHp={playerHp}
				opponentHp={opponentHp}
				round={currentRound}
				phase={phase}
			/>

			{/* Arena with your camera as background and remote feed as opponent */}
			<div className="absolute inset-0 pt-32 pb-8">
				<Camera onFrame={processFrame} className="h-full w-full" />

				{/* Remote opponent video positioned on right */}
				<video
					ref={remoteVideoRef}
					autoPlay
					playsInline
					muted
					data-remote="true"
					className="absolute right-10 bottom-24 w-80 h-60 object-cover rounded"
					style={{ transform: "scaleX(-1)" }}
				/>

				{/* Pose Visualization Canvas Overlay */}
				<canvas
					ref={canvasRef}
					className="absolute pointer-events-none"
					style={{
						top: "8rem",
						bottom: "2rem",
						left: 0,
						right: 0,
						zIndex: 5,
						width: "100%",
						height: "calc(100% - 10rem)",
						transform: "scaleX(-1)",
					}}
				/>
			</div>

			{/* Overlay UI */}
			<div className="absolute top-40 right-8 z-10">
				<Card className="w-80">
					<CardContent className="p-6 space-y-4">
						<div className="text-center">
							<h2 className="text-2xl font-bold retro mb-2">
								Cast Your Spells!
							</h2>
							<p className="text-sm text-muted-foreground">
								Use your camera to perform gesture-based spell casting
							</p>
						</div>

						{/* Gesture Status */}
						<div className="space-y-3">
							<div className="text-center">
								<div className="text-xs text-muted-foreground mb-1">
									Pose Detection Status
								</div>
								<div
									className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
										isInitialized
											? "bg-green-100 text-green-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{isInitialized ? "Ready" : "Initializing..."}
								</div>
							</div>

							{/* Current Gesture */}
							<div className="text-center">
								<div className="text-xs text-muted-foreground mb-1">
									Detected Gesture
								</div>
								<div
									className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
										detectedGesture?.isDetected
											? "bg-blue-100 text-blue-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{detectedGesture?.isDetected
										? `${detectedGesture.move.toUpperCase()} (${Math.round(detectedGesture.confidence * 100)}%)`
										: "No gesture detected"}
								</div>
							</div>

							{/* Instructions */}
							<div className="text-xs text-muted-foreground space-y-1">
								<p>
									<strong>Try these gestures:</strong>
								</p>
								<p>• Fireball: Both arms forward, palms together</p>
								<p>• Water Blast: Arms crossed → sweep</p>
								<p>• Lightning: One arm up, one forward</p>
								<p>• Shield: Boxing stance (arms up)</p>
								<p>• Counter: Cross-block → open</p>
								<p>• Job Application: Prayer hands</p>
								<p>• Meteor: Both arms very high, spread apart</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
		{phase === "PHOTO_BOOTH" ? <PhotoBooth visible /> : null}
		</>
	);
}

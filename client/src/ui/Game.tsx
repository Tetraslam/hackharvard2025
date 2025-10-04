import { Card, CardContent } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { HUD } from "./HUD";
import { Camera } from "@/components/Camera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useEffect, useRef } from "react";

export function Game() {
	const { phase, playerId, opponentId, players, currentRound } = useGameStore();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { isInitialized, detectedGesture, processFrame } = usePoseDetection(canvasRef);

	const playerHp = playerId ? (players[playerId]?.hp ?? 100) : 100;
	const opponentHp = opponentId ? (players[opponentId]?.hp ?? 100) : 100;

	// Handle gesture detection
	useEffect(() => {
		if (detectedGesture?.isDetected && phase === "ROUND_ACTIVE") {
			console.log("Gesture detected:", detectedGesture);
			// TODO: Send gesture to server
		}
	}, [detectedGesture, phase]);

	if (phase === "ROUND_START") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center space-y-10">
					<h1 className="text-9xl font-black animate-pulse retro" style={{ lineHeight: "1.5" }}>
						Round {currentRound}
					</h1>
					<p className="text-2xl text-muted-foreground retro" style={{ lineHeight: "2" }}>
						Get ready...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-background">
			<HUD
				playerHp={playerHp}
				opponentHp={opponentHp}
				round={currentRound}
				phase={phase}
			/>

			{/* Fullscreen Camera Feed */}
			<div className="absolute inset-0 pt-32 pb-8">
				<Camera 
					onFrame={processFrame}
					className="h-full w-full"
				/>
				
				{/* Pose Visualization Canvas Overlay */}
				<canvas
					ref={canvasRef}
					className="absolute pointer-events-none"
					style={{ 
						top: '8rem', // Match the pt-32 padding
						bottom: '2rem', // Match the pb-8 padding
						left: 0,
						right: 0,
						zIndex: 5,
						width: '100%',
						height: 'calc(100% - 10rem)' // Account for top and bottom padding
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
								<div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
									isInitialized 
										? "bg-green-100 text-green-800" 
										: "bg-yellow-100 text-yellow-800"
								}`}>
									{isInitialized ? "Ready" : "Initializing..."}
								</div>
							</div>

							{/* Current Gesture */}
							<div className="text-center">
								<div className="text-xs text-muted-foreground mb-1">
									Detected Gesture
								</div>
								<div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
									detectedGesture?.isDetected
										? "bg-blue-100 text-blue-800"
										: "bg-gray-100 text-gray-800"
								}`}>
									{detectedGesture?.isDetected 
										? `${detectedGesture.move.toUpperCase()} (${Math.round(detectedGesture.confidence * 100)}%)`
										: "No gesture detected"
									}
								</div>
							</div>

							{/* Instructions */}
							<div className="text-xs text-muted-foreground space-y-1">
								<p><strong>Try these gestures:</strong></p>
								<p>• Fireball: Both arms forward, palms together</p>
								<p>• Lightning: One arm up, one forward</p>
								<p>• Shield: Boxing stance (arms up)</p>
								<p>• Job App: Prayer hands</p>
								<p>• Power Stance: Wide stance</p>
								<p>• Dodge Roll: Lean to one side</p>
								<p>• Meteor: Both arms very high, spread apart</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

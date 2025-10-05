import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import { useGameStore } from "@/game/store";
import { getMuted, setMuted } from "@/lib/utils";
import type { GamePhase } from "@/net/socket";

interface HUDProps {
	playerHp: number;
	opponentHp: number;
	round: number;
	phase: GamePhase;
}

export function HUD({ playerHp, opponentHp, round, phase }: HUDProps) {
	const { lastMove, lastInteraction, error, playerName, opponentName } =
		useGameStore();
	const [muted, setMutedState] = useState(getMuted());

	const toggleMute = () => {
		const newMuted = !muted;
		setMuted(newMuted);
		setMutedState(newMuted);
	};

	return (
		<>
			{/* Mute button - top left corner, clickable */}
			<div className="pointer-events-auto fixed top-6 left-6 z-50">
				<Button
					onClick={toggleMute}
					variant="outline"
					size="sm"
					className="w-12 h-12 p-0"
				>
					{muted ? (
						<VolumeX className="h-5 w-5" />
					) : (
						<Volume2 className="h-5 w-5" />
					)}
				</Button>
			</div>

			<div className="pointer-events-none fixed inset-x-0 top-0 z-50 p-6 flex justify-center">
				<div className="flex items-start justify-center gap-6 w-full max-w-7xl">
					{/* Player Info - Left */}
					<Card className="w-96 max-w-96">
						<CardContent className="p-6 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-xl retro" style={{ lineHeight: "1.5" }}>
									{playerName || "You"}
								</h3>
								<Badge>{playerHp} HP</Badge>
							</div>
							<Progress value={playerHp} className="h-4" />
						</CardContent>
					</Card>

					{/* Round Info - Center */}
					<Card>
						<CardContent className="p-6 text-center min-w-[200px]">
							<div
								className="text-3xl font-bold retro"
								style={{ lineHeight: "1.5" }}
							>
								Round {round}
							</div>
							<div className="text-xs text-muted-foreground uppercase mt-2">
								{phase.replace("_", " ")}
							</div>
						</CardContent>
					</Card>

					{/* Opponent Info - Right */}
					<Card className="w-96 max-w-96">
						<CardContent className="p-6 space-y-4">
							<div className="flex items-center justify-between">
								<Badge variant="secondary">{opponentHp} HP</Badge>
								<h3 className="text-xl retro" style={{ lineHeight: "1.5" }}>
									{opponentName || "Opponent"}
								</h3>
							</div>
							<Progress value={opponentHp} className="h-4" />
						</CardContent>
					</Card>
				</div>
			</div>

			{lastMove && (
				<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
					<div className="animate-[fadeOut_1s_ease-out_forwards] bg-black/50 backdrop-blur-sm rounded-lg px-10 py-6">
						<div
							className="text-center text-4xl font-bold retro text-white drop-shadow-lg"
							style={{ lineHeight: "1.5" }}
						>
							{lastMove.move.toUpperCase()} CAST!
						</div>
					</div>
				</div>
			)}

			{lastInteraction && (
				<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center pt-32">
					<div className="animate-[fadeOut_2s_ease-out_forwards] bg-black/50 backdrop-blur-sm rounded-lg px-8 py-6">
						<div
							className="text-center text-2xl font-bold retro text-white drop-shadow-lg"
							style={{ lineHeight: "1.5" }}
						>
							{lastInteraction.type.toUpperCase()}:{" "}
							{lastInteraction.moves.join(" vs ")}
						</div>
					</div>
				</div>
			)}

			{error && (
				<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center pb-32">
					<div className="animate-[fadeOut_3s_ease-out_forwards] bg-red-900/80 backdrop-blur-sm rounded-lg px-8 py-6 border-2 border-red-500">
						<div
							className="text-center text-xl font-bold text-white drop-shadow-lg retro"
							style={{ lineHeight: "1.5" }}
						>
							{error}
						</div>
					</div>
				</div>
			)}
		</>
	);
}

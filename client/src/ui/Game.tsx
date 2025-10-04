import { Card, CardContent } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { HUD } from "./HUD";

export function Game() {
	const { phase, playerId, opponentId, players, currentRound } = useGameStore();

	const playerHp = playerId ? (players[playerId]?.hp ?? 100) : 100;
	const opponentHp = opponentId ? (players[opponentId]?.hp ?? 100) : 100;

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

			{/* Main game area - centered with proper spacing for HUD */}
			<div className="flex h-full items-center justify-center pt-32 pb-8 px-8">
				<Card className="w-full max-w-4xl">
					<CardContent className="p-20 text-center space-y-6">
						<div className="text-8xl opacity-30">🎮</div>
						<h2 className="text-4xl font-bold retro" style={{ lineHeight: "1.8" }}>
							Game Arena
						</h2>
						<p className="text-lg text-muted-foreground" style={{ lineHeight: "2.5" }}>
							Camera feed + particle effects will appear here
						</p>
						<div className="pt-10 space-y-3 text-sm text-muted-foreground">
							<p style={{ lineHeight: "2" }}>Stand in front of your camera and perform gestures</p>
							<p className="text-xs opacity-60" style={{ lineHeight: "2" }}>Vision detection coming soon...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

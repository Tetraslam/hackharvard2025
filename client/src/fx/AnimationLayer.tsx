import { useEffect, useState } from "react";
import { useGameStore } from "@/game/store";
import { playSfx } from "@/lib/utils";
import type { MoveType } from "@/net/socket";
import { getSocket } from "@/net/socket";
import {
	CancelEffect,
	CounterEffect,
	ImpactEffect,
	ProjectileEffect,
	ShieldEffect,
	StunEffect,
} from "./effects";
import {
	getMidpoint,
	getPositionForPlayerId,
	type Position,
} from "./positions";
import { PROJECTILE_CONFIG } from "./projectiles";

interface ActiveProjectile {
	id: string;
	move: MoveType;
	from: Position;
	to: Position;
}

interface ActiveEffect {
	id: string;
	type: "shield" | "counter" | "impact" | "cancel" | "stun";
	position: Position;
	damage?: number;
	impactType?: "hit" | "block";
}

export function AnimationLayer() {
	const { playerId } = useGameStore();
	const [projectiles, setProjectiles] = useState<ActiveProjectile[]>([]);
	const [effects, setEffects] = useState<ActiveEffect[]>([]);

	useEffect(() => {
		if (!playerId) return;

		const socket = getSocket();

		socket.on("moveExecuted", ({ playerId: casterId, move, timestamp }) => {
			console.log("AnimationLayer: moveExecuted", { casterId, move });

			const config = PROJECTILE_CONFIG[move];

			if (config) {
				const from = getPositionForPlayerId(casterId, playerId);
				const to = getPositionForPlayerId(
					casterId === playerId ? "opponent" : playerId,
					playerId,
				);

        const projectileId = `${move}-${timestamp}`;
        setProjectiles((prev) => [
          ...prev,
          { id: projectileId, move, from, to },
        ]);

        const audioExts: Record<MoveType, string> = {
          fireball: "wav",
          waterblast: "wav",
          lightning: "wav",
          meteor: "ogg",
          jobapplication: "mp3",
          shield: "wav",
          counter: "mp3",
        };
        playSfx(`/audio/${move}.${audioExts[move]}`, 0.9);

				setTimeout(
					() => {
						setProjectiles((prev) => prev.filter((p) => p.id !== projectileId));
					},
					config.speed * 1000 + 100,
				);
			} else if (move === "shield") {
				const pos = getPositionForPlayerId(casterId, playerId);
				const effectId = `shield-${timestamp}`;
				setEffects((prev) => [
					...prev,
          { id: effectId, type: "shield", position: pos },
        ]);
        playSfx("/audio/shield.wav", 0.9);

				setTimeout(() => {
					setEffects((prev) => prev.filter((e) => e.id !== effectId));
				}, 1000);
			} else if (move === "counter") {
				const pos = getPositionForPlayerId(casterId, playerId);
				const effectId = `counter-${timestamp}`;
				setEffects((prev) => [
					...prev,
					{ id: effectId, type: "counter", position: pos },
				]);
				playSfx("/audio/counter.mp3", 0.9);

				setTimeout(() => {
					setEffects((prev) => prev.filter((e) => e.id !== effectId));
				}, 300);
			}
		});

		socket.on("damageDealt", ({ targetId, damage }) => {
			console.log("AnimationLayer: damageDealt", { targetId, damage });
			const pos = getPositionForPlayerId(targetId, playerId);
			const effectId = `impact-${Date.now()}`;
			setEffects((prev) => [
				...prev,
				{
					id: effectId,
					type: "impact",
					position: pos,
					damage,
					impactType: "hit",
				},
			]);
        playSfx("/audio/hit.wav", 0.8);

			setTimeout(() => {
				setEffects((prev) => prev.filter((e) => e.id !== effectId));
			}, 1500);
		});

		socket.on("interaction", ({ type, players }) => {
			console.log("AnimationLayer: interaction", { type, players });

			if (type === "cancel") {
				const p1Pos = getPositionForPlayerId(players[0], playerId);
				const p2Pos = getPositionForPlayerId(players[1], playerId);
				const mid = getMidpoint(p1Pos, p2Pos);
				const effectId = `cancel-${Date.now()}`;
				setEffects((prev) => [
					...prev,
					{ id: effectId, type: "cancel", position: mid },
				]);
        playSfx("/audio/block.wav", 0.8);

				setTimeout(() => {
					setEffects((prev) => prev.filter((e) => e.id !== effectId));
				}, 800);
			} else if (type === "block") {
				const blockerPos = getPositionForPlayerId(players[0], playerId);
				const effectId = `block-${Date.now()}`;
				setEffects((prev) => [
					...prev,
					{
						id: effectId,
						type: "impact",
						position: blockerPos,
						damage: 0,
						impactType: "block",
					},
				]);
        playSfx("/audio/block.wav", 0.8);

				setTimeout(() => {
					setEffects((prev) => prev.filter((e) => e.id !== effectId));
				}, 1500);
			} else if (type === "stun") {
				const stunnedPos = getPositionForPlayerId(players[1], playerId);
				const effectId = `stun-${Date.now()}`;
				setEffects((prev) => [
					...prev,
					{ id: effectId, type: "stun", position: stunnedPos },
				]);

				setTimeout(() => {
					setEffects((prev) => prev.filter((e) => e.id !== effectId));
				}, 2000);
			}
		});

		return () => {
			socket.off("moveExecuted");
			socket.off("damageDealt");
			socket.off("interaction");
		};
	}, [playerId]);

	return (
		<div className="absolute inset-0 pointer-events-none z-40">
			{projectiles.map((proj) => {
				const config = PROJECTILE_CONFIG[proj.move];
				if (!config) return null;
				return (
					<ProjectileEffect
						key={proj.id}
						id={proj.id}
						config={config}
						from={proj.from}
						to={proj.to}
						onComplete={() => {
							setProjectiles((prev) => prev.filter((p) => p.id !== proj.id));
						}}
					/>
				);
			})}

			{effects.map((effect) => {
				if (effect.type === "shield") {
					return (
						<ShieldEffect
							key={effect.id}
							position={effect.position}
							onComplete={() => {
								setEffects((prev) => prev.filter((e) => e.id !== effect.id));
							}}
						/>
					);
				}
				if (effect.type === "counter") {
					return (
						<CounterEffect
							key={effect.id}
							position={effect.position}
							onComplete={() => {
								setEffects((prev) => prev.filter((e) => e.id !== effect.id));
							}}
						/>
					);
				}
				if (effect.type === "impact") {
					return (
						<ImpactEffect
							key={effect.id}
							position={effect.position}
							damage={effect.damage || 0}
							type={effect.impactType || "hit"}
							onComplete={() => {
								setEffects((prev) => prev.filter((e) => e.id !== effect.id));
							}}
						/>
					);
				}
				if (effect.type === "cancel") {
					return (
						<CancelEffect
							key={effect.id}
							position={effect.position}
							onComplete={() => {
								setEffects((prev) => prev.filter((e) => e.id !== effect.id));
							}}
						/>
					);
				}
				if (effect.type === "stun") {
					return (
						<StunEffect
							key={effect.id}
							position={effect.position}
							onComplete={() => {
								setEffects((prev) => prev.filter((e) => e.id !== effect.id));
							}}
						/>
					);
				}
				return null;
			})}
		</div>
	);
}

import type { MoveType } from "../net/socket";
import { getSocket } from "../net/socket";

export function testCast(move: MoveType) {
	const socket = getSocket();
	const timestamp = Date.now();
	console.log(`🎮 Testing move: ${move} at ${timestamp}`);
	socket.emit("cast", move, timestamp);
}

if (typeof window !== "undefined") {
	(window as any).testCast = testCast;
	(window as any).testMoves = {
		fireball: () => testCast("fireball"),
		waterblast: () => testCast("waterblast"),
		lightning: () => testCast("lightning"),
		shield: () => testCast("shield"),
		counter: () => testCast("counter"),
		meteor: () => testCast("meteor"),
		job: () => testCast("jobapplication"),
	};
	console.log(
		"🎮 Test moves loaded! Use window.testMoves.fireball() or window.testCast('fireball') in console",
	);
}

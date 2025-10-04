import type { Server, Socket } from "socket.io";
import type {
	ClientToServerEvents,
	GameState,
	Player,
	ServerToClientEvents,
	SocketData,
} from "./types";

type TypedSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	Record<string, never>,
	SocketData
>;

const rooms = new Map<string, GameState>();

export function generateRoomCode(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let code = "";
	for (let i = 0; i < 4; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

export function createLobby(
	_io: Server,
	socket: TypedSocket,
	name: string,
	callback: (code: string) => void,
): void {
	let code = generateRoomCode();
	while (rooms.has(code)) {
		code = generateRoomCode();
	}

	const gameState: GameState = {
		roomCode: code,
		phase: "LOBBY_WAITING",
		players: new Map(),
		currentRound: 0,
		eventLog: [],
	};

	const player: Player = {
		id: socket.id,
		name: name || "Player 1",
		hp: 100,
		roundsWon: 0,
		ready: false,
		activeEffects: [],
	};

	gameState.players.set(socket.id, player);
	rooms.set(code, gameState);

	socket.join(code);
	socket.data.roomCode = code;

	console.log(`Lobby created: ${code} by ${socket.id} (${player.name})`);
	callback(code);
}

export function joinLobby(
	io: Server,
	socket: TypedSocket,
	code: string,
	name: string,
	callback: (success: boolean, error?: string, players?: Record<string, { name: string }>) => void,
): void {
	const gameState = rooms.get(code);

	if (!gameState) {
		callback(false, "Lobby not found");
		return;
	}

	if (gameState.players.size >= 2) {
		callback(false, "Lobby is full");
		return;
	}

	if (gameState.phase !== "LOBBY_WAITING") {
		callback(false, "Game already in progress");
		return;
	}

	const player: Player = {
		id: socket.id,
		name: name || "Player 2",
		hp: 100,
		roundsWon: 0,
		ready: false,
		activeEffects: [],
	};

	gameState.players.set(socket.id, player);
	socket.join(code);
	socket.data.roomCode = code;

	const playerList: Record<string, { name: string }> = {};
	gameState.players.forEach((p, id) => {
		playerList[id] = { name: p.name };
	});

	console.log(`Player ${socket.id} (${player.name}) joined lobby ${code}`);
	callback(true, undefined, playerList);

	io.to(code).emit("playerJoined", socket.id, player.name, gameState.players.size);

	if (gameState.players.size === 2) {
		gameState.phase = "LOBBY_READY";
		io.to(code).emit("gamePhaseChange", "LOBBY_READY");
	}
}

export function markReady(io: Server, socket: TypedSocket): void {
	const roomCode = socket.data.roomCode;
	if (!roomCode) return;

	const gameState = rooms.get(roomCode);
	if (!gameState) return;

	const player = gameState.players.get(socket.id);
	if (!player) return;

	player.ready = true;

	const allReady = Array.from(gameState.players.values()).every((p) => p.ready);

	if (allReady && gameState.players.size === 2) {
		startRound(io, roomCode);
	}
}

function startRound(io: Server, roomCode: string): void {
	const gameState = rooms.get(roomCode);
	if (!gameState) return;

	gameState.currentRound++;
	gameState.phase = "ROUND_START";
	gameState.eventLog = [];

	gameState.players.forEach((player) => {
		player.hp = 100;
		player.activeEffects = [];
	});

	io.to(roomCode).emit("gamePhaseChange", "ROUND_START", {
		round: gameState.currentRound,
	});

	setTimeout(() => {
		gameState.phase = "ROUND_ACTIVE";
		io.to(roomCode).emit("gamePhaseChange", "ROUND_ACTIVE");
	}, 3000);
}

export function handleDisconnect(io: Server, socket: TypedSocket): void {
	const roomCode = socket.data.roomCode;
	if (!roomCode) return;

	const gameState = rooms.get(roomCode);
	if (!gameState) return;

	gameState.players.delete(socket.id);
	console.log(`Player ${socket.id} left lobby ${roomCode}`);

	if (gameState.players.size === 0) {
		rooms.delete(roomCode);
		console.log(`Lobby ${roomCode} deleted (empty)`);
	} else {
		io.to(roomCode).emit("playerLeft", socket.id);
		gameState.phase = "LOBBY_WAITING";
		io.to(roomCode).emit("gamePhaseChange", "LOBBY_WAITING");
	}
}

export function getGameState(roomCode: string): GameState | undefined {
	return rooms.get(roomCode);
}

export function updateGameState(roomCode: string, state: GameState): void {
	rooms.set(roomCode, state);
}

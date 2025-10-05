import { Hono } from "hono";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleCast, handlePlayAgain } from "./game";
import { createLobby, handleDisconnect, joinLobby, markReady, markUnready } from "./lobby";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "./types";

const app = new Hono();
app.get("/", (c) => c.text("FIREBALL server running"));
app.get("/health", (c) => c.json({ status: "ok" }));

const httpServer = createServer(
	app.fetch as unknown as Parameters<typeof createServer>[1],
);

const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: { origin: "*" },
});

io.on("connection", (socket) => {
	console.log("Player connected:", socket.id);

	socket.data.playerId = socket.id;

	socket.on("createLobby", (name, callback) => {
		createLobby(io, socket, name, callback);
	});

	socket.on("joinLobby", (code, name, callback) => {
		joinLobby(io, socket, code, name, callback);
	});

	socket.on("ready", () => {
		markReady(io, socket);
	});

	socket.on("unready", () => {
		markUnready(io, socket);
	});

	socket.on("cast", (move, clientTimestamp) => {
		handleCast(io, socket, move, clientTimestamp);
	});

	socket.on("playAgain", () => {
		handlePlayAgain(io, socket);
	});

  // WebRTC signaling relay (room-scoped broadcast to the other peer)
  socket.on("rtcOffer", (offer) => {
    const room = socket.data.roomCode;
    if (!room) return;
    socket.to(room).emit("rtcOffer", socket.id, offer);
  });

  socket.on("rtcAnswer", (answer) => {
    const room = socket.data.roomCode;
    if (!room) return;
    socket.to(room).emit("rtcAnswer", socket.id, answer);
  });

  socket.on("rtcIceCandidate", (candidate) => {
    const room = socket.data.roomCode;
    if (!room) return;
    socket.to(room).emit("rtcIceCandidate", socket.id, candidate);
  });

	socket.on("disconnect", () => {
		console.log("Player disconnected:", socket.id);
		handleDisconnect(io, socket);
	});
});

httpServer.listen(3000, () => {
	console.log("🔥 FIREBALL Server running on http://localhost:3000");
});

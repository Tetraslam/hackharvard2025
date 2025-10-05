import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { getSocket, type MoveType } from "@/net/socket";
import { PhotoBooth } from "@/ui/PhotoBooth";
import { HUD } from "./HUD";
import mapBackground from "@/assets/maps/basic_areana.webp";

export function Game() {
  const { phase, playerId, opponentId, players, currentRound } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const {
    isInitialized,
    detectedGesture,
    processFrame,
    videoRef: localVideoRef,
  } = usePoseDetection(canvasRef);
  const [lastCastAt, setLastCastAt] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [webrtcStatus, setWebrtcStatus] = useState<
    "disconnected" | "connecting" | "connected" | "failed"
  >("disconnected");
  const [isSpellsPanelOpen, setIsSpellsPanelOpen] = useState(true);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const playerHp = playerId ? (players[playerId]?.hp ?? 100) : 100;
  const opponentHp = opponentId ? (players[opponentId]?.hp ?? 100) : 100;

  // Handle gesture detection -> emit cast with cooldown
  useEffect(() => {
    if (detectedGesture?.isDetected && phase === "ROUND_ACTIVE") {
      const now = Date.now();
      if (now - lastCastAt < 800) return;
      setLastCastAt(now);
      const socket = getSocket();
      socket.emit("cast", detectedGesture.move as MoveType, now);
    }
  }, [detectedGesture, phase, lastCastAt]);

  // Combined Camera + WebRTC setup with improved error handling and race condition prevention
  useEffect(() => {
    let isActive = true;
    let connectionAttempts = 0;
    const maxConnectionAttempts = 3;
    const socket = getSocket();
    let offerTimeout: NodeJS.Timeout | null = null;
    let connectionRetryTimeout: NodeJS.Timeout | null = null;

    const initializeMediaAndPeer = async () => {
      try {
        // Check if we already have an active connection
        if (
          peerRef.current &&
          (peerRef.current.connectionState === "connected" ||
            peerRef.current.connectionState === "connecting")
        ) {
          console.log(
            `✅ [WEBRTC] Already ${peerRef.current.connectionState}, skipping re-initialization`,
          );
          return;
        }

        console.log("🎥 [WEBCAM] Starting camera access...");
        connectionAttempts++;
        setWebrtcStatus("connecting");

        // Step 1: Get camera stream with better error handling
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
            audio: false,
          });
        } catch (mediaError) {
          console.error("❌ [WEBCAM] Failed to access camera:", mediaError);
          setCameraError(
            `Camera access denied: ${mediaError instanceof Error ? mediaError.message : "Unknown error"}`,
          );
          return;
        }

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        console.log("✅ [WEBCAM] Camera stream acquired");

        // Validate stream has active tracks
        const tracks = stream.getTracks();
        const activeTracks = tracks.filter((t) => t.readyState === "live");
        console.log(`📹 [WEBCAM] Stream validation:`);
        console.log(`   Total tracks: ${tracks.length}`);
        console.log(`   Active tracks: ${activeTracks.length}`);
        console.log(`   Stream active: ${stream.active}`);

        tracks.forEach((track, i) => {
          console.log(`   Track ${i}:`, {
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
          });
        });

        if (activeTracks.length === 0) {
          throw new Error("Camera stream has no active tracks");
        }

        localStreamRef.current = stream;

        // Set local video stream - video elements are now always available
        if (localVideoRef.current) {
          try {
            localVideoRef.current.srcObject = stream;
            setCameraReady(true);
            console.log("✅ [WEBCAM] Local video element srcObject set");
          } catch (videoErr) {
            console.error(
              "❌ [WEBCAM] Failed to set local video srcObject:",
              videoErr,
            );
            setCameraError(
              `Local video setup failed: ${videoErr instanceof Error ? videoErr.message : "Unknown error"}`,
            );
          }
        } else {
          console.error("❌ [WEBCAM] Local video element ref is null");
          setCameraError("Local video element reference is null");
        }

        // Step 2: Setup WebRTC peer connection with better configuration
        console.log("🔗 [WEBRTC] Setting up WebRTC connection...");
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: ["stun:stun.l.google.com:19302"] },
            { urls: ["stun:stun1.l.google.com:19302"] },
          ],
          iceCandidatePoolSize: 10,
        });
        peerRef.current = pc;

        // Track connection state for debugging
        const debugConnectionState = () => {
          console.log(`🔗 [WEBRTC] Connection state change:`);
          console.log(`   Connection state: ${pc.connectionState}`);
          console.log(`   ICE connection state: ${pc.iceConnectionState}`);
          console.log(`   ICE gathering state: ${pc.iceGatheringState}`);
          console.log(`   Signaling state: ${pc.signalingState}`);
        };

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          console.log(
            `➕ [WEBRTC] Adding track to peer connection: ${track.kind}`,
          );
          pc.addTrack(track, stream);
        });

        // Handle ICE candidates with better debugging
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            console.log(
              `🧊 [WEBRTC] Generated ICE candidate: ${e.candidate.candidate.substring(0, 50)}...`,
            );
            console.log(
              `   Foundation: ${e.candidate.foundation}, Priority: ${e.candidate.priority}`,
            );
            socket.emit("rtcIceCandidate", e.candidate.toJSON());
          } else {
            console.log("🧊 [WEBRTC] ICE gathering complete");
          }
        };

        // Handle remote stream with improved validation
        pc.ontrack = async (e) => {
          console.log("📺 [WEBRTC] Received remote track event");
          console.log(
            `   Track event kind: ${e.track.kind}, state: ${e.track.readyState}`,
          );

          const [remoteStream] = e.streams;

          if (!remoteStream) {
            console.error("❌ [WEBRTC] No stream in track event");
            return;
          }

          // Validate remote stream
          const videoTracks = remoteStream.getVideoTracks();
          console.log(`📹 [WEBRTC] Remote stream validation:`);
          console.log(`   Stream active: ${remoteStream.active}`);
          console.log(`   Video tracks: ${videoTracks.length}`);

          if (videoTracks.length === 0) {
            console.error("❌ [WEBRTC] Remote stream has no video tracks");
            return;
          }

          videoTracks.forEach((track, i) => {
            console.log(`   Remote track ${i}:`, {
              kind: track.kind,
              label: track.label,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
            });
          });

          const firstTrack = videoTracks[0];

          // Wait for track to be ready before setting video element
          if (firstTrack.readyState !== "live") {
            console.warn(
              `⚠️ [WEBRTC] Remote track not live yet: ${firstTrack.readyState}, waiting...`,
            );

            // Wait for track to become live
            const waitForTrack = () => {
              if (firstTrack.readyState === "live" && remoteVideoRef.current) {
                console.log(
                  "✅ [WEBRTC] Remote track is now live, setting video element",
                );
                setRemoteVideoElement(remoteStream);
              } else if (firstTrack.readyState === "ended") {
                console.error(
                  "❌ [WEBRTC] Remote track ended without becoming live",
                );
              } else {
                // Keep waiting
                setTimeout(waitForTrack, 100);
              }
            };
            waitForTrack();
          } else {
            setRemoteVideoElement(remoteStream);
          }
        };

        // Helper function to set remote video element with error handling and retry
        const setRemoteVideoElement = async (
          remoteStream: MediaStream,
          retryCount = 0,
        ) => {
          const maxRetries = 5;
          const retryDelay = 200; // 200ms

          if (!remoteVideoRef.current) {
            console.error("❌ [WEBRTC] Remote video element not available");

            // Retry if the element might not be mounted yet
            if (retryCount < maxRetries) {
              console.log(
                `🔄 [WEBRTC] Retrying remote video setup (${retryCount + 1}/${maxRetries})`,
              );
              setTimeout(
                () => setRemoteVideoElement(remoteStream, retryCount + 1),
                retryDelay,
              );
            } else {
              console.error(
                "❌ [WEBRTC] Max retries reached for remote video element",
              );
              setCameraError(
                "Remote video element not available after multiple attempts",
              );
            }
            return;
          }

          try {
            remoteVideoRef.current.srcObject = remoteStream;
            console.log("✅ [WEBRTC] Remote video element srcObject set");

            // Wait for metadata to load before attempting to play
            await new Promise((resolve, reject) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.onloadedmetadata = resolve;
                remoteVideoRef.current.onerror = reject;
                setTimeout(
                  () => reject(new Error("Video metadata load timeout")),
                  5000,
                );
              } else {
                reject(new Error("Remote video element disappeared"));
              }
            });

            console.log("✅ [WEBRTC] Remote video metadata loaded");

            // Now try to play the video
            await remoteVideoRef.current.play();
            console.log("✅ [WEBRTC] Remote video playing successfully");
          } catch (err) {
            console.error("❌ [WEBRTC] Failed to set up remote video:", err);

            // Retry on certain errors
            if (
              retryCount < maxRetries &&
              err instanceof Error &&
              (err.message.includes("not available") ||
                err.message.includes("failed to load"))
            ) {
              console.log(
                `🔄 [WEBRTC] Retrying remote video setup due to error (${retryCount + 1}/${maxRetries})`,
              );
              setTimeout(
                () => setRemoteVideoElement(remoteStream, retryCount + 1),
                retryDelay * (retryCount + 1),
              ); // Exponential backoff
            } else {
              setCameraError(
                `Remote video error: ${err instanceof Error ? err.message : "Unknown error"}`,
              );
            }
          }
        };

        // Monitor connection state with recovery
        pc.onconnectionstatechange = () => {
          debugConnectionState();

          // Update UI status
          if (pc.connectionState === "connecting") {
            setWebrtcStatus("connecting");
          } else if (pc.connectionState === "connected") {
            setWebrtcStatus("connected");
          } else if (pc.connectionState === "failed") {
            setWebrtcStatus("failed");
          } else if (pc.connectionState === "disconnected") {
            setWebrtcStatus("disconnected");
          }

          if (pc.connectionState === "failed") {
            console.error("❌ [WEBRTC] Connection failed, attempting retry...");
            if (connectionAttempts < maxConnectionAttempts && isActive) {
              connectionRetryTimeout = setTimeout(() => {
                console.log(
                  `🔄 [WEBRTC] Retrying connection (attempt ${connectionAttempts + 1}/${maxConnectionAttempts})`,
                );
                initializeMediaAndPeer();
              }, 2000);
            } else {
              console.error("❌ [WEBRTC] Max connection attempts reached");
              setCameraError(
                "Failed to establish peer connection after multiple attempts",
              );
            }
          } else if (pc.connectionState === "connected") {
            console.log("✅ [WEBRTC] Peer connection established successfully");
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log(
            `🧊 [WEBRTC] ICE connection state: ${pc.iceConnectionState}`,
          );

          if (pc.iceConnectionState === "failed") {
            console.log(
              "🔄 [WEBRTC] ICE connection failed, attempting restart...",
            );
            try {
              pc.restartIce();
            } catch (err) {
              console.error("❌ [WEBRTC] Failed to restart ICE:", err);
            }
          } else if (
            pc.iceConnectionState === "connected" ||
            pc.iceConnectionState === "completed"
          ) {
            console.log("✅ [WEBRTC] ICE connection established");
          }
        };

        pc.onicegatheringstatechange = () => {
          console.log(
            `🧊 [WEBRTC] ICE gathering state: ${pc.iceGatheringState}`,
          );
        };

        // Step 3: Implement improved polite peer pattern with better collision handling
        const isPolite = playerId && opponentId && playerId < opponentId;
        console.log(`🤝 [WEBRTC] Peer role determination:`);
        console.log(`   My ID: ${playerId}`);
        console.log(`   Opponent ID: ${opponentId}`);
        console.log(
          `   Role: ${isPolite ? "POLITE (will create offer)" : "IMPOLITE (will wait for offer)"}`,
        );

        let hasCreatedOffer = false;

        // Handle incoming offer with improved collision detection
        socket.on("rtcOffer", async (_from, offer) => {
          console.log(`📨 [WEBRTC] Received RTC offer from ${_from}`);
          console.log(`   Current signaling state: ${pc.signalingState}`);

          try {
            // Validate signaling state before accepting offer
            const validStatesForOffer = ["stable", "have-remote-offer"];
            if (!validStatesForOffer.includes(pc.signalingState)) {
              console.warn(
                `⚠️ [WEBRTC] Cannot accept offer in state: ${pc.signalingState}`,
              );

              // Handle collision - if we're impolite and have a local offer, rollback
              if (
                !isPolite &&
                pc.signalingState === "have-local-offer" &&
                hasCreatedOffer
              ) {
                console.log(
                  "⚠️ [WEBRTC] Collision detected - rolling back as impolite peer",
                );
                await pc.setLocalDescription({
                  type: "rollback",
                } as RTCSessionDescriptionInit);
                hasCreatedOffer = false;
              } else {
                console.log(
                  `⚠️ [WEBRTC] Ignoring offer as ${isPolite ? "polite" : "impolite"} peer in state ${pc.signalingState}`,
                );
                return;
              }
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("✅ [WEBRTC] Set remote description (offer)");

            // Process any queued ICE candidates
            if (pendingIceCandidatesRef.current.length > 0) {
              console.log(
                `🧊 [WEBRTC] Processing ${pendingIceCandidatesRef.current.length} queued ICE candidates`,
              );
              for (const candidate of pendingIceCandidatesRef.current) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log("✅ [WEBRTC] Added queued ICE candidate");
                } catch (err) {
                  console.error(
                    "❌ [WEBRTC] Error adding queued ICE candidate:",
                    err,
                  );
                }
              }
              pendingIceCandidatesRef.current = [];
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log(
              "✅ [WEBRTC] Created and set local description (answer)",
            );

            socket.emit("rtcAnswer", answer);
            console.log("📤 [WEBRTC] Sent RTC answer");
          } catch (error) {
            console.error("❌ [WEBRTC] Error handling offer:", error);
            setCameraError(
              `WebRTC offer handling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        });

        // Handle incoming answer with validation
        socket.on("rtcAnswer", async (_from, answer) => {
          console.log(`📨 [WEBRTC] Received RTC answer from ${_from}`);
          console.log(`   Current signaling state: ${pc.signalingState}`);

          try {
            // Validate we're expecting an answer
            if (pc.signalingState !== "have-local-offer") {
              console.warn(
                `⚠️ [WEBRTC] Received answer but not expecting one (state: ${pc.signalingState})`,
              );
              return;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("✅ [WEBRTC] Set remote description (answer)");

            // Process any queued ICE candidates
            if (pendingIceCandidatesRef.current.length > 0) {
              console.log(
                `🧊 [WEBRTC] Processing ${pendingIceCandidatesRef.current.length} queued ICE candidates`,
              );
              for (const candidate of pendingIceCandidatesRef.current) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                  console.log("✅ [WEBRTC] Added queued ICE candidate");
                } catch (err) {
                  console.error(
                    "❌ [WEBRTC] Error adding queued ICE candidate:",
                    err,
                  );
                }
              }
              pendingIceCandidatesRef.current = [];
            }
          } catch (error) {
            console.error("❌ [WEBRTC] Error handling answer:", error);
            setCameraError(
              `WebRTC answer handling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          }
        });

        // Handle ICE candidates with improved queueing and validation
        socket.on("rtcIceCandidate", async (_from, cand) => {
          try {
            console.log(`🧊 [WEBRTC] Received ICE candidate from ${_from}`);
            console.log(`   Remote description set: ${!!pc.remoteDescription}`);
            console.log(`   Signaling state: ${pc.signalingState}`);

            if (pc.remoteDescription && pc.signalingState !== "closed") {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
              console.log("✅ [WEBRTC] Added ICE candidate successfully");
            } else {
              console.log(
                "📦 [WEBRTC] Queueing ICE candidate (no remote description yet or connection closed)",
              );
              pendingIceCandidatesRef.current.push(cand);
            }
          } catch (error) {
            console.error("❌ [WEBRTC] Error adding ICE candidate:", error);
            // Don't set camera error for individual ICE candidate failures
          }
        });

        // Step 4: Create offer if we're the polite peer with improved timing
        if (isPolite) {
          // Add random delay to prevent race conditions
          const randomDelay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
          console.log(
            `⏳ [WEBRTC] Polite peer waiting ${randomDelay.toFixed(0)}ms before creating offer`,
          );

          offerTimeout = setTimeout(async () => {
            if (!isActive || !pc || pc.signalingState !== "stable") {
              console.log(
                "⚠️ [WEBRTC] Polite peer cannot create offer - not ready",
              );
              return;
            }

            try {
              console.log(
                "📤 [WEBRTC] Creating and sending offer (polite peer)",
              );
              hasCreatedOffer = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("rtcOffer", offer);
              console.log("✅ [WEBRTC] Offer sent successfully");
            } catch (error) {
              console.error("❌ [WEBRTC] Failed to create offer:", error);
              setCameraError(
                `Failed to create WebRTC offer: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            }
          }, randomDelay);
        } else {
          console.log("⏳ [WEBRTC] Impolite peer waiting for offer");
        }
      } catch (err) {
        console.error("❌ [WEBRTC] Error in media/peer setup:", err);
        setCameraError(
          err instanceof Error ? err.message : "Failed to access camera",
        );

        // Retry connection if we haven't exceeded max attempts
        if (connectionAttempts < maxConnectionAttempts && isActive) {
          connectionRetryTimeout = setTimeout(() => {
            console.log(
              `🔄 [WEBRTC] Retrying connection setup (attempt ${connectionAttempts + 1}/${maxConnectionAttempts})`,
            );
            initializeMediaAndPeer();
          }, 3000);
        }
      }
    };

    // Only initialize if we have both player IDs (means we're in a game with opponent)
    // Add phase validation to ensure WebRTC setup happens at the right time
    // Also prevent re-initialization if we already have an active connection
    if (
      playerId &&
      opponentId &&
      (phase === "LOBBY_READY" ||
        phase === "ROUND_START" ||
        phase === "ROUND_ACTIVE")
    ) {
      // Check if we already have an active WebRTC connection
      if (peerRef.current && peerRef.current.connectionState === "connected") {
        console.log(
          `✅ [WEBRTC] Already connected, skipping re-initialization in phase: ${phase}`,
        );
        return;
      }
      console.log(`🚀 [WEBRTC] Starting WebRTC setup in phase: ${phase}`);
      initializeMediaAndPeer();
    } else {
      console.log(
        `⏳ [WEBRTC] Skipping WebRTC setup - playerId: ${!!playerId}, opponentId: ${!!opponentId}, phase: ${phase}`,
      );
    }

    return () => {
      isActive = false;
      console.log("🧹 [WEBRTC] Cleaning up media and peer connection");

      // Clear timeouts
      if (offerTimeout) {
        clearTimeout(offerTimeout);
        offerTimeout = null;
      }
      if (connectionRetryTimeout) {
        clearTimeout(connectionRetryTimeout);
        connectionRetryTimeout = null;
      }

      // Clean up socket listeners
      socket.off("rtcOffer");
      socket.off("rtcAnswer");
      socket.off("rtcIceCandidate");

      // Stop camera stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`🛑 [WEBRTC] Stopped ${track.kind} track`);
        });
        localStreamRef.current = null;
      }

      // Close peer connection
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
        console.log("🔌 [WEBRTC] Peer connection closed");
      }

      setCameraReady(false);
      setCameraError(null);
      setWebrtcStatus("disconnected");
    };
  }, [playerId, opponentId]); // Remove phase from dependencies to prevent cleanup during phase transitions

  // Separate effect to handle phase-specific logic without tearing down WebRTC
  useEffect(() => {
    // Only initialize WebRTC when we enter the appropriate phases
    if (
      playerId &&
      opponentId &&
      (phase === "LOBBY_READY" ||
        phase === "ROUND_START" ||
        phase === "ROUND_ACTIVE")
    ) {
      // Check if we already have an active WebRTC connection
      if (!peerRef.current || peerRef.current.connectionState === "closed") {
        console.log(
          `🚀 [WEBRTC] Phase-based WebRTC initialization in phase: ${phase}`,
        );
        // Trigger WebRTC setup - the main effect will handle this
      }
    }
  }, [phase, playerId, opponentId]);

  return (
    <>
      <div
        className="relative h-screen w-screen overflow-hidden"
        style={{
          backgroundImage: `url(${mapBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <HUD
          playerHp={playerHp}
          opponentHp={opponentHp}
          round={currentRound}
          phase={phase}
        />

        {/* ROUND_START overlay - countdown screen */}
        {phase === "ROUND_START" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-200">
            <div className="text-center space-y-10">
              <h1
                className="text-9xl font-black animate-pulse retro text-white"
                style={{ lineHeight: "1.5" }}
              >
                Round {currentRound}
              </h1>
              <p
                className="text-2xl text-white retro"
                style={{ lineHeight: "2" }}
              >
                Get ready...
              </p>
            </div>
          </div>
        )}

        {/* Player video - positioned on left platform (close/big) - always rendered */}
        <div
          className="absolute rounded shadow-2xl border-4 border-blue-500"
          style={{
            left: "8%",
            bottom: "10%",
            width: "35vw",
            height: "50vh",
            zIndex: 100,
            backgroundColor: cameraReady ? "transparent" : "rgba(0,0,0,0.8)",
            visibility: phase === "ROUND_START" ? "hidden" : "visible", // Hide during countdown
          }}
        >
          <video
            ref={localVideoRef}
            playsInline
            muted
            data-local="true"
            onCanPlay={async (e) => {
              console.log("📹 Local video can play");
              try {
                await e.currentTarget.play();
                console.log("✅ Local video playing");
              } catch (playErr) {
                console.warn(
                  "⚠️ Autoplay blocked, will play on user interaction:",
                  playErr,
                );
                // Add click handler to start video on user interaction
                const handleUserInteraction = async () => {
                  if (localVideoRef.current) {
                    try {
                      await localVideoRef.current.play();
                      console.log("✅ Video started after user interaction");
                      document.removeEventListener(
                        "click",
                        handleUserInteraction,
                      );
                      document.removeEventListener(
                        "touchstart",
                        handleUserInteraction,
                      );
                    } catch (err) {
                      console.error("❌ Still failed to play video:", err);
                    }
                  }
                };
                document.addEventListener("click", handleUserInteraction, {
                  once: true,
                });
                document.addEventListener("touchstart", handleUserInteraction, {
                  once: true,
                });
              }
            }}
            onError={(e) => {
              const videoEl = e.currentTarget;
              console.error("❌ Local video error:");
              console.error("  Error code:", videoEl.error?.code);
              console.error("  Error message:", videoEl.error?.message);
              console.error("  Network state:", videoEl.networkState);
              console.error("  Ready state:", videoEl.readyState);
              console.error("  Current src:", videoEl.srcObject);
              setCameraError(videoEl.error?.message || "Video playback error");
            }}
            className="w-full h-full object-cover rounded"
            style={{
              transform: "scaleX(-1)",
            }}
          />
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
              {cameraError ? (
                <div className="text-center p-4">
                  <div className="text-red-500 mb-2">⚠️ Camera Error</div>
                  <div>{cameraError}</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <div>Starting camera...</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Opponent video - positioned on right platform (far/small) - always rendered */}
        <div
          className="absolute rounded shadow-2xl border-4 border-green-500"
          style={{
            right: "8%",
            top: "15%",
            width: "22vw",
            height: "50vh",
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.8)",
            visibility: phase === "ROUND_START" ? "hidden" : "visible", // Hide during countdown
          }}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            data-remote="true"
            onLoadedMetadata={() => {
              console.log("📹 Remote video metadata loaded");
            }}
            onError={(e) => {
              const videoEl = e.currentTarget;
              console.error("❌ Remote video error:");
              console.error("  Error code:", videoEl.error?.code);
              console.error("  Error message:", videoEl.error?.message);
              console.error("  Network state:", videoEl.networkState);
              console.error("  Ready state:", videoEl.readyState);
              console.error("  Current src:", videoEl.srcObject);
            }}
            className="w-full h-full object-cover rounded"
            style={{
              transform: "scaleX(-1)",
            }}
          />
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
            Opponent
          </div>
        </div>

        {/* Pose Visualization Canvas Overlay - positioned over player video */}
        <canvas
          ref={canvasRef}
          className="absolute pointer-events-none"
          style={{
            left: "8%",
            bottom: "10%",
            width: "35vw",
            height: "50vh",
            transform: "scaleX(-1)",
            zIndex: 150,
          }}
        />

        {/* Overlay UI - Collapsible Spells Panel */}
        <div className="absolute top-40 right-8" style={{ zIndex: 200 }}>
          {/* Toggle Button - Always visible */}
          <button
            onClick={() => setIsSpellsPanelOpen(!isSpellsPanelOpen)}
            className="mb-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm font-bold retro"
            title={
              isSpellsPanelOpen ? "Hide spells panel" : "Show spells panel"
            }
          >
            <span className="text-lg">{isSpellsPanelOpen ? "📖" : "📕"}</span>
            <span>{isSpellsPanelOpen ? "Spells" : "Spells"}</span>
          </button>

          {/* Collapsible Panel */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isSpellsPanelOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
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

                {/* Camera & Connection Status */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      Camera Status
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        cameraReady
                          ? "bg-green-100 text-green-800"
                          : cameraError
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {cameraReady
                        ? "Ready"
                        : cameraError
                          ? "Error"
                          : "Starting..."}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      WebRTC Connection
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        webrtcStatus === "connected"
                          ? "bg-green-100 text-green-800"
                          : webrtcStatus === "connecting"
                            ? "bg-yellow-100 text-yellow-800"
                            : webrtcStatus === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {webrtcStatus === "connected"
                        ? "Connected"
                        : webrtcStatus === "connecting"
                          ? "Connecting..."
                          : webrtcStatus === "failed"
                            ? "Failed"
                            : "Disconnected"}
                    </div>
                  </div>

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
                </div>

                {/* Gesture Status */}
                <div className="space-y-3">
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
      </div>
      {phase === "PHOTO_BOOTH" ? <PhotoBooth visible /> : null}
    </>
  );
}

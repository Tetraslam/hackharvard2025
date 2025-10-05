import { useEffect, useRef, useState } from "react";
import { Camera } from "@/components/Camera";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { useGameStore } from "@/game/store";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { getSocket, type MoveType } from "@/net/socket";
import { useSocketEvents } from "@/net/useSocket";
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
  const webrtcSetupRef = useRef(false);

  // Initialize socket events
  useSocketEvents();

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

  // Mirror camera stream into circular local display video
  useEffect(() => {
    const syncLocalDisplay = () => {
      const sourceVideo = document.querySelector(
        "video[data-local='true']",
      ) as HTMLVideoElement | null;
      const displayVideo = document.querySelector(
        "video[data-local-display='true']",
      ) as HTMLVideoElement | null;

      if (sourceVideo && sourceVideo.srcObject && displayVideo) {
        if (displayVideo.srcObject !== sourceVideo.srcObject) {
          displayVideo.srcObject = sourceVideo.srcObject;
          // Ensure autoplay without sound
          displayVideo.muted = true;
          (displayVideo as HTMLVideoElement)
            .play()
            .catch(() => {});
          console.log("Synced local display video with camera stream");
        }
      }
    };

    // Try immediately and then periodically in case camera initializes late
    syncLocalDisplay();
    const intervalId = window.setInterval(syncLocalDisplay, 500);
    return () => window.clearInterval(intervalId);
  }, []);

  // WebRTC signaling + media setup - only when both players are connected
  useEffect(() => {
    if (!playerId || !opponentId) {
      console.log("WebRTC: Waiting for both players to connect");
      return;
    }
    
    if (webrtcSetupRef.current) {
      console.log("WebRTC: Already set up, skipping");
      return;
    }
    
    webrtcSetupRef.current = true;
    console.log("Setting up WebRTC...", { playerId, opponentId });
    
    const socket = getSocket();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
    peerRef.current = pc;

    // ICE candidate handler
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("Sending ICE candidate");
        socket.emit("rtcIceCandidate", e.candidate.toJSON());
      }
    };

    // Remote track handler
    pc.ontrack = (e) => {
      console.log("Received remote track:", e.streams);
      const [stream] = e.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        console.log("Set remote video source");
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };

    // Track if local tracks have been added
    let localTracksAdded = false;

    // Setup socket handlers
    socket.on("rtcOffer", async (from, offer) => {
      console.log("Received RTC offer from:", from);
      try {
        // Wait for local tracks to be added before responding
        let waitAttempts = 0;
        while (!localTracksAdded && waitAttempts < 40) {
          console.log("Waiting for local tracks before responding to offer...");
          await new Promise(resolve => setTimeout(resolve, 250));
          waitAttempts++;
        }
        
        if (!localTracksAdded) {
          console.error("Timeout waiting for local tracks");
        }
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("rtcAnswer", answer);
        console.log("Sent RTC answer");
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });
    
    socket.on("rtcAnswer", async (from, answer) => {
      console.log("Received RTC answer from:", from);
      try {
        // Only set remote description if we're in the right state
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Set remote description from answer");
        } else {
          console.log("Ignoring answer, wrong signaling state:", pc.signalingState);
        }
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });
    
    socket.on("rtcIceCandidate", async (from, cand) => {
      console.log("Received ICE candidate from:", from);
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (error) {
        console.log("ICE candidate error:", error);
      }
    });

    // Async function to setup media and optionally create offer
    const setupMediaAndCreateOffer = async () => {
      console.log("Waiting for local video to be ready...");
      
      // Wait for video element to be ready
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        const videoEl = document.querySelector<HTMLVideoElement>(
          "video[data-local='true']",
        );
        
        if (videoEl && videoEl.srcObject && videoEl.readyState >= 2) {
          console.log("Video ready! Adding tracks to peer connection...");
          const localStream = videoEl.srcObject as MediaStream;
          
          // Verify connection is still valid
          if (pc.signalingState === 'closed') {
            console.error("Peer connection closed, aborting setup");
            return;
          }
          
          // Add all tracks from local stream
          const tracks = localStream.getTracks();
          console.log("Local stream tracks:", tracks.length);
          
          for (const track of tracks) {
            try {
              pc.addTrack(track, localStream);
              console.log("Added track:", track.kind);
            } catch (error) {
              console.error("Failed to add track:", error);
              return;
            }
          }
          
          // Mark that local tracks have been added
          localTracksAdded = true;
          console.log("Local tracks added successfully");
          
          // Only create offer if this player should be the offerer
          // Use lexicographic comparison to determine who offers
          const shouldCreateOffer = playerId < opponentId;
          console.log("Should create offer:", shouldCreateOffer, { playerId, opponentId });
          
          if (shouldCreateOffer) {
            console.log("Creating RTC offer with tracks...");
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("rtcOffer", offer);
              console.log("Sent RTC offer successfully");
            } catch (error) {
              console.error("Failed to create/send offer:", error);
            }
          } else {
            console.log("Waiting to receive offer from peer...");
          }
          
          return;
        }
        
        console.log(`Attempt ${attempts + 1}: Video not ready yet (readyState: ${videoEl?.readyState})`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.error("Failed to setup media after 10 seconds");
    };

    // Start the async setup process
    setupMediaAndCreateOffer();

    // Cleanup
    return () => {
      console.log("Cleaning up WebRTC connection for round", currentRound);
      socket.off("rtcOffer");
      socket.off("rtcAnswer");
      socket.off("rtcIceCandidate");
      
      if (pc) {
        pc.close();
      }
      
      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      peerRef.current = null;
      webrtcSetupRef.current = false;
    };
  }, [playerId, opponentId, currentRound]);

  if (phase === "ROUND_START") {
    return (
      <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background">
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

        {/* Arena with stadium background and video overlays on circular platforms */}
        <div className="absolute inset-0 pt-32 pb-8 bg-transparent">
          {/* Stadium background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/src/assets/maps/basic_arena.webp')`
            }}
          />

          {/* Your video positioned over bottom-left platform (responsive rectangle) */}
          <div
            className="absolute overflow-hidden border-4 border-white shadow-lg z-30"
            style={{ left: "3vw", bottom: "10vh", width: "28vw", height: "16vw" }}
          >
            <video
              data-local-display="true"
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Pose overlay aligned to local video */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 40, transform: "scaleX(-1)" }}
            />
          </div>

          {/* Remote opponent video positioned over top-right platform (responsive rectangle) */}
          <div
            className="absolute overflow-hidden border-4 border-white shadow-lg z-30"
            style={{ right: "8vw", top: "22vh", width: "28vw", height: "16vw" }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              data-remote="true"
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
              onLoadedMetadata={() => console.log("Remote video loaded metadata")}
              onCanPlay={() => console.log("Remote video can play")}
              onError={(e) => console.log("Remote video error:", e)}
            />
          </div>

          {/* Camera for pose detection - invisible overlay */}
          <div className="absolute inset-0 opacity-0 pointer-events-none">
            <Camera onFrame={processFrame} className="h-full w-full" />
          </div>
        </div>

        {/* Pokemon Showdown Style Overlay UI */}
        <div className="absolute bottom-8 right-8 z-10">
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

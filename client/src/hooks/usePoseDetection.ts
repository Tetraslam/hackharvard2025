import {
  DrawingUtils,
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MoveType } from "@/net/socket";

export interface GestureDetection {
  move: MoveType | "none";
  confidence: number;
  isDetected: boolean;
}

type LM = { x: number; y: number; z?: number; visibility?: number };

function detectWaterBlast(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const crossed =
    Math.hypot(leftWrist.x - rightElbow.x, leftWrist.y - rightElbow.y) < 0.18 &&
    Math.hypot(rightWrist.x - leftElbow.x, rightWrist.y - leftElbow.y) < 0.18;
  const forward = leftWrist.x > leftElbow.x && rightWrist.x > rightElbow.x;
  const confidence = crossed && forward ? 0.7 : 0;
  return { move: "waterblast", confidence, isDetected: confidence > 0.55 };
}

function detectFireball(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const wristDistance = Math.hypot(
    leftWrist.x - rightWrist.x,
    leftWrist.y - rightWrist.y,
  );
  const bothArmsForward =
    leftWrist.x > leftShoulder.x && rightWrist.x > rightShoulder.x;
  const confidence = wristDistance < 0.15 && bothArmsForward ? 0.8 : 0;
  return { move: "fireball", confidence, isDetected: confidence > 0.5 };
}

function detectLightning(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftArmUp = leftWrist.y < leftShoulder.y;
  const rightArmForward = rightWrist.x > rightShoulder.x;
  const rightArmUp = rightWrist.y < rightShoulder.y;
  const leftArmForward = leftWrist.x > leftShoulder.x;
  const isLightning =
    (leftArmUp && rightArmForward) || (rightArmUp && leftArmForward);
  const confidence = isLightning ? 0.7 : 0;
  return { move: "lightning", confidence, isDetected: confidence > 0.5 };
}

function detectShield(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const bothArmsUp = leftWrist.y < leftElbow.y && rightWrist.y < rightElbow.y;
  const confidence = bothArmsUp ? 0.7 : 0;
  return { move: "shield", confidence, isDetected: confidence > 0.5 };
}

function detectCounter(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const wristsHigh = leftWrist.y < leftElbow.y && rightWrist.y < rightElbow.y;
  const wristsNear =
    Math.hypot(leftWrist.x - rightWrist.x, leftWrist.y - rightWrist.y) < 0.12;
  const confidence = wristsHigh && wristsNear ? 0.65 : 0;
  return { move: "counter", confidence, isDetected: confidence > 0.55 };
}

function detectJobApplication(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const wristDistance = Math.hypot(
    leftWrist.x - rightWrist.x,
    leftWrist.y - rightWrist.y,
  );
  const confidence = wristDistance < 0.1 ? 0.8 : 0;
  return { move: "jobapplication", confidence, isDetected: confidence > 0.6 };
}

function detectMeteor(landmarks: LM[]): GestureDetection {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const nose = landmarks[0];
  const bothArmsVeryHigh =
    leftWrist.y < leftShoulder.y - 0.15 &&
    rightWrist.y < rightShoulder.y - 0.15;
  const armsAboveNose =
    leftWrist.y < nose.y - 0.1 && rightWrist.y < nose.y - 0.1;
  const elbowsHigh =
    leftElbow.y < leftShoulder.y - 0.1 && rightElbow.y < rightShoulder.y - 0.1;
  const armsSpread = Math.abs(leftWrist.x - rightWrist.x) > 0.2;
  const basicMeteor = bothArmsVeryHigh && armsAboveNose;
  const preciseMeteor = basicMeteor && elbowsHigh && armsSpread;
  const confidence = preciseMeteor ? 0.9 : basicMeteor ? 0.7 : 0;
  return { move: "meteor", confidence, isDetected: confidence > 0.6 };
}

export function usePoseDetection(
  canvasRef?: React.RefObject<HTMLCanvasElement>,
) {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null,
  );
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<GestureDetection>({
    move: "none",
    confidence: 0,
    isDetected: false,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastProcessTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        console.log("Initializing MediaPipe Tasks Vision...");

        // Load the MediaPipe vision tasks
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        // Create PoseLandmarker
        const poseLandmarkerInstance = await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          },
        );

        // Create HandLandmarker
        const handLandmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          },
        );

        setPoseLandmarker(poseLandmarkerInstance);
        setHandLandmarker(handLandmarkerInstance);
        setIsInitialized(true);
        console.log(
          "✅ MediaPipe Pose and Hand Landmarkers loaded successfully!",
        );
      } catch (error) {
        console.error("❌ Error loading MediaPipe:", error);
        setIsInitialized(false);
      }
    };

    initializePoseDetection();
  }, []);

  // Start processing when video element gets a stream
  useEffect(() => {
    const startProcessing = () => {
      if (videoRef.current && isInitialized && videoRef.current.srcObject instanceof MediaStream) {
        console.log("🎥 [POSE] Starting pose detection processing");
        const processLoop = () => {
          if (videoRef.current && isInitialized && poseLandmarker) {
            processFrame(videoRef.current);
          }
          requestAnimationFrame(processLoop);
        };
        processLoop();
      }
    };

    // Start processing if video already has stream
    startProcessing();

    // Listen for video srcObject changes
    const videoElement = videoRef.current;
    if (videoElement) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
            startProcessing();
            break;
          }
        }
      });
      observer.observe(videoElement, { attributes: true });

      // Also listen for loadedmetadata event
      videoElement.addEventListener('loadedmetadata', startProcessing, { once: true });
    }
  }, [isInitialized, poseLandmarker]);

  const detectGesture = useCallback(
    (poseLandmarks?: LM[]): GestureDetection => {
      if (!poseLandmarks || poseLandmarks.length < 33) {
        return { move: "none", confidence: 0, isDetected: false };
      }

      const leftWrist = poseLandmarks[15];
      const rightWrist = poseLandmarks[16];
      if (
        (leftWrist.visibility ?? 1) < 0.5 ||
        (rightWrist.visibility ?? 1) < 0.5
      ) {
        return { move: "none", confidence: 0, isDetected: false };
      }

      const gestures = [
        detectFireball(poseLandmarks),
        detectWaterBlast(poseLandmarks),
        detectLightning(poseLandmarks),
        detectShield(poseLandmarks),
        detectCounter(poseLandmarks),
        detectJobApplication(poseLandmarks),
        detectMeteor(poseLandmarks),
      ];

      const bestGesture = gestures.reduce((best, current) =>
        current.confidence > best.confidence ? current : best,
      );

      return bestGesture;
    },
    [],
  );

  const processFrame = useCallback(
    async (video: HTMLVideoElement) => {
      // Add safety checks to prevent errors during initialization
      if (!video || !poseLandmarker || !handLandmarker || !isInitialized) {
        return;
      }

      // Throttle processing
      const now = Date.now();
      if (now - lastProcessTime.current < 100) {
        // Process every 100ms
        return;
      }
      lastProcessTime.current = now;

      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Detect pose and hands
          const startTimeMs = performance.now();
          const poseResults = poseLandmarker.detectForVideo(video, startTimeMs);
          const handResults = handLandmarker
            ? handLandmarker.detectForVideo(video, startTimeMs)
            : { landmarks: [], handedness: [] };

          // Draw pose and hand landmarks on canvas if available
          if (canvasRef && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (ctx) {
              // Set canvas size to match video
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;

              // Clear canvas completely (transparent background)
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              const drawingUtils = new DrawingUtils(ctx);

              // Draw pose skeleton - pass normalized landmarks directly
              if (poseResults.landmarks && poseResults.landmarks.length > 0) {
                for (const landmarks of poseResults.landmarks) {
                  // Pass normalized landmarks (0-1) directly - DrawingUtils handles scaling
                  drawingUtils.drawConnectors(
                    landmarks,
                    PoseLandmarker.POSE_CONNECTIONS,
                    { color: "#00FF00", lineWidth: 2 },
                  );

                  drawingUtils.drawLandmarks(landmarks, {
                    color: "#FF0000",
                    lineWidth: 1,
                    radius: 4,
                  });
                }

                // Detect gestures
                const gesture = detectGesture(poseResults.landmarks[0] as LM[]);
                setDetectedGesture(gesture);
              }

              // Draw hand skeleton - pass normalized landmarks directly
              if (handResults.landmarks && handResults.landmarks.length > 0) {
                for (const handLandmarks of handResults.landmarks) {
                  // Pass normalized landmarks (0-1) directly - DrawingUtils handles scaling
                  drawingUtils.drawConnectors(
                    handLandmarks,
                    HandLandmarker.HAND_CONNECTIONS,
                    {
                      color: "#00FFFF",
                      lineWidth: 2,
                    },
                  );

                  drawingUtils.drawLandmarks(handLandmarks, {
                    color: "#FFFF00",
                    lineWidth: 1,
                    radius: 3,
                  });
                }
              }
            }
          }

          frameCount.current++;
          if (frameCount.current % 30 === 0) {
            console.log(`Processed ${frameCount.current} frames`);
          }
        }
      } catch (error) {
        console.error("Error processing frame:", error);
        // Don't crash the component on pose detection errors
      }
    },
    [poseLandmarker, handLandmarker, isInitialized, canvasRef, detectGesture],
  );

  return {
    isInitialized,
    detectedGesture,
    processFrame,
    videoRef,
    poseLandmarker,
    handLandmarker,
  };
}

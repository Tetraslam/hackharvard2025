import { useEffect, useRef, useState, useCallback } from "react";
import {
  PoseLandmarker,
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

export interface GestureDetection {
  move: string;
  confidence: number;
  isDetected: boolean;
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

  const processFrame = useCallback(
    async (video: HTMLVideoElement) => {
      if (!poseLandmarker || !isInitialized) return;

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
                const gesture = detectGesture(
                  poseResults.landmarks[0],
                  handResults.landmarks,
                  handResults.handedness,
                );
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
      }
    },
    [poseLandmarker, handLandmarker, isInitialized],
  );

  const detectGesture = (
    poseLandmarks?: any[],
    handLandmarks?: any[][],
    handedness?: any[],
  ): GestureDetection => {
    if (!poseLandmarks || poseLandmarks.length < 33) {
      return { move: "none", confidence: 0, isDetected: false };
    }

    // Get key landmarks
    const leftWrist = poseLandmarks[15];
    const rightWrist = poseLandmarks[16];

    // Check visibility first
    if (leftWrist.visibility < 0.5 || rightWrist.visibility < 0.5) {
      return { move: "none", confidence: 0, isDetected: false };
    }

    // Check for each gesture
    const gestures = [
      detectFireball(poseLandmarks),
      detectLightning(poseLandmarks),
      detectShield(poseLandmarks),
      detectJobApplication(poseLandmarks),
      detectPowerStance(poseLandmarks),
      detectDodgeRoll(poseLandmarks),
      detectMeteor(poseLandmarks),
    ];

    // Return the gesture with highest confidence
    const bestGesture = gestures.reduce((best, current) =>
      current.confidence > best.confidence ? current : best,
    );

    return bestGesture;
  };

  // Gesture detection functions
  const detectFireball = (landmarks: any[]): GestureDetection => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // Check if both wrists are together and forward
    const wristDistance = Math.sqrt(
      Math.pow(leftWrist.x - rightWrist.x, 2) +
        Math.pow(leftWrist.y - rightWrist.y, 2),
    );

    const bothArmsForward =
      leftWrist.x > leftShoulder.x && rightWrist.x > rightShoulder.x;

    const confidence = wristDistance < 0.15 && bothArmsForward ? 0.8 : 0;

    return {
      move: "fireball",
      confidence,
      isDetected: confidence > 0.5,
    };
  };

  const detectLightning = (landmarks: any[]): GestureDetection => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // One arm up, one forward
    const leftArmUp = leftWrist.y < leftShoulder.y;
    const rightArmForward = rightWrist.x > rightShoulder.x;
    const rightArmUp = rightWrist.y < rightShoulder.y;
    const leftArmForward = leftWrist.x > leftShoulder.x;

    const isLightning =
      (leftArmUp && rightArmForward) || (rightArmUp && leftArmForward);
    const confidence = isLightning ? 0.7 : 0;

    return {
      move: "lightning",
      confidence,
      isDetected: confidence > 0.5,
    };
  };

  const detectShield = (landmarks: any[]): GestureDetection => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];

    // Both arms up protecting face
    const bothArmsUp = leftWrist.y < leftElbow.y && rightWrist.y < rightElbow.y;

    const confidence = bothArmsUp ? 0.7 : 0;

    return {
      move: "shield",
      confidence,
      isDetected: confidence > 0.5,
    };
  };

  const detectJobApplication = (landmarks: any[]): GestureDetection => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Prayer hands - wrists close together
    const wristDistance = Math.sqrt(
      Math.pow(leftWrist.x - rightWrist.x, 2) +
        Math.pow(leftWrist.y - rightWrist.y, 2),
    );

    const confidence = wristDistance < 0.1 ? 0.8 : 0;

    return {
      move: "job_application",
      confidence,
      isDetected: confidence > 0.6,
    };
  };

  const detectPowerStance = (landmarks: any[]): GestureDetection => {
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // Wide stance
    const hipDistance = Math.abs(leftHip.x - rightHip.x);
    const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
    const isWideStance = hipDistance > shoulderDistance * 1.2;

    const confidence = isWideStance ? 0.7 : 0;

    return {
      move: "power_stance",
      confidence,
      isDetected: confidence > 0.5,
    };
  };

  const detectDodgeRoll = (landmarks: any[]): GestureDetection => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Body tilted to one side
    const leftSideTilt = leftShoulder.x < leftHip.x;
    const rightSideTilt = rightShoulder.x > rightHip.x;
    const isTilted = leftSideTilt || rightSideTilt;

    const confidence = isTilted ? 0.6 : 0;

    return {
      move: "dodge_roll",
      confidence,
      isDetected: confidence > 0.5,
    };
  };

  const detectMeteor = (landmarks: any[]): GestureDetection => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const nose = landmarks[0];

    // Both arms very high above head
    const bothArmsVeryHigh =
      leftWrist.y < leftShoulder.y - 0.15 &&
      rightWrist.y < rightShoulder.y - 0.15;

    // Arms should be above nose level
    const armsAboveNose =
      leftWrist.y < nose.y - 0.1 && rightWrist.y < nose.y - 0.1;

    // Elbows should also be high
    const elbowsHigh =
      leftElbow.y < leftShoulder.y - 0.1 &&
      rightElbow.y < rightShoulder.y - 0.1;

    // Arms should be spread apart (not together like fireball)
    const armsSpread = Math.abs(leftWrist.x - rightWrist.x) > 0.2;

    const basicMeteor = bothArmsVeryHigh && armsAboveNose;
    const preciseMeteor = basicMeteor && elbowsHigh && armsSpread;

    const confidence = preciseMeteor ? 0.9 : basicMeteor ? 0.7 : 0;

    return {
      move: "meteor",
      confidence,
      isDetected: confidence > 0.6,
    };
  };

  return {
    isInitialized,
    detectedGesture,
    processFrame,
    videoRef,
    poseLandmarker,
    handLandmarker,
  };
}

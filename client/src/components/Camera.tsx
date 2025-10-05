import { useEffect, useRef, useState } from "react";

interface CameraProps {
  onFrame?: (video: HTMLVideoElement) => void;
  className?: string;
}

export function Camera({ onFrame, className = "" }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user", // Front camera
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsActive(true);

          // Start frame processing
          const processFrame = () => {
            if (videoRef.current && onFrame) {
              onFrame(videoRef.current);
            }
            requestAnimationFrame(processFrame);
          };
          processFrame();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or not available");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsActive(false);
    };
  }, [onFrame]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 text-white p-4 rounded ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        data-local="true"
        className="w-full h-full object-cover rounded"
        style={{ transform: "scaleX(-1)" }} // Mirror the video
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">Starting camera...</div>
          </div>
        </div>
      )}
    </div>
  );
}

import type { Position } from "./positions";
import type { ProjectileConfig } from "./projectiles";

interface ProjectileEffectProps {
  id: string;
  config: ProjectileConfig;
  from: Position;
  to: Position;
  onComplete: () => void;
}

export function ProjectileEffect({
  id,
  config,
  from,
  to,
  onComplete,
}: ProjectileEffectProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${from.x}vw`,
        top: `${from.y}vh`,
        fontSize: config.size,
        filter: config.trail ? "drop-shadow(0 0 20px currentColor)" : undefined,
        color: config.color,
        animation: `projectile-${id} ${config.speed}s linear forwards`,
        willChange: "transform",
      }}
      onAnimationEnd={onComplete}
    >
      <div className="animate-bounce">{config.emoji}</div>
      <style>{`
        @keyframes projectile-${id} {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(${dx}vw, ${dy}vh) scale(1.2); }
        }
      `}</style>
    </div>
  );
}

interface ShieldEffectProps {
  position: Position;
  onComplete: () => void;
}

export function ShieldEffect({ position, onComplete }: ShieldEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${position.x - 15}vw`,
        top: `${position.y - 9}vh`,
        width: "30vw",
        height: "18vw",
        border: "4px solid #4169e1",
        borderRadius: "8px",
        boxShadow: "0 0 30px #4169e1, inset 0 0 30px #4169e1",
        animation: "shield-pulse 1s ease-out forwards",
      }}
      onAnimationEnd={onComplete}
    >
      <style>{`
        @keyframes shield-pulse {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

interface CounterEffectProps {
  position: Position;
  onComplete: () => void;
}

export function CounterEffect({ position, onComplete }: CounterEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${position.x - 15}vw`,
        top: `${position.y - 9}vh`,
        width: "30vw",
        height: "18vw",
        border: "4px solid #ff8c00",
        borderRadius: "8px",
        boxShadow: "0 0 40px #ff8c00, inset 0 0 40px #ff8c00",
        animation: "counter-flash 0.3s ease-out forwards",
      }}
      onAnimationEnd={onComplete}
    >
      <style>{`
        @keyframes counter-flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface ImpactEffectProps {
  position: Position;
  damage: number;
  type: "hit" | "block";
  onComplete: () => void;
}

export function ImpactEffect({
  position,
  damage,
  type,
  onComplete,
}: ImpactEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position.x}vw`,
        top: `${position.y - 5}vh`,
        animation: "damage-rise 1.5s ease-out forwards",
      }}
      onAnimationEnd={onComplete}
    >
      <div
        className="text-5xl font-black retro"
        style={{
          color: type === "hit" ? "#ff0000" : "#4169e1",
          textShadow: "0 0 10px currentColor, 2px 2px 0 #000",
          WebkitTextStroke: "2px #000",
        }}
      >
        {type === "hit" ? `-${damage}` : "BLOCKED"}
      </div>
      <style>{`
        @keyframes damage-rise {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface CancelEffectProps {
  position: Position;
  onComplete: () => void;
}

export function CancelEffect({ position, onComplete }: CancelEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-45"
      style={{
        left: `${position.x - 5}vw`,
        top: `${position.y - 5}vh`,
        fontSize: "6rem",
        animation: "cancel-explode 0.8s ease-out forwards",
      }}
      onAnimationEnd={onComplete}
    >
      💥
      <style>{`
        @keyframes cancel-explode {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface StunEffectProps {
  position: Position;
  onComplete: () => void;
}

export function StunEffect({ position, onComplete }: StunEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-40"
      style={{
        left: `${position.x - 10}vw`,
        top: `${position.y - 12}vh`,
        fontSize: "4rem",
        animation: "stun-shake 2s ease-out forwards",
      }}
      onAnimationEnd={onComplete}
    >
      <div className="flex gap-2">
        <span className="animate-pulse">⚡</span>
        <span className="animate-pulse delay-150">⚡</span>
        <span className="animate-pulse delay-300">⚡</span>
      </div>
      <style>{`
        @keyframes stun-shake {
          0%, 100% { transform: translateX(0); opacity: 1; }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
          95% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}


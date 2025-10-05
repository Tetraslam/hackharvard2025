import type { MoveType } from "@/net/socket";

export interface ProjectileConfig {
  emoji: string;
  color: string;
  size: string;
  speed: number;
  trail?: boolean;
}

export const PROJECTILE_CONFIG: Record<MoveType, ProjectileConfig | null> = {
  fireball: {
    emoji: "🔥",
    color: "#ff4500",
    size: "4rem",
    speed: 0.6,
    trail: true,
  },
  waterblast: {
    emoji: "🌊",
    color: "#4169e1",
    size: "4rem",
    speed: 0.5,
    trail: true,
  },
  lightning: {
    emoji: "⚡",
    color: "#ffd700",
    size: "5rem",
    speed: 0.3,
  },
  meteor: {
    emoji: "☄️",
    color: "#8b4513",
    size: "6rem",
    speed: 1.0,
    trail: true,
  },
  jobapplication: {
    emoji: "📄",
    color: "#fff",
    size: "3rem",
    speed: 0.8,
  },
  shield: null,
  counter: null,
};


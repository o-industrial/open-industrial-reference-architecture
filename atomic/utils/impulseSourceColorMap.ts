import { IntentStyleMap } from '../utils/getIntentStyles.ts';
import { RuntimeImpulseSources } from '../../src/types/RuntimeImpulse.ts';

export const impulseSourceColorMap: Record<RuntimeImpulseSources, IntentStyleMap> = {
  DataConnection: {
    text: 'text-neon-teal-600 dark:text-neon-teal-400',
    border: 'border-neon-teal-500',
    background: 'bg-neon-teal-100/30 dark:bg-neon-teal-900/30',
    ring: 'ring-neon-teal-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]',
    pulse: {
      low: 'bg-neon-teal-500/30 animate-ping-slow',
      mid: 'bg-neon-teal-500/50 animate-ping',
      high: 'bg-neon-teal-500/70 animate-ping-fast',
    },
  },
  Signal: {
    text: 'text-neon-orange-600 dark:text-neon-orange-400',
    border: 'border-neon-orange-500',
    background: 'bg-neon-orange-100/30 dark:bg-neon-orange-900/30',
    ring: 'ring-neon-orange-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]',
    pulse: {
      low: 'bg-neon-orange-500/30 animate-ping-slow',
      mid: 'bg-neon-orange-500/50 animate-ping',
      high: 'bg-neon-orange-500/70 animate-ping-fast',
    },
  },
  SurfaceAgent: {
    text: 'text-neon-pink-600 dark:text-neon-pink-400',
    border: 'border-neon-pink-500',
    background: 'bg-neon-pink-100/30 dark:bg-neon-pink-900/30',
    ring: 'ring-neon-pink-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]',
    pulse: {
      low: 'bg-neon-pink-500/30 animate-ping-slow',
      mid: 'bg-neon-pink-500/50 animate-ping',
      high: 'bg-neon-pink-500/70 animate-ping-fast',
    },
  },
  SurfaceConnection: {
    text: 'text-neon-lime-600 dark:text-neon-lime-400',
    border: 'border-neon-lime-500',
    background: 'bg-neon-lime-100/30 dark:bg-neon-lime-900/30',
    ring: 'ring-neon-lime-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(132,204,22,0.4)]',
    pulse: {
      low: 'bg-neon-lime-500/30 animate-ping-slow',
      mid: 'bg-neon-lime-500/50 animate-ping',
      high: 'bg-neon-lime-500/70 animate-ping-fast',
    },
  },
  SurfaceSchema: {
    text: 'text-neon-purple-600 dark:text-neon-purple-400',
    border: 'border-neon-purple-500',
    background: 'bg-neon-purple-100/30 dark:bg-neon-purple-900/30',
    ring: 'ring-neon-purple-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    pulse: {
      low: 'bg-neon-purple-500/30 animate-ping-slow',
      mid: 'bg-neon-purple-500/50 animate-ping',
      high: 'bg-neon-purple-500/70 animate-ping-fast',
    },
  },
  SurfaceWarmQuery: {
    text: 'text-neon-cyan-600 dark:text-neon-cyan-400',
    border: 'border-neon-cyan-500',
    background: 'bg-neon-cyan-100/30 dark:bg-neon-cyan-900/30',
    ring: 'ring-neon-cyan-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    pulse: {
      low: 'bg-neon-cyan-500/30 animate-ping-slow',
      mid: 'bg-neon-cyan-500/50 animate-ping',
      high: 'bg-neon-cyan-500/70 animate-ping-fast',
    },
  },
  SurfaceInterface: {
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500',
    background: 'bg-sky-100/30 dark:bg-sky-900/30',
    ring: 'ring-sky-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]',
    pulse: {
      low: 'bg-sky-500/30 animate-ping-slow',
      mid: 'bg-sky-500/50 animate-ping',
      high: 'bg-sky-500/70 animate-ping-fast',
    },
  },
  System: {
    text: 'text-neutral-600 dark:text-neutral-200',
    border: 'border-neutral-500',
    background: 'bg-neutral-100/30 dark:bg-neutral-800/30',
    ring: 'ring-neutral-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(115,115,115,0.3)]',
    pulse: {
      low: 'bg-neutral-500/30 animate-ping-slow',
      mid: 'bg-neutral-500/50 animate-ping',
      high: 'bg-neutral-500/70 animate-ping-fast',
    },
  },
};

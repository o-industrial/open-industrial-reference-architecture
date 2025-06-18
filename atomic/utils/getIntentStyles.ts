import { IntentTypes } from '../.deps.ts';


type IntentStyleMap = {
  border: string;
  background: string;
  glow: string;
  pulse: {
    low: string;
    mid: string;
    high: string;
  };
  ring: string;
  text: string;
};

export const intentStyleMap: Record<IntentTypes, IntentStyleMap> = {
  [IntentTypes.Primary]: {
    text: 'text-neon-violet-600 dark:text-neon-violet-400',
    border: 'border-neon-violet-500',
    background: 'bg-neon-violet-100/30 dark:bg-neon-violet-900/30',
    ring: 'ring-neon-violet-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(165,105,255,0.4)]',
    pulse: {
      low: 'bg-neon-violet-500/30 animate-ping-slow',
      mid: 'bg-neon-violet-500/50 animate-ping',
      high: 'bg-neon-violet-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.Secondary]: {
    text: 'text-neon-indigo-600 dark:text-neon-indigo-400',
    border: 'border-neon-indigo-500',
    background: 'bg-neon-indigo-100/30 dark:bg-neon-indigo-900/30',
    ring: 'ring-neon-indigo-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]',
    pulse: {
      low: 'bg-neon-indigo-500/30 animate-ping-slow',
      mid: 'bg-neon-indigo-500/50 animate-ping',
      high: 'bg-neon-indigo-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.Tertiary]: {
    text: 'text-neon-blue-600 dark:text-neon-blue-400',
    border: 'border-neon-blue-500',
    background: 'bg-neon-blue-100/30 dark:bg-neon-blue-900/30',
    ring: 'ring-neon-blue-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]',
    pulse: {
      low: 'bg-neon-blue-500/30 animate-ping-slow',
      mid: 'bg-neon-blue-500/50 animate-ping',
      high: 'bg-neon-blue-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.Warning]: {
    text: 'text-neon-yellow-600 dark:text-neon-yellow-300',
    border: 'border-neon-yellow-500',
    background: 'bg-neon-yellow-100/30 dark:bg-neon-yellow-900/30',
    ring: 'ring-neon-yellow-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]',
    pulse: {
      low: 'bg-neon-yellow-500/30 animate-ping-slow',
      mid: 'bg-neon-yellow-500/50 animate-ping',
      high: 'bg-neon-yellow-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.Error]: {
    text: 'text-neon-red-600 dark:text-neon-red-400',
    border: 'border-neon-red-500',
    background: 'bg-neon-red-100/30 dark:bg-neon-red-900/30',
    ring: 'ring-neon-red-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
    pulse: {
      low: 'bg-neon-red-500/30 animate-ping-slow',
      mid: 'bg-neon-red-500/50 animate-ping',
      high: 'bg-neon-red-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.Info]: {
    text: 'text-neon-cyan-600 dark:text-neon-cyan-400',
    border: 'border-neon-cyan-500',
    background: 'bg-neon-cyan-100/30 dark:bg-neon-cyan-900/30',
    ring: 'ring-neon-cyan-400/30',
    glow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    pulse: {
      low: 'bg-neon-cyan-500/30 animate-ping-slow',
      mid: 'bg-neon-cyan-500/50 animate-ping',
      high: 'bg-neon-cyan-500/70 animate-ping-fast',
    },
  },
  [IntentTypes.None]: {
    text: 'text-neutral-700 dark:text-neutral-300',
    border: 'border-neutral-400',
    background: 'bg-neutral-100/30 dark:bg-neutral-800/30',
    ring: 'ring-white/10',
    glow: '',
    pulse: {
      low: 'bg-neutral-400/30 animate-ping-slow',
      mid: 'bg-neutral-400/50 animate-ping',
      high: 'bg-neutral-400/70 animate-ping-fast',
    },
  },
};

export function getIntentStyles(intent: IntentTypes = IntentTypes.Info): IntentStyleMap {
  return intentStyleMap[intent] ?? intentStyleMap[IntentTypes.Info];
}

export function getIntentClasses(intent: IntentTypes = IntentTypes.Info): string {
  const { text, border, background } = getIntentStyles(intent);
  return `${text} ${border} ${background}`;
}

export function getIntentBackgroundMap(intent: IntentTypes = IntentTypes.Info): string {
  return getIntentStyles(intent).background;
}

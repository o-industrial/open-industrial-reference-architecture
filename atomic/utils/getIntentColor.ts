import { IntentTypes } from '../.deps.ts';
import { neonColors } from './neonColors.ts';

export function getIntentColor(intent: IntentTypes): string {
  switch (intent) {
    case IntentTypes.Primary:
      return neonColors['neon-violet'][400];
    case IntentTypes.Secondary:
      return neonColors['neon-indigo'][400];
    case IntentTypes.Tertiary:
      return neonColors['neon-blue'][400];
    case IntentTypes.Warning:
      return neonColors['neon-yellow'][400];
    case IntentTypes.Error:
      return neonColors['neon-red'][400];
    case IntentTypes.Info:
      return neonColors['neon-cyan'][400];
    case IntentTypes.None:
    default:
      return '#888888';
  }
}

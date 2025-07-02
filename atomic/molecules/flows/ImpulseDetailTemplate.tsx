import { IntentTypes, JSX } from '../../.deps.ts';
import {
  getIntentStyles,
  IntentStyleMap,
} from '../../utils/getIntentStyles.ts';

export type ImpulseDetailTemplateProps = {
  name: string;
  timestamp: string;
  payload: Record<string, unknown>;
  confidence: number;
  colorMap: IntentStyleMap;
  children?: JSX.Element | JSX.Element[];
};

export function ImpulseDetailTemplate({
  name,
  timestamp,
  payload,
  confidence,
  colorMap,
  children,
}: ImpulseDetailTemplateProps): JSX.Element {
  const shellText = colorMap.text ?? 'text-neutral-300';
  const shellBorder = colorMap.border ?? 'border-neutral-400';
  const shellBackground = colorMap.background ?? 'bg-neutral-800/30';
  const shellGlow = colorMap.glow ?? '';
  const shellRing = colorMap.ring ?? 'ring-white/10';

  const calculateConfidence = () => {
    let confidenceIntent: IntentTypes = IntentTypes.Error;
    let rangeMin = 0;
    let rangeMax = 1;

    if (confidence >= 0.9) {
      confidenceIntent = IntentTypes.Primary;
      rangeMin = 0.9;
      rangeMax = 1;
    } else if (confidence >= 0.8) {
      confidenceIntent = IntentTypes.Secondary;
      rangeMin = 0.8;
      rangeMax = 0.9;
    } else if (confidence >= 0.7) {
      confidenceIntent = IntentTypes.Tertiary;
      rangeMin = 0.7;
      rangeMax = 0.8;
    } else if (confidence >= 0.5) {
      confidenceIntent = IntentTypes.Warning;
      rangeMin = 0.5;
      rangeMax = 0.7;
    } else {
      confidenceIntent = IntentTypes.Error;
      rangeMin = 0;
      rangeMax = 0.5;
    }

    const tierProgress = (confidence - rangeMin) / (rangeMax - rangeMin);
    const confidenceLevel: 'high' | 'mid' | 'low' | undefined =
      tierProgress >= 0.75
        ? undefined
        : tierProgress >= 0.5
        ? 'high'
        : tierProgress >= 0.25
        ? 'mid'
        : 'low';

    return { confidenceIntent, confidenceLevel };
  };

  const buildConfidenceClasses = (): string => {
    const { confidenceIntent, confidenceLevel } = calculateConfidence();
    const confidenceStyles = getIntentStyles(confidenceIntent);

    return !confidenceLevel
      ? confidenceStyles.background
      : confidenceStyles.pulse[confidenceLevel];
  };

  const confidenceClasses = buildConfidenceClasses();

  // ✅ Outer border (outer visual box)
  return (
    <div
      class={`rounded border ${shellBorder} ${shellBackground} ${shellGlow} transition-colors`}
    >
      <details class={``}>
        <summary
          class={`px-3 py-2 flex items-center justify-between cursor-pointer list-none focus:outline-none focus-visible:ring-2 ${shellRing}`}
        >
          <div class="flex items-center gap-2">
            <span class={`w-2 h-2 rounded-full ${confidenceClasses}`} />
            <span class={`text-[10px] tracking-widest uppercase ${shellText}`}>
              {name}
            </span>
          </div>
          <span class={`text-[10px] ${shellText}`}>{timestamp}</span>
        </summary>

        <div class={`px-3 pb-3 mt-1 border-b border-t ${shellBorder} pt-2`}>
          {children && (
            <div class={`px-3 pb-1 ${shellText} text-[12px] italic`}>
              {children}
            </div>
          )}
        </div>

        <details class={`px-3 pb-3 pt-2 text-[10px] ${shellText}`}>
          <summary class={`${shellText} underline cursor-pointer`}>
            Full Payload -
            {Object.entries(payload)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}
          </summary>

          <pre
            class={`mt-1 whitespace-pre-wrap break-words text-[10px] inset ${shellText}`}
          >
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>
      </details>
    </div>
  );
}

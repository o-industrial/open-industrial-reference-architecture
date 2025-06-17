import { IntentTypes, JSX } from '../.deps.ts';
import { AziToolResponseCard } from '../molecules/AziToolResponseCard.tsx';
import AziRespondsPanelTemplate from '../templates/AziRespondsPanelTemplate.tsx';

type AziRespondsPanelProps = {
  onClose?: () => void;
};

export function AziRespondsPanel({
  onClose,
}: AziRespondsPanelProps): JSX.Element {
  // Mocked visual responses for sim
  const visualResponses = [
    {
      title: 'Humidity Variability Detected',
      timestamp: '2025-05-09T14:32:10Z',
      description: 'Humidity levels in lab-sim-1 show high deviation over 10s.',
      sourcePrompt: 'What’s changing most frequently?',
      intentType: IntentTypes.Warning,
      visualElement: (
        <div class="w-full h-32 rounded bg-gradient-to-r from-yellow-500/10 via-yellow-300/10 to-transparent border border-yellow-600 p-2 text-yellow-200 text-[10px]">
          📈 Humidity Spike Graph Placeholder
        </div>
      ),
    },
    {
      title: 'Possible Status Code Field: aqi',
      timestamp: '2025-05-09T14:32:35Z',
      description:
        'Field `aqi` fluctuates within discrete, tiered ranges. Might encode state.',
      sourcePrompt: 'Which field looks like a status code?',
      intentType: IntentTypes.Tertiary,
      visualElement: (
        <div class="w-full h-32 rounded bg-gradient-to-r from-cyan-400/10 via-cyan-300/10 to-transparent border border-cyan-600 p-2 text-cyan-300 text-[10px]">
          🧠 Pattern Detection Overlay (AQI Histogram Placeholder)
        </div>
      ),
    },
  ];

  return (
    <AziRespondsPanelTemplate onClose={onClose}>
      <div class="flex flex-col gap-4 p-4 text-xs text-neutral-300 font-sans">
        {visualResponses.map((response, idx) => (
          <AziToolResponseCard
            key={idx}
            title={response.title}
            timestamp={response.timestamp}
            description={response.description}
            content={response.visualElement}
            intent={response.intentType}
            sourcePrompt={response.sourcePrompt}
          />
        ))}
      </div>
    </AziRespondsPanelTemplate>
  );
}

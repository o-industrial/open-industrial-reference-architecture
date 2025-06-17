import { IntentTypes, JSX, classSet } from '../.deps.ts';
import { getIntentStyles } from '../.exports.ts';

export type AziToolResponseCardProps = {
  title: string;
  timestamp: string;
  description?: string;
  sourcePrompt?: string;
  intent?: IntentTypes;
  content: preact.ComponentChildren;
};

export function AziToolResponseCard({
  title,
  timestamp,
  description,
  sourcePrompt,
  intent = IntentTypes.Info,
  content,
}: AziToolResponseCardProps): JSX.Element {
  const { border } = getIntentStyles(intent);

  return (
    <div class={classSet(['rounded border shadow-sm p-4', border])}>
      <div class='text-[11px] font-semibold mb-1'>{title}</div>
      {description && (
        <div class='text-[10px] text-neutral-400 mb-2 italic'>
          {description}
        </div>
      )}
      {sourcePrompt && (
        <div class='text-[10px] text-neutral-500 mb-2'>
          <span class='text-neutral-600'>Prompt:</span> “{sourcePrompt}”
        </div>
      )}
      <div class='mt-2'>{content}</div>
      <div class='mt-1 text-[9px] text-right text-neutral-600'>
        {new Date(timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

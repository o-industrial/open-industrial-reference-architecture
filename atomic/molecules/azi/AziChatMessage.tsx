import {
  JSX,
  ComponentChildren,
  classSet,
  IntentTypes,
  BaseMessage,
} from '../../.deps.ts';
import { Badge } from '../../.exports.ts';

export type AziChatMessageProps = {
  align?: 'left' | 'right';
  content: string;
  badge: ComponentChildren;
  intentType?: IntentTypes;
  inline?: boolean;
  renderMessage?: (message: string) => string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AziChatMessage({
  align = 'left',
  content,
  badge,
  intentType = IntentTypes.Info,
  inline = false,
  renderMessage,
  ...rest
}: AziChatMessageProps): JSX.Element {
  const isRight = align === 'right';

  const bubbleColorMap: Record<IntentTypes, string> = {
    [IntentTypes.Primary]: 'bg-neon-violet-900 border-neon-violet-500',
    [IntentTypes.Secondary]: 'bg-neon-indigo-900 border-neon-indigo-500',
    [IntentTypes.Tertiary]: 'bg-neon-blue-900 border-neon-blue-500',
    [IntentTypes.Info]: 'bg-neon-cyan-900 border-neon-cyan-500',
    [IntentTypes.Warning]: 'bg-neon-yellow-900 border-neon-yellow-500',
    [IntentTypes.Error]: 'bg-neon-red-900 border-neon-red-500',
    [IntentTypes.None]: 'bg-neutral-800 border-neutral-700',
  };

  const bubbleClass =
    bubbleColorMap[intentType] ?? bubbleColorMap[IntentTypes.Info];
  const rootAlign = isRight ? 'justify-end' : 'justify-start';
  const containerAlign = isRight ? 'items-end' : 'items-start';
  const rowDirection = isRight ? 'flex-row-reverse' : 'flex-row';

  const rendered = renderMessage ? renderMessage(content) : content;

  return (
    <div {...rest} class={classSet(['flex', rootAlign], rest)}>
      {inline ? (
        <div
          class={`flex ${rowDirection} items-center gap-2 max-w-[80%] overflow-hidden`}
          // style="overflow-wrap: break-word; word-break: break-word;"
        >
          <Badge intentType={intentType}>{badge}</Badge>
          <div
            class={`border rounded px-3 py-2 text-sm ${bubbleClass} overflow-auto`}
            dangerouslySetInnerHTML={{ __html: rendered }}
          ></div>
        </div>
      ) : (
        <div
          class={`flex flex-col ${containerAlign} max-w-[80%] overflow-hidden`}
          // style="overflow-wrap: break-word; word-break: break-word;"
        >
          <Badge intentType={intentType} class="mb-1">
            {badge}
          </Badge>
          <div
            class={`border rounded px-3 py-2 text-sm ${bubbleClass} overflow-auto`}
            dangerouslySetInnerHTML={{ __html: rendered }}
          ></div>
        </div>
      )}
    </div>
  );
}

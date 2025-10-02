import { IntentTypes, JSX, useState, useRef, useEffect } from '../../.deps.ts';
import { SendIcon, EmptyIcon, Input, Action, ActionStyleTypes } from '../../.exports.ts';

export type AziChatInputProps = {
  placeholder?: string;
  onSend: (message: string, extraInputs?: Record<string, unknown>) => Promise<void>; // ✅ now async
  disabled?: boolean;
  inputIntentType?: IntentTypes;
  actionIntentType?: IntentTypes;
  sendIcon?: JSX.Element;
  resetIcon?: JSX.Element;
  maxHeight?: number; // in pixels
  extraInputs?: Record<string, unknown>;
  onReset?: () => void | Promise<void>;
};

export function AziChatInput({
  placeholder = 'Ask Azi something...',
  onSend,
  disabled = false,
  inputIntentType = IntentTypes.None,
  actionIntentType = IntentTypes.Primary,
  sendIcon = <SendIcon class="w-5 h-5" />,
  resetIcon = <EmptyIcon class="w-5 h-5" />,
  maxHeight = 50,
  extraInputs = {},
  onReset
}: AziChatInputProps): JSX.Element {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';

    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'scroll' : 'hidden';
  };

  const handleInput = (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => {
    const value = e.currentTarget.value;
    setInput(value);
  };
  
  const sendNow = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed, extraInputs);
      setInput('');
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = async (
    e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await sendNow();
    }
  };

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendNow();
  };

  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const isDisabled = disabled || sending;

  return (
    <form onSubmit={handleSubmit} class="flex gap-2 w-full">
      <Input
        ref={textareaRef}
        multiline
        rows={1}
        value={input}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        intentType={inputIntentType}
        class="flex-grow resize-none overflow-hidden"
      />

      <div class="flex items-stretch gap-1">
        <Action
          type="submit"
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
          intentType={actionIntentType}
          disabled={isDisabled}
          class="text-xs px-3"
          title="Send"
        >
          {sendIcon}
        </Action>

        {onReset && (
          <Action
            type="button"
            onClick={() => {
              if (isDisabled) return;
              const result = onReset();
              if (result && typeof (result as Promise<void>).then === 'function') {
                (result as Promise<void>).catch(() => {});
              }
            }}
            styleType={ActionStyleTypes.Outline | ActionStyleTypes.Thin}
            intentType={IntentTypes.Secondary}
            disabled={isDisabled}
            class="text-xs px-3"
            title="Reset"
          >
            {resetIcon}
          </Action>
        )}
      </div>
    </form>
  );
}

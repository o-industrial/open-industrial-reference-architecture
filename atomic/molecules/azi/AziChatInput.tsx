import { IntentTypes, JSX, useState, useRef, useEffect } from '../../.deps.ts';
import { SendIcon, Input, Action, ActionStyleTypes } from '../../.exports.ts';

export type AziChatInputProps = {
  placeholder?: string;
  onSend: (message: string) => Promise<void>; // ✅ now async
  disabled?: boolean;
  inputIntentType?: IntentTypes;
  actionIntentType?: IntentTypes;
  sendIcon?: JSX.Element;
  maxHeight?: number; // in pixels
};

export function AziChatInput({
  placeholder = 'Ask Azi something...',
  onSend,
  disabled = false,
  inputIntentType = IntentTypes.None,
  actionIntentType = IntentTypes.Primary,
  sendIcon = <SendIcon class="w-5 h-5" />,
  maxHeight = 200,
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
    

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setInput('');
    } finally {
      setSending(false);
    }
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
        placeholder={placeholder}
        disabled={isDisabled}
        intentType={inputIntentType}
        class="flex-grow resize-none overflow-hidden"
      />

      <Action
        type="submit"
        styleType={ActionStyleTypes.Solid | ActionStyleTypes.Thin}
        intentType={actionIntentType}
        disabled={isDisabled}
        class="text-xs"
      >
        {sendIcon}
      </Action>
    </form>
  );
}

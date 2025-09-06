import { JSX, IntentTypes } from '../.deps.ts';
import { Input } from './forms/Input.tsx';
import { Action, ActionStyleTypes } from './Action.tsx';

export interface StringArrayEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function StringArrayEditor({
  items,
  onChange,
  label,
  placeholder,
}: StringArrayEditorProps): JSX.Element {
  const update = (idx: number, value: string) => {
    const list = [...items];
    list[idx] = value;
    onChange(list);
  };

  const remove = (idx: number) => {
    const list = items.filter((_, i) => i !== idx);
    onChange(list);
  };

  const add = () => {
    onChange([...items, '']);
  };

  return (
    <div class="space-y-2">
      {label && (
        <label class="block text-xs font-semibold text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <ul class="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} class="flex items-center gap-2">
            <Input
              value={item}
              placeholder={placeholder}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                update(idx, e.currentTarget.value)
              }
            />
            <Action
              type="button"
              intentType={IntentTypes.Error}
              styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
              onClick={() => remove(idx)}
            >
              Remove
            </Action>
          </li>
        ))}
      </ul>
      <Action
        type="button"
        intentType={IntentTypes.Primary}
        styleType={ActionStyleTypes.Link | ActionStyleTypes.Thin}
        onClick={add}
      >
        Add
      </Action>
    </div>
  );
}

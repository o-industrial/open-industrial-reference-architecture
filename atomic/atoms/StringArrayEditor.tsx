import { JSX } from '../.deps.ts';

export interface StringArrayEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function StringArrayEditor(
  { items, onChange, label, placeholder }: StringArrayEditorProps,
): JSX.Element {
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
    <div class='-:-:space-y-2'>
      {label && <h4 class='-:-:font-semibold'>{label}</h4>}
      <ul class='-:-:space-y-2'>
        {items.map((item, idx) => (
          <li key={idx} class='-:-:flex -:-:items-center -:-:space-x-2'>
            <input
              class='-:-:flex-1 -:-:p-2 -:-:rounded -:-:bg-slate-800'
              value={item}
              placeholder={placeholder}
              onInput={(e) => update(idx, (e.target as HTMLInputElement).value)}
            />
            <button
              type='button'
              class='-:-:text-red-400'
              onClick={() => remove(idx)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type='button' class='-:-:text-blue-400' onClick={add}>
        Add
      </button>
    </div>
  );
}

import { classSet, JSX } from '../.deps.ts';
import { Input, InputProps } from './forms/Input.tsx';

export type SearchInputProps = InputProps;

/**
 * A lightweight search input component for filtering lists.
 */
export function SearchInput({ ...props }: SearchInputProps): JSX.Element {
  return (
    <Input
      {...(props as any)}
      class={classSet(
        [
          '-:-:w-full -:-:px-3 -:-:py-2 -:-:border -:-:border-slate-600 -:-:bg-slate-800 -:-:text-white -:-:rounded-md focus:-:-:outline-none focus:-:-:ring-2 focus:-:-:ring-cyan-500',
        ],
        props
      )}
    />
  );
}

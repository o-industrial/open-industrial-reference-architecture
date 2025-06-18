import { JSX } from '../../.deps.ts';

export function GlossaryTerm({
  term,
  description,
}: {
  term: string;
  description: string;
}): JSX.Element {
  return (
    <abbr
      title={description}
      class="border-b border-dotted cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue-400 transition-colors text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
      tabIndex={0}
    >
      {term}
    </abbr>
  );
}

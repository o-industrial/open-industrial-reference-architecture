
import { JSX, classSet } from '../.deps.ts';
import { AgreementCheckbox } from '../atoms/AgreementCheckbox.tsx';

export type AgreementCardProps = {
  title: string;
  abstract: string;
  documentLink: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AgreementCard({
  title,
  abstract,
  documentLink,
  checked,
  onCheckedChange,
  class: className,
  ...rest
}: AgreementCardProps): JSX.Element {
  return (
    <div
      class={classSet(
        [
          'border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 bg-white dark:bg-neutral-950 shadow-md flex flex-col gap-4',
        ],
        { class: className },
      )}
      {...rest}
    >
      <div>
        <h3 class='text-lg font-bold text-neutral-800 dark:text-white'>{title}</h3>
        <p class='mt-2 text-neutral-600 dark:text-neutral-400 text-sm'>{abstract}</p>
        <a
          href={documentLink}
          target='_blank'
          rel='noopener noreferrer'
          class='mt-2 inline-block text-neon-cyan-400 hover:underline text-sm'
        >
          View Full Document
        </a>
      </div>

      <AgreementCheckbox
        label='I have read and agree to these terms'
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

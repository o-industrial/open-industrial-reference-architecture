import {
  EaCStatus,
  EaCStatusProcessingTypes,
  IntentTypes,
  JSX,
  classSet,
  useState,
} from '../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  CloseIcon,
  CommitIcon,
  ExpandIcon,
} from '../.exports.ts';

type CommitStatusPanelProps = {
  commits: EaCStatus[];
  selectedCommitId?: string;
  onSelectCommit: (id: string) => void;
  onClose: () => void;
};

function classyPrint(value: unknown): JSX.Element {
  if (value === null) {
    return <span class="text-neutral-400">null</span>;
  }

  if (Array.isArray(value)) {
    return (
      <ul class="pl-4 space-y-1 list-disc">
        {value.map((v, i) => (
          <li key={i}>{classyPrint(v)}</li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    return (
      <ul class="pl-4 space-y-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <li key={k}>
            <span class="text-neutral-400">{k}: </span>
            {classyPrint(v)}
          </li>
        ))}
      </ul>
    );
  }

  return <span class="text-neutral-300">{String(value)}</span>;
}

export function CommitStatusPanel({
  commits,
  selectedCommitId,
  onSelectCommit,
  onClose,
}: CommitStatusPanelProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...commits].sort((a, b) => {
    const aDate = (a as any).Created ?? (a as any).Timestamp ?? 0;
    const bDate = (b as any).Created ?? (b as any).Timestamp ?? 0;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const statusColor = (processing: EaCStatusProcessingTypes): string => {
    switch (processing) {
      case EaCStatusProcessingTypes.COMPLETE:
        return 'text-green-500';
      case EaCStatusProcessingTypes.ERROR:
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <aside
      class={classSet([
        'flex flex-col h-full bg-neutral-900 border-l border-neutral-800',
        expanded ? 'w-[32rem]' : 'w-80',
      ])}
    >
      <header class="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <h2 class="text-sm font-semibold tracking-wide text-white uppercase">
          Commits
        </h2>
        <div class="flex gap-2">
          <Action
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            title={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <ExpandIcon
              class={classSet([
                'w-5 h-5 transition-transform',
                expanded ? 'rotate-180' : '',
              ])}
            />
          </Action>
          <Action
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            title="Close"
            onClick={onClose}
          >
            <CloseIcon class="w-5 h-5" />
          </Action>
        </div>
      </header>

      <ul class="flex-1 overflow-y-auto divide-y divide-neutral-800">
        {sorted.map((commit) => {
          const isSelected = commit.ID === selectedCommitId;

          return (
            <li key={commit.ID} class="text-xs text-white">
              <div
                class={classSet([
                  'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-neutral-800',
                  isSelected ? 'bg-neutral-800' : '',
                ])}
                onClick={() => onSelectCommit(commit.ID)}
              >
                <CommitIcon
                  class={classSet(['w-4 h-4', statusColor(commit.Processing)])}
                />
                <span class="font-mono truncate">{commit.ID}</span>
              </div>
              {isSelected && (
                <div class="px-6 pb-2 text-neutral-300">
                  {classyPrint(commit)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

import { classSet, IntentTypes, JSX, useState } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../.exports.ts';

export type TabDefinition = {
  key: string;
  label: string;
  content: JSX.Element;
};

export type TabbedPanelProps = {
  tabs: TabDefinition[];
  initialTab?: string;
  scrollableContent?: boolean;
  stickyTabs?: boolean;
  direction?: 'horizontal' | 'vertical'; // 🔄 NEW
} & JSX.HTMLAttributes<HTMLDivElement>;

export function TabbedPanel({
  tabs,
  initialTab,
  scrollableContent,
  stickyTabs,
  direction = 'horizontal',
  ...props
}: TabbedPanelProps): JSX.Element {
  const [selected, setSelected] = useState<string>(
    initialTab ?? tabs[0]?.key ?? ''
  );

  const activeTab = tabs.find((t) => t.key === selected);

  const vertical = direction === 'vertical';

  return (
    <div
      {...props}
      class={classSet(
        [
          'w-full',
          vertical ? 'flex h-full' : '',
          scrollableContent && !vertical ? 'overflow-hidden' : '',
          stickyTabs && !vertical ? 'h-full' : '',
        ],
        props
      )}
    >
      {/* Tabs */}
      <div
        class={classSet([
          vertical
            ? 'w-64 border-r border-neutral-700 pr-4 space-y-1 text-sm'
            : 'overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent',
          stickyTabs && !vertical ? 'sticky top-0 z-10 bg-neutral-900' : '',
        ])}
      >
        <div
          class={classSet([
            vertical
              ? ''
              : 'inline-flex space-x-2 border-b border-neutral-700 mb-3 whitespace-nowrap min-w-full',
          ])}
        >
          {tabs.map((tab) => (
            <Action
              key={tab.key}
              onClick={() => setSelected(tab.key)}
              styleType={
                vertical ? ActionStyleTypes.Fat : ActionStyleTypes.Thin
              }
              intentType={
                selected === tab.key ? IntentTypes.Info : IntentTypes.None
              }
              class={classSet([
                `rounded-t-md border-b-2`,
                selected === tab.key
                  ? 'border-neon-cyan-400'
                  : 'border-transparent hover:border-neutral-500',
                vertical
                  ? 'items-start justify-start text-left m-auto w-full'
                  : '',
              ])}
            >
              {tab.label}
            </Action>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        class={classSet([
          vertical ? 'flex-1 pl-4 overflow-y-auto' : '',
          scrollableContent && !vertical ? 'overflow-y-auto' : '',
        ])}
      >
        {activeTab?.content}
      </div>
    </div>
  );
}

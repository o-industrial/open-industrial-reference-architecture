import { classSet, IntentTypes, JSX, useEffect, useState } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../.exports.ts';

export type TabDefinition = {
  key: string;
  label: string;
  icon?: JSX.Element; // 🔹 Optional icon support
  content: JSX.Element;
};

export type TabbedPanelProps = {
  tabs: TabDefinition[];
  initialTab?: string; // 🔹 Legacy support
  activeTab?: string; // 🔹 Controlled tab switching
  scrollableContent?: boolean;
  stickyTabs?: boolean;
  direction?: 'horizontal' | 'vertical';
  onTabChange?: (key: string) => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function TabbedPanel({
  tabs,
  initialTab,
  activeTab,
  scrollableContent,
  stickyTabs,
  direction = 'horizontal',
  ...props
}: TabbedPanelProps): JSX.Element {
  const isControlled = activeTab !== undefined;

  const [selected, setSelected] = useState<string>(
    initialTab ?? tabs[0]?.key ?? '',
  );

  // 🔹 Sync internal state with external activeTab prop
  useEffect(() => {
    if (isControlled) setSelected(activeTab!);
  }, [activeTab]);

  const activeTabObj = tabs.find((t) => t.key === selected);
  const vertical = direction === 'vertical';

  return (
    <div
      {...props}
      class={classSet(
        [
          'w-full',
          vertical ? 'flex h-full' : '',
          scrollableContent && !vertical ? 'overflow-hidden' : '',
          // When stickyTabs in horizontal mode, lock height and stack vertically
          stickyTabs && !vertical ? 'h-full flex flex-col min-h-0' : '',
        ],
        props,
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
              onClick={() => {
                setSelected(tab.key);
                props.onTabChange?.(tab.key);
              }}
              styleType={vertical ? ActionStyleTypes.Fat : ActionStyleTypes.Thin}
              intentType={selected === tab.key ? IntentTypes.Info : IntentTypes.None}
              class={classSet([
                `rounded-t-md border-b-2`,
                selected === tab.key
                  ? 'border-neon-cyan-400'
                  : 'border-transparent hover:border-neutral-500',
                vertical
                  ? 'items-start justify-start text-left m-auto w-full'
                  : 'flex items-center space-x-2',
              ])}
            >
              <div class='flex items-center gap-2'>
                {tab.icon && (
                  <span class='w-4 h-4 flex items-center justify-center text-inherit'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      class='w-4 h-4'
                    >
                      {tab.icon.props.children}
                    </svg>
                  </span>
                )}
                <span class='leading-none'>{tab.label}</span>
              </div>
            </Action>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        class={classSet([
          vertical ? 'flex-1 pl-4 overflow-y-auto' : '',
          // In horizontal + sticky, let content take remaining space.
          // Defer scrolling to inner tab content to avoid nested scroll height glitches.
          stickyTabs && !vertical ? 'flex-1 min-h-0 overflow-hidden' : '',
          // Otherwise, allow optional scrolling when requested
          !stickyTabs && scrollableContent && !vertical ? 'overflow-y-auto' : '',
        ])}
      >
        {activeTabObj?.content}
      </div>
    </div>
  );
}

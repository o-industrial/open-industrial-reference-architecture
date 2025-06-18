import { JSX, IntentTypes, classSet, BreadcrumbPart } from '../.deps.ts';
import {
  ActionProps,
  ActionStyleTypes,
  Action,
  SettingsIcon,
} from '../.exports.ts';

export type BreadcrumbBarProps = {
  pathParts: BreadcrumbPart<ActionProps>[];
  onSettingsClick?: () => void;
  settingsTitle?: string;
  settingsIntentType?: IntentTypes;
};

export function BreadcrumbBar({
  pathParts,
  onSettingsClick,
  settingsTitle = 'Workspace Settings',
  settingsIntentType = IntentTypes.Info,
}: BreadcrumbBarProps): JSX.Element {
  return (
    <div
      class={classSet([
        '-:w-full -:text-xs -:bg-neutral-900 -:tracking-wide -:font-light -:px-4 -:pt-1.5 -:pb-1',
        '-:flex -:items-center -:justify-between',
      ])}
    >
      <div class="-:truncate -:flex -:flex-wrap -:items-center">
        {pathParts.map((part, idx) => {
          const isLast = idx === pathParts.length - 1;
          const hasAction = part.onClick || part.href;

          const intent =
            part.intentType ??
            (isLast
              ? IntentTypes.None
              : hasAction
              ? IntentTypes.Info
              : IntentTypes.Tertiary);

          const styleType = hasAction
            ? part.styleType ?? ActionStyleTypes.Link
            : ActionStyleTypes.None;

          return (
            <span key={idx} class="-:flex -:items-center">
              <Action
                {...part}
                intentType={intent}
                styleType={styleType}
                class={classSet(
                  [
                    '-:px-0 -:underline-offset-2 -:hover:no-underline',
                    hasAction ? '' : 'pointer-events-none',
                  ],
                  part
                )}
              >
                {part.label}
              </Action>

              {!isLast && <span class="-:text-neutral-600">/</span>}
            </span>
          );
        })}
      </div>

      {onSettingsClick && (
        <Action
          title={settingsTitle}
          onClick={onSettingsClick}
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={settingsIntentType}
        >
          <SettingsIcon class="w-4 h-4" />
        </Action>
      )}
    </div>
  );
}

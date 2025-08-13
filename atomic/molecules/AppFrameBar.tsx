import { SettingsIcon } from '../../build/iconset/icons/SettingsIcon.tsx';
import { UsersIcon } from '../../build/iconset/icons/UsersIcon.tsx';
import { CommitIcon } from '../../build/iconset/icons/CommitIcon.tsx';
import { JSX, classSet, IntentTypes } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';
import { MenuActionItem, MenuRoot } from './FlyoutMenu.tsx';
import { MenuBar } from './MenuBar.tsx';

export type AppFrameBarProps = {
  menus: MenuRoot[];
  onMenuOption: (item: MenuActionItem) => void;
  onActivateClick?: () => void;
  onCommitClick: () => void;
  commitBadgeState?: CommitBadgeState;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  profileIntentType?: IntentTypes;
};

export type CommitBadgeState = 'error' | 'processing' | 'success';

export function AppFrameBar({
  menus,
  onMenuOption,
  onActivateClick,
  onCommitClick,
  commitBadgeState,
  onProfileClick,
  onSettingsClick,
  profileIntentType = IntentTypes.Info,
}: AppFrameBarProps): JSX.Element {
  return (
    <div
      class={classSet([
        '-:flex -:items-center -:gap-4 -:text-sm -:text-neutral-300',
        '-:w-full -:h-full -:px-4',
      ])}
    >
      {/* 🔷 Logo & Brand */}
      <img
        src="/assets/favicon.ico"
        alt="Open Industrial"
        data-eac-bypass
        class="-:h-6 -:w-6"
      />

      {/* <span class="-:font-semibold">Open Industrial</span>
      <span class="-:text-xs -:text-neutral-500">runtime</span> */}

      {/* 🧭 Menu Bar (File | View | …) */}
      <MenuBar menus={menus} onMenuOption={onMenuOption} />

      {/* ➡️ Right-aligned Profile Button */}
      <div class="-:ml-auto -:flex -:items-center -:gap-2">
        {onActivateClick && (
          <Action
            title="3 Days to Activate Workspace"
            onClick={onActivateClick}
            styleType={ActionStyleTypes.Outline | ActionStyleTypes.Thin}
            intentType={IntentTypes.Warning}
          >
            3 Days to Activate Workspace
          </Action>
        )}

        {onSettingsClick && (
          <Action
            title="Workspace Settings"
            onClick={onSettingsClick}
            styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
            intentType={IntentTypes.Info}
          >
            <SettingsIcon class="w-4 h-4" />
          </Action>
        )}

        <Action
          title="Commit Workspace"
          onClick={onCommitClick}
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={
            commitBadgeState === 'error'
              ? IntentTypes.Error
              : commitBadgeState === 'processing'
              ? IntentTypes.Info
              : commitBadgeState === 'success'
              ? IntentTypes.Secondary
              : IntentTypes.None
          }
        >
          <span class="-:relative -:block">
            <CommitIcon class="-:w-4 -:h-4" />
            {commitBadgeState === 'error' && (
              <span class="-:absolute -:top-0 -:right-0 -:w-2 -:h-2 -:rounded-full -:bg-neon-red-500 -:translate-x-1/2 -:-translate-y-1/2" />
            )}
            {commitBadgeState === 'processing' && (
              <span class="-:absolute -:top-0 -:right-0 -:w-2 -:h-2 -:rounded-full -:border-2 -:border-neon-blue-500 -:border-t-transparent -:animate-spin -:translate-x-1/2 -:-translate-y-1/2" />
            )}
            {commitBadgeState === 'success' && (
              <span class="-:absolute -:top-0 -:right-0 -:text-green-500 -:text-[10px] -:translate-x-1/2 -:-translate-y-1/2">
                ✓
              </span>
            )}
          </span>
        </Action>

        {onProfileClick && (
          <Action
            title="Manage Profile"
            onClick={onProfileClick}
            styleType={ActionStyleTypes.Link}
            intentType={profileIntentType}
          >
            <UsersIcon class="h-6 w-6" />
          </Action>
        )}
      </div>
    </div>
  );
}

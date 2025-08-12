import { GitCommitIcon } from '../../build/iconset/icons/GitCommitIcon.tsx';
import { SettingsIcon } from '../../build/iconset/icons/SettingsIcon.tsx';
import { UsersIcon } from '../../build/iconset/icons/UsersIcon.tsx';
import { JSX, classSet, IntentTypes } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';
import { MenuActionItem, MenuRoot } from './FlyoutMenu.tsx';
import { MenuBar } from './MenuBar.tsx';

export type AppFrameBarProps = {
  menus: MenuRoot[];
  onMenuOption: (item: MenuActionItem) => void;
  onActivateClick?: () => void;
  onCommitClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  profileIntentType?: IntentTypes;
};

export function AppFrameBar({
  menus,
  onMenuOption,
  onActivateClick,
  onCommitClick,
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

        {onCommitClick && (
          <Action
            title="Commit Workspace"
            onClick={onCommitClick}
            styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
            intentType={IntentTypes.Primary}
          >
            <GitCommitIcon class="w-4 h-4" />
          </Action>
        )}

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

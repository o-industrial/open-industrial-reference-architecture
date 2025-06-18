import { IntentTypes, JSX } from '../../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  SaveIcon,
  ForkIcon,
  RevertIcon,
  UndoIcon,
  RedoIcon,
} from '../../.exports.ts';

export type ManagementControlsProps = {
  hasChanges?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onCommit?: () => void;
  onRevert?: () => void;
  onFork?: () => void;

  commitIntent?: IntentTypes;
  undoIntent?: IntentTypes;
  redoIntent?: IntentTypes;
  revertIntent?: IntentTypes;
  forkIntent?: IntentTypes;
};

export function ManagementControls({
  hasChanges = false,
  onUndo,
  onRedo,
  onCommit,
  onRevert,
  onFork,
  commitIntent,
  undoIntent = IntentTypes.Info,
  redoIntent = IntentTypes.Info,
  revertIntent = IntentTypes.Warning,
  forkIntent = IntentTypes.Tertiary,
}: ManagementControlsProps): JSX.Element {
  const effectiveCommitIntent =
    commitIntent ?? (hasChanges ? IntentTypes.Primary : IntentTypes.Secondary);

  return (
    <div class="group relative flex flex-row-reverse items-center bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-md shadow-sm overflow-hidden transition-all duration-300">
      {/* Commit Button stays pinned right */}
      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={effectiveCommitIntent}
        onClick={onCommit}
        title="Commit Changes"
        disabled={!onCommit}
        class="z-10"
      >
        <SaveIcon class="w-6 h-6" />
      </Action>

      {/* Expandable tools on the left */}
      <div
        class="flex flex-row gap-2 items-center 
               max-w-0 group-hover:max-w-[300px] 
               opacity-0 group-hover:opacity-100 
               transition-all duration-300 overflow-hidden"
      >
        <Action
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={forkIntent}
          onClick={onFork}
          title="Fork Runtime"
          disabled={!onFork}
        >
          <ForkIcon class="w-6 h-6" />
        </Action>

        <Action
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={revertIntent}
          onClick={onRevert}
          title="Revert to Last Commit"
          disabled={!onRevert}
          // class="hidden" // TODO(AI): Re-enable once we actually put some time into getting this working
        >
          <RevertIcon class="w-6 h-6" />
        </Action>

        <Action
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={undoIntent}
          onClick={onUndo}
          title="Undo"
          disabled={!onUndo}
          // class="hidden" // TODO(AI): Re-enable once we actually put some time into getting this working
        >
          <UndoIcon class="w-6 h-6" />
        </Action>

        <Action
          styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
          intentType={redoIntent}
          onClick={onRedo}
          title="Redo"
          disabled={!onRedo}
          // class="hidden" // TODO(AI): Re-enable once we actually put some time into getting this working
        >
          <RedoIcon class="w-6 h-6" />
        </Action>
      </div>
    </div>
  );
}

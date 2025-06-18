import { JSX, NodePreset } from '../../.deps.ts';
import { NodePresetItem } from '../NodePresetItem.tsx';

/**
 * FlowPanelBank
 *
 * Displays a bank of draggable node presets (connection, surface, etc.).
 */
export type FlowPanelBankProps = {
  presets: Record<string, NodePreset>;
};

export function FlowPanelBank({ presets }: FlowPanelBankProps): JSX.Element {
  return (
    <div class="flex flex-col items-center gap-2">
      {Object.entries(presets).map(([key, preset]) => (
        <NodePresetItem
          key={key}
          label={preset.Label}
          iconKey={preset.IconKey}
          intent={preset.Intent}
          type={preset.Type}
        />
      ))}
    </div>
  );
}

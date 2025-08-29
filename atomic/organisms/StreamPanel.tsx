import { EverythingAsCodeOIWorkspace } from '../../src/eac/EverythingAsCodeOIWorkspace.ts';
import { RuntimeImpulseSources } from '../../src/types/RuntimeImpulse.ts';
import { JSX, WorkspaceManager } from '../.deps.ts';
import { ImpulseEntry } from '../molecules/flows/ImpulseEntry.tsx';
import { StreamPanelTemplate } from '../templates/StreamPanelTemplate.tsx';
import { IntentStyleMap } from '../utils/getIntentStyles.ts';

type StreamPanelProps = {
  workspaceMgr: WorkspaceManager;
};

export function StreamPanel({ workspaceMgr }: StreamPanelProps): JSX.Element {
  const { impulses, impulseSourceColorMap } = workspaceMgr.UseImpulseStream();

  const eac: EverythingAsCodeOIWorkspace = workspaceMgr.UseEaC();

  return (
    <StreamPanelTemplate>
      <div class="flex flex-col gap-3 text-xs text-neutral-300 font-mono">
        <div class="text-center text-sm text-neutral-600 my-3 italic">
          Waiting for next impulse...
        </div>

        {impulses
          .slice()
          .reverse()
          .map((imp) => (
            <ImpulseEntry
              impulse={imp}
              eac={eac}
              colorMap={impulseSourceColorMap[imp.Source]}
              key={imp.ID}
            />
          ))}
      </div>
    </StreamPanelTemplate>
  );
}

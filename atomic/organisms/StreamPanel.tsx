import type { RuntimeImpulse } from '../../src/types/RuntimeImpulse.ts';
import { EverythingAsCodeOIWorkspace } from '../../src/eac/EverythingAsCodeOIWorkspace.ts';
import { JSX, useMemo, useState, WorkspaceManager } from '../.deps.ts';
import { ImpulseEntry } from '../molecules/flows/ImpulseEntry.tsx';
import { StreamPanelTemplate } from '../templates/StreamPanelTemplate.tsx';

type StreamPanelProps = {
  workspaceMgr: WorkspaceManager;
};

function resolveConnectionLookup(impulse: RuntimeImpulse): string | undefined {
  const meta = impulse.Metadata as Record<string, unknown> | undefined;
  if (!meta) return undefined;

  const direct = meta.ConnectionLookup;
  if (typeof direct === 'string') return direct;

  const scoped = (meta as { DataConnectionLookup?: string }).DataConnectionLookup;
  if (typeof scoped === 'string') return scoped;

  return undefined;
}

export function StreamPanel({ workspaceMgr }: StreamPanelProps): JSX.Element {
  const { impulses, impulseSourceColorMap } = workspaceMgr.UseImpulseStream();

  const eac: EverythingAsCodeOIWorkspace = workspaceMgr.UseEaC();

  const [connection, setConnection] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const connectionOptions = useMemo(() => {
    const globalConnections = Object.keys(eac.DataConnections ?? {});
    const surfaceConnections = Object.values(eac.Surfaces ?? {}).flatMap((surface) =>
      Object.keys((surface as { DataConnections?: Record<string, unknown> })?.DataConnections ?? {})
    );

    return Array.from(new Set([...globalConnections, ...surfaceConnections])).sort();
  }, [eac]);

  const filteredImpulses = useMemo(() => {
    const tokens = searchText
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean);

    return impulses.filter((impulse) => {
      const matchesConnection = (() => {
        if (!connection) return true;
        const lookup = resolveConnectionLookup(impulse);
        return lookup === connection;
      })();

      if (!matchesConnection) return false;
      if (tokens.length === 0) return true;

      const haystack = [
        impulse.Subject ?? '',
        impulse.Metadata ? JSON.stringify(impulse.Metadata) : '',
        impulse.Payload ? JSON.stringify(impulse.Payload) : '',
      ].join(' ').toLowerCase();

      return tokens.every((token) => haystack.includes(token));
    });
  }, [impulses, connection, searchText]);

  const hasImpulses = impulses.length > 0;

  return (
    <StreamPanelTemplate>
      <div class='sticky top-0 z-10 flex items-center gap-2 p-2 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur'>
        <select
          class='bg-neutral-900 text-neutral-200 text-xs px-2 py-1 rounded border border-neutral-700'
          value={connection}
          onChange={(event) => setConnection((event.target as HTMLSelectElement).value)}
        >
          <option value=''>All Connections</option>
          {connectionOptions.map((conn) => <option key={conn} value={conn}>{conn}</option>)}
        </select>

        <input
          type='text'
          value={searchText}
          onInput={(event) => setSearchText((event.target as HTMLInputElement).value)}
          placeholder='Filter text (subject / metadata / payload)'
          class='flex-1 bg-neutral-900 text-neutral-200 text-xs px-2 py-1 rounded border border-neutral-700'
        />
      </div>

      <div class='flex flex-col gap-3 text-xs text-neutral-300 px-4 my-2 font-mono'>
        {filteredImpulses.length === 0
          ? (
            <div class='text-center text-sm text-neutral-600 my-3 italic'>
              {hasImpulses
                ? 'No impulses match the current filters.'
                : 'Waiting for next impulse...'}
            </div>
          )
          : filteredImpulses.slice().reverse().map((impulse) => (
            <ImpulseEntry
              impulse={impulse}
              eac={eac}
              colorMap={impulseSourceColorMap[impulse.Source]}
              key={impulse.ID}
            />
          ))}
      </div>
    </StreamPanelTemplate>
  );
}



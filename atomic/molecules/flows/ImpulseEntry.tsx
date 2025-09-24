import { JSX } from '../../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../../src/eac/EverythingAsCodeOIWorkspace.ts';
import { RuntimeImpulse } from '../../../src/types/RuntimeImpulse.ts';
import {
  type ResolvedImpulseContext,
  resolveImpulseContext,
} from '../../../src/utils/resolveImpulseContext.ts';
import { ImpulseDetailTemplate } from './ImpulseDetailTemplate.tsx';
import { IntentStyleMap } from '../../utils/getIntentStyles.ts';

export function ImpulseEntry(props: {
  impulse: RuntimeImpulse;
  eac: EverythingAsCodeOIWorkspace;
  colorMap: IntentStyleMap;
}): JSX.Element {
  const { colorMap, impulse, eac } = props;

  const ctx = resolveImpulseContext(impulse, eac);

  const { Payload, Timestamp, Confidence } = impulse;
  const timestamp = new Date(Timestamp).toLocaleTimeString();

  let name = '(unnamed)';
  let contextLine: JSX.Element = <div>(unknown)</div>;

  if (ctx.Source === 'SurfaceAgent') {
    name = ctx.Agent?.Name ?? name;

    contextLine = (
      <div>
        <strong>Agent:</strong> {ctx.Agent?.Name ?? 'Unnamed Agent'} on schema{' '}
        {ctx.MatchedSchema?.Name ?? 'unknown'}
      </div>
    );
  }

  if (ctx.Source === 'SurfaceSchema') {
    name = ctx.Schema?.Name ?? name;

    contextLine = (
      <div>
        <strong>Schema:</strong> {ctx.Schema?.Name ?? 'Unnamed Schema'}
      </div>
    );
  }

  if (ctx.Source === 'SurfaceConnection' || ctx.Source === 'DataConnection') {
    name = ctx.Connection?.Name ?? name;

    contextLine = (
      <div>
        <strong>Connection:</strong> {ctx.Connection?.Name ?? 'Unnamed Connection'}
      </div>
    );
  }

  if (ctx.Source === 'SurfaceWarmQuery') {
    name = ctx.WarmQuery?.Name ?? name;

    contextLine = (
      <div>
        <strong>Query:</strong> {ctx.WarmQuery?.Name ?? 'Unnamed Query'}
      </div>
    );
  }

  if (ctx.Source === 'System') {
    name = ctx.EventType ?? name;

    contextLine = (
      <div>
        <strong>System Event:</strong> {ctx.EventType}
      </div>
    );
  }

  return (
    <ImpulseDetailTemplate
      name={name}
      timestamp={timestamp}
      payload={Payload}
      colorMap={colorMap}
      confidence={Confidence}
    >
      {contextLine}
    </ImpulseDetailTemplate>
  );
}

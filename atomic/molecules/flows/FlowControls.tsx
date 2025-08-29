import { IntentTypes, JSX, useReactFlow } from '../../.deps.ts';
import {
  Action,
  ActionStyleTypes,
  ZoomInIcon,
  ZoomOutIcon,
  FitViewIcon,
  ResetZoomIcon,
  MapPinnedIcon,
  MapIcon,
} from '../../.exports.ts';

export type FlowControlsProps = {
  zoomIntent?: IntentTypes;
  resetIntent?: IntentTypes;
  fitIntent?: IntentTypes;
  mapIntent?: IntentTypes;
  showMap?: boolean;
  onToggleMap?: (next: boolean) => void;
};

export function FlowControls({
  zoomIntent = IntentTypes.None,
  resetIntent = IntentTypes.None,
  fitIntent = IntentTypes.None,
  mapIntent = IntentTypes.Tertiary,
  showMap = false,
  onToggleMap,
}: FlowControlsProps): JSX.Element {
  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow();

  return (
    <div class="mt-2 flex flex-row items-center justify-center gap-2 px-2 py-1 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-md shadow-sm">
      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={zoomIntent}
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <ZoomInIcon class="w-6 h-6" />
      </Action>

      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={zoomIntent}
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <ZoomOutIcon class="w-6 h-6" />
      </Action>

      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={fitIntent}
        onClick={() => fitView()}
        title="Fit View"
      >
        <FitViewIcon class="w-6 h-6" />
      </Action>

      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={resetIntent}
        onClick={() => setViewport({ x: 0, y: 0, zoom: 1.2 })}
        title="Reset Zoom"
      >
        <ResetZoomIcon class="w-6 h-6" />
      </Action>

      <Action
        styleType={ActionStyleTypes.Icon | ActionStyleTypes.Thin}
        intentType={mapIntent}
        onClick={() => onToggleMap?.(!showMap)}
        title={showMap ? 'Hide Mini Map' : 'Show Mini Map'}
      >
        {showMap ? (
          <MapPinnedIcon class="w-6 h-6" />
        ) : (
          <MapIcon class="w-6 h-6" />
        )}
      </Action>
    </div>
  );
}

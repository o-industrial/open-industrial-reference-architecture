import { classSet, IntentTypes, JSX, MiniMap, Node } from '../../.deps.ts';
import { getIntentColor } from '../../.exports.ts';

type InteractiveMiniMapProps = {
  class?: string;
  maskColor?: string;
};

export function InteractiveMiniMap({
  class: additionalClass,
  maskColor = 'rgba(0,0,0,0.15)',
}: InteractiveMiniMapProps): JSX.Element {
  const nodeColor = (node: Node): string => {
    const status = node.data?.status;
    switch (status) {
      case 'error':
        return getIntentColor(IntentTypes.Error);
      case 'warning':
        return getIntentColor(IntentTypes.Warning);
      case 'info':
        return getIntentColor(IntentTypes.Info);
      default:
        return getIntentColor(IntentTypes.Tertiary);
    }
  };

  const nodeStrokeColor = (node: Node): string => {
    const intent = node.data?.intentType ?? IntentTypes.Info;
    return getIntentColor(intent);
  };

  return (
    <div
      class={classSet([
        'absolute bottom-[7.5rem] right-4 z-20 rounded-md overflow-hidden border border-neutral-700 bg-neutral-900/90 backdrop-blur-md shadow-lg',
        additionalClass,
      ])}
    >
      <MiniMap
        nodeColor={nodeColor}
        nodeStrokeColor={nodeStrokeColor}
        nodeBorderRadius={3}
        maskColor={maskColor}
        style={{
          height: '160px',
          width: '200px',
        }}
        className="-:!bg-neutral-800 -:!border-none"
      />
    </div>
  );
}

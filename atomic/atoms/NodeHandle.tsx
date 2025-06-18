import {
  Handle,
  HandleProps,
  IntentTypes,
  JSX,
  Position,
  classSet,
} from '../.deps.ts';

export type NodeHandleProps = Partial<HandleProps> & {
  intentType?: IntentTypes;
  position: Position;
  type: 'source' | 'target';
};

export default function NodeHandle({
  type,
  position,
  intentType = IntentTypes.Tertiary,
  isConnectable = true,
  ...rest
}: NodeHandleProps): JSX.Element {
  const baseClasses =
    'w-2 h-2 rounded-sm cursor-crosshair z-20 pointer-events-auto';

  const intentClasses = (() => {
    switch (intentType) {
      case IntentTypes.Primary:
        return 'bg-neon-violet-400';
      case IntentTypes.Secondary:
        return 'bg-neon-indigo-400';
      case IntentTypes.Tertiary:
        return 'bg-neon-blue-500';
      case IntentTypes.Warning:
        return 'bg-neon-yellow-400';
      case IntentTypes.Info:
        return 'bg-neon-cyan-400';
      case IntentTypes.Error:
        return 'bg-neon-red-500';
      default:
        return 'bg-white';
    }
  })();

  return (
    <Handle
      type={type}
      position={position}
      isConnectable={isConnectable}
      className={classSet([baseClasses, intentClasses])}
      {...rest}
    />
  );
}

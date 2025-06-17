import {
  classSet,
  ComponentChildren,
  IntentTypes,
  JSX,
  useEffect,
  useRef,
  useState,
} from '../../.deps.ts';
import {
  Icon,
  Action,
  ActionStyleTypes,
  CloseIcon,
  getIntentStyles,
} from '../../.exports.ts';

export type WorkspaceNodeState = 'default' | 'expanded';
export type WorkspaceNodeStatus = 'normal' | 'warning' | 'error' | 'proposal';

export type WorkspaceNodeRendererBaseProps = {
  iconKey?: string;
  label?: string;
  showLabel?: boolean;
  status?: WorkspaceNodeStatus;
  isSelected?: boolean;
  pulseIntent?: IntentTypes;
  pulseSpeed?: 'low' | 'mid' | 'high';

  outerClass?: string;
  class?: string;

  preMain?: ComponentChildren;
  preInner?: ComponentChildren;
  postInner?: ComponentChildren;
  postMain?: ComponentChildren;

  children?: ComponentChildren;
  enabled?: boolean;

  onDoubleClick?: () => void;
} & JSX.HTMLAttributes<HTMLDivElement>;

export default function WorkspaceNodeRendererBase({
  iconKey,
  label,
  showLabel = true,
  status = 'normal',
  isSelected,
  pulseIntent,
  pulseSpeed = 'mid',
  class: className,
  outerClass,
  preMain,
  preInner,
  postInner,
  postMain,
  children,
  enabled,
  onDoubleClick,
  ...props
}: WorkspaceNodeRendererBaseProps): JSX.Element {
  const [state, setState] = useState<WorkspaceNodeState>('default');
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeSize, setNodeSize] = useState({ width: 0, height: 0 });

  let clickTimer: number | null = null;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    } else {
      clickTimer = setTimeout(() => {
        setState('expanded');
        clickTimer = null;
      }, 250);
    }
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    onDoubleClick?.();
  };

  useEffect(() => {
    if (!nodeRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setNodeSize({ width, height });
    });

    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, []);

  const statiMap = {
    normal: {
      border: isSelected ? '-:border-indigo-700' : '-:border-neutral-700',
      background: isSelected ? '-:bg-indigo-300/30' : '-:bg-neutral-300/30',
    },
    warning: {
      border: '-:border-neon-yellow-700',
      background: '-:bg-neon-yellow-300/30',
    },
    error: {
      border: '-:border-neon-red-700',
      background: '-:bg-neon-red-300/30',
    },
    proposal: {
      border: '-:border-neon-cyan-700',
      background: '-:bg-neon-cyan-300/30',
    },
  };

  const statusMap = statiMap[status ?? 'normal'];
  const statusClasses = `${statusMap.border} ${statusMap.background}`;
  const isPill = state === 'default' && showLabel;

  return (
    <div
      class={classSet(
        [
          '-:relative -:flex -:flex-row -:items-center -:align-middle',
          !enabled ? 'opacity-40 pointer-events-none' : '',
        ],
        { class: outerClass }
      )}
      style={{ pointerEvents: 'auto', zIndex: 1 }}
      onClick={enabled === false ? undefined : handleClick}
      onDblClick={handleDoubleClick}
    >
      {enabled && preMain}

      <div
        ref={nodeRef}
        data-state={state}
        data-selected={isSelected}
        class={classSet(
          [
            '-:transition-all -:duration-300 -:ease-in-out',
            '-:relative -:rounded-full -:flex -:items-center -:justify-center',
            isPill
              ? '-:inline-flex -:px-3 -:h-14 -:max-w-xs'
              : state === 'default'
              ? '-:w-14 -:h-14'
              : '-:w-[250px] -:h-14',
            statusClasses,
          ],
          { class: className }
        )}
        {...props}
      >
        {enabled && preInner}

        <div
          class={classSet([
            'relative',
            state === 'expanded' ? 'w-full h-auto' : 'w-full h-full',
          ])}
        >
          <div
            class={classSet([
              '-:flex -:items-center -:justify-center',
              isPill ? 'w-full h-full' : 'pointer-events-none absolute',
              isPill
                ? ''
                : state === 'default'
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                : 'top-2 left-2',
            ])}
          >
            {iconKey && (
              <Icon
                icon={iconKey}
                src="/icons/iconset"
                class={classSet([
                  '-:transition-all -:duration-300 -:ease-in-out',
                  state === 'default' ? 'w-6 h-6' : 'w-8 h-8',
                ])}
              />
            )}

            {label && showLabel && (
              <span
                class={classSet([
                  '-:ml-2 -:text-sm -:font-medium -:truncate -:overflow-hidden -:text-ellipsis',
                  isPill ? '-:max-w-[8rem]' : '',
                ])}
              >
                {label}
              </span>
            )}
          </div>

          <div class="pt-8">{state !== 'default' && children}</div>
        </div>

        {enabled && postInner}

        {state === 'expanded' && (
          <Action
            title="Collapse"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              setState('default');
            }}
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Error}
            class="-:absolute -:top-0 -:right-0 -:font-bold -:pointer-events-auto"
          >
            <CloseIcon class="w-6 h-6" />
          </Action>
        )}

        {pulseIntent && (
          <div class="absolute inset-0 z-0 pointer-events-none">
            {Array.from({
              length:
                pulseSpeed === 'low' ? 6 : pulseSpeed === 'high' ? 14 : 10,
            }).map((_, i) => {
              const { width, height } = nodeSize;
              if (!width || !height) return null;

              const angle = Math.random() * Math.PI * 2;
              const radiusX = width / 2 + 10 + Math.random() * 12;
              const radiusY = height / 2 + 10 + Math.random() * 12;

              const x = Math.cos(angle) * radiusX;
              const y = Math.sin(angle) * radiusY;

              const sizeBase =
                pulseSpeed === 'low' ? 3 : pulseSpeed === 'high' ? 5 : 4;
              const size =
                sizeBase + Math.random() * (pulseSpeed === 'high' ? 6 : 4);

              const animationDelay = `${(Math.random() * 1.5).toFixed(2)}s`;
              const pulse = getIntentStyles(pulseIntent);

              return (
                <div
                  key={i}
                  class={classSet([
                    'absolute rounded-full opacity-80',
                    pulse.glow,
                    pulse.pulse[pulseSpeed],
                  ])}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    animationDelay,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {enabled && postMain}
    </div>
  );
}

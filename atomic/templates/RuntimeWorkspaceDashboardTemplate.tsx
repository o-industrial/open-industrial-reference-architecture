import { JSX, useState, classSet, IntentTypes } from '../.deps.ts';
import {
  PanelShell,
  Action,
  ActionStyleTypes,
  CloseIcon,
  ExpandIcon,
} from '../.exports.ts';

export type RuntimeWorkspaceDashboardTemplateProps = {
  appBar?: preact.ComponentChildren;
  azi?: preact.ComponentChildren;
  breadcrumb?: preact.ComponentChildren;
  children?: preact.ComponentChildren;
  commitStatus?: preact.ComponentChildren;
  inspector?: preact.ComponentChildren;
  modals?: preact.ComponentChildren;
  stream?: preact.ComponentChildren;
  timeline?: preact.ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function RuntimeWorkspaceDashboardTemplate({
  appBar,
  azi,
  commitStatus,
  children,
  inspector,
  stream,
  timeline,
  ...props
}: RuntimeWorkspaceDashboardTemplateProps): JSX.Element {
  const [aziExpanded, setAziExpanded] = useState(true);
  const [inspectorExpanded, setInspectorExpanded] = useState(true);
  const [streamExpanded, setStreamExpanded] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(true);

  const bottomBothCollapsed = !streamExpanded && !timelineExpanded;

  // Top row layout
  const topRowStart = 1;
  const topRowSpan = bottomBothCollapsed ? 11 : 8;
  const aziColSpan = aziExpanded ? 4 : 1;
  const aziColStart = 1;
  const inspectorColSpan = inspectorExpanded ? 3 : 1;
  const inspectorColStart = 17 - inspectorColSpan;
  const flowColStart = aziColStart + aziColSpan;
  const flowColSpan = inspectorColStart - flowColStart;

  // Bottom row layout (rowStart = 9)
  const rowStart = topRowSpan + topRowStart;

  const streamRowSpan = bottomBothCollapsed ? 1 : 4;
  const streamColSpan = bottomBothCollapsed
    ? 7
    : streamExpanded
    ? timelineExpanded
      ? 7
      : 15
    : 1;

  const timelineRowSpan = bottomBothCollapsed ? 1 : 4;
  const timelineColSpan = bottomBothCollapsed
    ? 9
    : timelineExpanded
    ? streamExpanded
      ? 9
      : 15
    : 1;
  const timelineColStart = bottomBothCollapsed
    ? streamColSpan + 1
    : streamExpanded
    ? streamColSpan + 1
    : 2;

  return (
    <div
      class={classSet([
        '-:h-full',
        '-:gap-0 -:bg-neutral-950 -:text-neutral-100 -:overflow-hidden',
        '-:relative -:transition-all -:duration-500',
      ])}
      {...props}
    >
      {/* App Frame Bar */}
      {appBar && (
        <PanelShell
          rowStart={1}
          rowSpan={1}
          colStart={1}
          colSpan={12}
          class="-:bg-neutral-950 -:border-b -:flex -:items-center -:justify-between -:max-h-10 -:min-h-10 -:overflow-visible"
        >
          {appBar}
        </PanelShell>
      )}

      <div
        class={classSet(['-:grid -:h-full -:grid-cols-16 -:grid-rows-12'])}
        {...props}
      >
        {/* Azi Panel */}
        <PanelShell
          rowStart={topRowStart}
          rowSpan={topRowSpan}
          colStart={aziColStart}
          colSpan={aziColSpan}
          class="-:border-r -:bg-neutral-900 relative"
        >
          <div
            class={classSet([
              '-:transition-all -:duration-500 -:overflow-hidden -:h-full',
              aziExpanded ? '-:opacity-100 -:w-full' : '-:opacity-30 -:w-0',
            ])}
          >
            {azi}
          </div>
          <Action
            title={aziExpanded ? 'Collapse Azi' : 'Expand Azi'}
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            onClick={() => setAziExpanded(!aziExpanded)}
            class="-:absolute -:top-0 -:right-0 -:z-30"
          >
            {aziExpanded ? (
              <CloseIcon class="w-5 h-5" />
            ) : (
              <ExpandIcon class="w-5 h-5" />
            )}
          </Action>
        </PanelShell>

        {/* Flow Panel */}
        <PanelShell
          rowStart={topRowStart}
          rowSpan={topRowSpan}
          colStart={flowColStart}
          colSpan={flowColSpan}
          class="-:border-x -:bg-neutral-950 -:flex -:flex-col"
        >
          {props.breadcrumb && (
            <div
              class="-:col-span-full -:flex -:items-center"
              style={{
                gridColumnStart: flowColStart,
                gridColumnEnd: flowColStart + flowColSpan,
                gridRowStart: 1,
              }}
            >
              {props.breadcrumb}
            </div>
          )}

          {children}
        </PanelShell>

        {/* Inspector Panel */}
        <PanelShell
          rowStart={topRowStart}
          rowSpan={topRowSpan}
          colStart={inspectorColStart}
          colSpan={inspectorColSpan}
          class="-:border-l -:bg-neutral-900 relative"
        >
          <div
            class={classSet([
              '-:transition-all -:duration-500 -:overflow-hidden -:h-full',
              inspectorExpanded
                ? '-:opacity-100 -:w-full'
                : '-:opacity-30 -:w-0',
            ])}
          >
            {inspector}
          </div>
          <Action
            title={
              inspectorExpanded ? 'Collapse Inspector' : 'Expand Inspector'
            }
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            onClick={() => setInspectorExpanded(!inspectorExpanded)}
            class="-:absolute -:top-0 -:right-0 -:z-30"
          >
            {inspectorExpanded ? (
              <CloseIcon class="w-5 h-5" />
            ) : (
              <ExpandIcon class="w-5 h-5" />
            )}
          </Action>
        </PanelShell>

        {/* Stream Panel

      TODO:  Support the tabbed approach to including AziResponds here*/}
        <PanelShell
          rowStart={rowStart}
          rowSpan={streamRowSpan}
          colStart={1}
          colSpan={streamColSpan}
          class="-:border-t -:bg-neutral-900 -:flex -:flex-col -:h-full relative"
        >
          <div
            class={classSet([
              '-:transition-all -:duration-500 -:overflow-hidden -:h-full',
              streamExpanded ? '-:opacity-100 -:w-full' : '-:opacity-30 -:w-0',
            ])}
          >
            {stream}
          </div>
          <Action
            title={streamExpanded ? 'Collapse Stream' : 'Expand Stream'}
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            onClick={() => setStreamExpanded(!streamExpanded)}
            class="-:absolute -:top-0 -:right-0 -:z-30"
          >
            {streamExpanded ? <CloseIcon class="w-5 h-5" /> : '▲'}
          </Action>
        </PanelShell>

        {/* Timeline Panel */}
        <PanelShell
          rowStart={rowStart}
          rowSpan={timelineRowSpan}
          colStart={timelineColStart}
          colSpan={timelineColSpan}
          class="-:border-t -:border-l -:bg-neutral-800 -:flex -:flex-col -:h-full relative"
        >
          <div
            class={classSet([
              '-:transition-all -:duration-500 -:overflow-hidden -:h-full',
              timelineExpanded
                ? '-:opacity-100 -:w-full'
                : '-:opacity-30 -:w-0',
            ])}
          >
            {timeline}
          </div>
          <Action
            title={timelineExpanded ? 'Collapse Timeline' : 'Expand Timeline'}
            styleType={ActionStyleTypes.Icon}
            intentType={IntentTypes.Primary}
            onClick={() => setTimelineExpanded(!timelineExpanded)}
            class="-:absolute -:top-0 -:right-0 -:z-30"
          >
            {timelineExpanded ? <CloseIcon class="w-5 h-5" /> : '▲'}
          </Action>
        </PanelShell>

        {props.modals}
      </div>

      {commitStatus && (
        <div
          class="-:absolute -:top-0 -:right-0 -:bottom-0 -:h-full -:z-50 -:w-96 -:bg-neutral-900 -:border-l -:border-neutral-800 -:shadow-lg -:-:bg-neutral-900 -:-:border-neutral-800"
          style="top: 40px;"
        >
          {commitStatus}
        </div>
      )}
    </div>
  );
}

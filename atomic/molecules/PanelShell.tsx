import { JSX, ComponentChildren, classSet } from '../.deps.ts';

export type PanelShellProps = {
  isExpanded?: boolean;
  isHidden?: boolean;

  colSpan?: number;
  colStart?: number;

  rowSpan?: number;
  rowStart?: number;

  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLElement>;

/**
 * PanelShell
 *
 * Atomic wrapper for dashboard panel slots with responsive col/row span and start,
 * hide/expand toggling, and Tailwind-safe utility application.
 *
 * Supports 1–20 for colSpan, colStart, rowSpan, and rowStart.
 */
export function PanelShell({
  isExpanded = false,
  isHidden = false,
  colSpan,
  colStart,
  rowSpan = 2,
  rowStart,
  children,
  ...props
}: PanelShellProps): JSX.Element | null {
  if (isHidden) return null;

  const resolvedColSpan = colSpan ?? (isExpanded ? 2 : 1);

  const spanMap = {
    1: '-:col-span-1',
    2: '-:col-span-2',
    3: '-:col-span-3',
    4: '-:col-span-4',
    5: '-:col-span-5',
    6: '-:col-span-6',
    7: '-:col-span-7',
    8: '-:col-span-8',
    9: '-:col-span-9',
    10: '-:col-span-10',
    11: '-:col-span-11',
    12: '-:col-span-12',
    13: '-:col-span-13',
    14: '-:col-span-14',
    15: '-:col-span-15',
    16: '-:col-span-16',
    17: '-:col-span-17',
    18: '-:col-span-18',
    19: '-:col-span-19',
    20: '-:col-span-20',
  } as const;

  const rowSpanMap = {
    1: '-:row-span-1',
    2: '-:row-span-2',
    3: '-:row-span-3',
    4: '-:row-span-4',
    5: '-:row-span-5',
    6: '-:row-span-6',
    7: '-:row-span-7',
    8: '-:row-span-8',
    9: '-:row-span-9',
    10: '-:row-span-10',
    11: '-:row-span-11',
    12: '-:row-span-12',
    13: '-:row-span-13',
    14: '-:row-span-14',
    15: '-:row-span-15',
    16: '-:row-span-16',
    17: '-:row-span-17',
    18: '-:row-span-18',
    19: '-:row-span-19',
    20: '-:row-span-20',
  } as const;

  const colStartMap = {
    1: '-:col-start-1',
    2: '-:col-start-2',
    3: '-:col-start-3',
    4: '-:col-start-4',
    5: '-:col-start-5',
    6: '-:col-start-6',
    7: '-:col-start-7',
    8: '-:col-start-8',
    9: '-:col-start-9',
    10: '-:col-start-10',
    11: '-:col-start-11',
    12: '-:col-start-12',
    13: '-:col-start-13',
    14: '-:col-start-14',
    15: '-:col-start-15',
    16: '-:col-start-16',
    17: '-:col-start-17',
    18: '-:col-start-18',
    19: '-:col-start-19',
    20: '-:col-start-20',
  } as const;

  const rowStartMap = {
    1: '-:row-start-1',
    2: '-:row-start-2',
    3: '-:row-start-3',
    4: '-:row-start-4',
    5: '-:row-start-5',
    6: '-:row-start-6',
    7: '-:row-start-7',
    8: '-:row-start-8',
    9: '-:row-start-9',
    10: '-:row-start-10',
    11: '-:row-start-11',
    12: '-:row-start-12',
    13: '-:row-start-13',
    14: '-:row-start-14',
    15: '-:row-start-15',
    16: '-:row-start-16',
    17: '-:row-start-17',
    18: '-:row-start-18',
    19: '-:row-start-19',
    20: '-:row-start-20',
  } as const;

  const colSpanClass =
    spanMap[resolvedColSpan as keyof typeof spanMap] ?? '-:col-span-1';
  const rowSpanClass =
    rowSpanMap[rowSpan as keyof typeof rowSpanMap] ?? '-:row-span-2';
  const colStartClass = colStart
    ? colStartMap[colStart as keyof typeof colStartMap]
    : undefined;
  const rowStartClass = rowStart
    ? rowStartMap[rowStart as keyof typeof rowStartMap]
    : undefined;

  return (
    <aside
      {...props}
      class={classSet(
        [
          colSpanClass,
          rowSpanClass,
          colStartClass,
          rowStartClass,
          '-:transition-all -:duration-300 -:overflow-hidden',
          '-:bg-neutral-900 -:border-neutral-800',
        ],
        props
      )}
    >
      {children}
    </aside>
  );
}

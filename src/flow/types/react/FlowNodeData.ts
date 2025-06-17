import { EaCVertexDetails } from '../../.deps.ts';
import { BaseNodeEvent } from './BaseNodeEvent.ts';

export type FlowNodeData<
  TEaC extends EaCVertexDetails = EaCVertexDetails,
  TStats extends Record<string, unknown> = Record<string, unknown>,
  TEvent extends BaseNodeEvent = BaseNodeEvent,
> = {
  /** Internal type */
  type: string;

  /** Optional label for UI display */
  label?: string;

  /** Internal enablement state */
  enabled?: boolean;

  /** Canonical EaC details object */
  details: TEaC;

  /** Hook that returns runtime stats (deferred to render) */
  useStats: () => TStats | undefined;

  /** UI interaction */
  isSelected?: boolean;

  onDoubleClick?: () => void;

  onNodeEvent?: (event: TEvent) => void;

  /** Optional icon override */
  iconKey?: string;
};

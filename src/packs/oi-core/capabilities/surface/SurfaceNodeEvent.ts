import { BaseNodeEvent } from '../../../../flow/.exports.ts';

export type SurfaceNodeEvent = BaseNodeEvent & {
  Type: 'manage' | 'preview';
};

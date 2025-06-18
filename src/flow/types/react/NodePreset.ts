import { IntentTypes } from '../../../types/IntentTypes.ts';

export type NodePreset = {
  Type: string;
  Label: string;
  IconKey: string;
  Intent?: IntentTypes;
};

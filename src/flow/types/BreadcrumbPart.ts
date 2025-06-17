import { IntentTypes } from '../../types/IntentTypes.ts';

export type BreadcrumbPart<TProps = Record<string, unknown>> = Partial<TProps> & {
  label: string;
  intentType?: IntentTypes;
};

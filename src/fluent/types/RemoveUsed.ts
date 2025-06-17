import { UsedKeys } from './UsedKeys.ts';

export type RemoveUsed<T, Used extends UsedKeys> = Omit<T, keyof Used>;

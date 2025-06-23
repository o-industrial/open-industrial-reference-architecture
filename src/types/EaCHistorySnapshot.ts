import { NullableArrayOrObject } from './.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../eac/EverythingAsCodeOIWorkspace.ts';

export type EaCHistorySnapshot = {
  eac: EverythingAsCodeOIWorkspace;
  deletes: NullableArrayOrObject<EverythingAsCodeOIWorkspace>;
};

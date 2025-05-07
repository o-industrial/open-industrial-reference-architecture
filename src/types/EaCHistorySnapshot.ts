import { NullableArrayOrObject } from './.deps.ts';
import { OpenIndustrialEaC } from './OpenIndustrialEaC.ts';

export type EaCHistorySnapshot = {
  eac: OpenIndustrialEaC;
  deletes: NullableArrayOrObject<OpenIndustrialEaC>;
};

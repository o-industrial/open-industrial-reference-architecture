import { OpenIndustrialEaC } from './OpenIndustrialEaC.ts';
import { RecordKeysOnly } from './RecordKeysOnly.ts';

/**
 * Union of all OpenIndustrialEaC record-like maps (Schemas, Agents, etc.)
 */

export type RecordKind = RecordKeysOnly<OpenIndustrialEaC>;

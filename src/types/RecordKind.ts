import { EverythingAsCodeOIWorkspace } from '../eac/EverythingAsCodeOIWorkspace.ts';
import { RecordKeysOnly } from './RecordKeysOnly.ts';

/**
 * Union of all EverythingAsCodeOIWorkspace record-like maps (Schemas, Agents, etc.)
 */

export type RecordKind = RecordKeysOnly<EverythingAsCodeOIWorkspace>;

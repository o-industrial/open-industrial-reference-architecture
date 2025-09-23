// deno-lint-ignore-file no-explicit-any
import { jsonMapSetClone, merge, NullableArrayOrObject } from '../../.deps.ts';
import { HistoryManager } from '../HistoryManager.ts';
import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';

/**
 * Handles diffing, merging, and deletion tracking for Everything-as-Code structures.
 * Emits on change and writes to history when structural differences are detected.
 */
export class EaCDiffManager {
  constructor(protected history: HistoryManager, protected emit: () => void) {}
  protected stableStringify(value: unknown): string {
    const normalize = (v: unknown): unknown => {
      if (Array.isArray(v)) return v.map((x) => normalize(x));
      if (v && typeof v === 'object') {
        const obj = v as Record<string, unknown>;
        const keys = Object.keys(obj).sort();
        const out: Record<string, unknown> = {};
        for (const k of keys) out[k] = normalize(obj[k]);
        return out;
      }
      return v;
    };
    return JSON.stringify(normalize(value));
  }

  public MergePartial(
    current: EverythingAsCodeOIWorkspace,
    deleteEaC: NullableArrayOrObject<EverythingAsCodeOIWorkspace>,
    partial: EverythingAsCodeOIWorkspace,
  ): { updated: EverythingAsCodeOIWorkspace; changed: boolean } {
    const updated = merge<EverythingAsCodeOIWorkspace>(current, partial);
    const changed = this.stableStringify(current) !== this.stableStringify(updated);

    if (changed) {
      this.history.Push(updated, deleteEaC);
      this.emit();
    }

    return { updated, changed };
  }

  public MergeDelete(
    current: EverythingAsCodeOIWorkspace,
    deleteEaC: NullableArrayOrObject<EverythingAsCodeOIWorkspace>,
    partial: EverythingAsCodeOIWorkspace,
  ): {
    updated: EverythingAsCodeOIWorkspace;
    changed: boolean;
    deleteEaC: NullableArrayOrObject<EverythingAsCodeOIWorkspace>;
  } {
    this.deepMergeDelete(deleteEaC, jsonMapSetClone(partial));

    const updated = jsonMapSetClone(current);

    this.deepDelete(updated, deleteEaC);

    const changed = this.stableStringify(current) !== this.stableStringify(updated);

    if (changed) {
      this.history.Push(updated, deleteEaC);
      this.emit();
    }

    return { updated, changed, deleteEaC };
  }

  protected deepMergeDelete(target: any, patch: any): void {
    for (const key in patch) {
      const val = patch[key];
      if (val === null) {
        target[key] = null;
      } else if (typeof val === 'object') {
        target[key] ??= {};
        this.deepMergeDelete(target[key], val);
      }
    }
  }

  protected deepDelete(target: any, patch: any): void {
    for (const key in patch) {
      const val = patch[key];
      if (val === null) {
        delete target[key];
      } else if (typeof val === 'object' && typeof target[key] === 'object') {
        this.deepDelete(target[key], val);
        if (Object.keys(target[key]).length === 0) {
          delete target[key];
        }
      }
    }
  }
}

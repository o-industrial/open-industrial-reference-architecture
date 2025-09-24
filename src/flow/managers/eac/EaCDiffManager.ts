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
  protected isDebugEnabled(): boolean {
    try {
      const g: any = globalThis as any;
      if (g?.OI_DEBUG?.eac) return true;
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('OI_DEBUG_EAC') === '1';
      }
    } catch (_) {
      // ignore
    }
    return false;
  }
  protected stableStringify(value: unknown): string {
    const normalize = (v: unknown): unknown => {
      if (Array.isArray(v)) return v.map((x) => normalize(x));
      if (v && typeof v === 'object') {
        const obj = v as Record<string, unknown>;
        const keys = Object.keys(obj).sort();
        const out: Record<string, unknown> = {};
        for (const k of keys) {
          const nv = normalize(obj[k]);
          // prune empty objects
          if (
            nv && typeof nv === 'object' && !Array.isArray(nv) &&
            Object.keys(nv as Record<string, unknown>).length === 0
          ) {
            continue;
          }
          out[k] = nv;
        }
        return out;
      }
      return v;
    };
    return JSON.stringify(normalize(value));
  }

  // Remove delete markers that no longer apply because the key exists again
  // in the current structure. Mutates the delete tree in place.
  protected pruneDeletes(deletes: any, current: any): boolean {
    let mutated = false;
    if (!deletes || typeof deletes !== 'object') return false;

    for (const key of Object.keys(deletes)) {
      const dval = deletes[key];
      if (dval === null) {
        if (
          current && typeof current === 'object' &&
          Object.prototype.hasOwnProperty.call(current, key)
        ) {
          delete deletes[key];
          mutated = true;
        }
      } else if (typeof dval === 'object') {
        const curChild = current?.[key];
        if (this.pruneDeletes(dval, curChild)) mutated = true;
        if (Object.keys(dval).length === 0) {
          delete deletes[key];
          mutated = true;
        }
      }
    }

    return mutated;
  }

  public MergePartial(
    current: EverythingAsCodeOIWorkspace,
    deleteEaC: NullableArrayOrObject<EverythingAsCodeOIWorkspace>,
    partial: EverythingAsCodeOIWorkspace,
  ): { updated: EverythingAsCodeOIWorkspace; changed: boolean } {
    const updated = merge<EverythingAsCodeOIWorkspace>(current, partial);
    const before = this.stableStringify(current);
    const after = this.stableStringify(updated);
    let changed = before !== after;

    // If user re-added a field that previously had a delete marker, drop the marker
    if (this.pruneDeletes(deleteEaC, updated)) {
      changed = true;
    }

    if (changed) {
      if (this.isDebugEnabled()) {
        console.debug('[EaCDiffManager] MergePartial changed structure. Patch:', partial);
        console.debug('[EaCDiffManager] Before (stable):', before);
        console.debug('[EaCDiffManager] After  (stable):', after);
      }
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

    const before = this.stableStringify(current);
    const after = this.stableStringify(updated);
    const changed = before !== after;

    if (changed) {
      if (this.isDebugEnabled()) {
        console.debug('[EaCDiffManager] MergeDelete changed structure. DeletePatch:', deleteEaC);
        console.debug('[EaCDiffManager] Before (stable):', before);
        console.debug('[EaCDiffManager] After  (stable):', after);
      }
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

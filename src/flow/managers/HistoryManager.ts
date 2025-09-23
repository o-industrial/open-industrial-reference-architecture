import { jsonMapSetClone, NullableArrayOrObject } from '../.deps.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { EaCHistorySnapshot } from '../../types/EaCHistorySnapshot.ts';

export class HistoryManager {
  protected history: EaCHistorySnapshot[] = [];
  protected pointer = -1;
  protected committed: EaCHistorySnapshot | null = null;
  protected dirty = false;
  protected maxHistory = 100;

  protected listeners: Set<() => void> = new Set<() => void>();

  constructor() {
    const empty: EaCHistorySnapshot = {
      eac: jsonMapSetClone({}),
      deletes: jsonMapSetClone({}),
    };

    this.history.push(empty);
    this.pointer = 0;
    this.committed = empty;
  }

  // === Public API ===

  public GetCurrent(): EaCHistorySnapshot {
    return jsonMapSetClone(this.history[this.pointer]);
  }

  public GetVersion(): number {
    return this.pointer;
  }

  public HasUnsavedChanges(): boolean {
    if (!this.committed || this.dirty) return true;

    const current = this.GetCurrent();

    const a = this.stableStringify(current.eac);
    const b = this.stableStringify(this.committed.eac);
    if (a !== b) return true;

    const ad = this.stableStringify(current.deletes);
    const bd = this.stableStringify(this.committed.deletes);
    return ad !== bd;
  }

  public CanUndo(): boolean {
    return this.pointer > 0;
  }

  public CanRedo(): boolean {
    return this.pointer < this.history.length - 1;
  }

  public MarkDirty(): void {
    this.dirty = true;
  }

  public FlushIfDirty(
    eac: EverythingAsCodeOIWorkspace,
    deletes: NullableArrayOrObject<EverythingAsCodeOIWorkspace>,
  ): void {
    if (!this.dirty) return;

    this.Push(eac, deletes);
    this.dirty = false;
  }

  public Push(
    eac: EverythingAsCodeOIWorkspace,
    deletes: NullableArrayOrObject<EverythingAsCodeOIWorkspace> = {},
  ): void {
    const snapshot: EaCHistorySnapshot = {
      eac: jsonMapSetClone(eac),
      deletes: jsonMapSetClone(deletes),
    };

    // Truncate forward history if needed
    if (this.pointer < this.history.length - 1) {
      this.history = this.history.slice(0, this.pointer + 1);
    }

    this.history.push(snapshot);
    this.pointer++;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.pointer--;
    }

    this.emit();
  }

  public Undo(): EaCHistorySnapshot | null {
    if (!this.CanUndo()) return null;

    this.pointer--;
    this.emit();
    return jsonMapSetClone(this.history[this.pointer]);
  }

  public Redo(): EaCHistorySnapshot | null {
    if (!this.CanRedo()) return null;

    this.pointer++;
    this.emit();
    return jsonMapSetClone(this.history[this.pointer]);
  }

  public Commit(): void {
    this.committed = jsonMapSetClone(this.history[this.pointer]);
    this.dirty = false;
    this.emit();
  }

  public RevertToLastCommit(): EaCHistorySnapshot | null {
    if (!this.committed) return null;

    this.Push(this.committed.eac, this.committed.deletes);
    this.emit();
    return jsonMapSetClone(this.committed);
  }

  public ForkRuntime(): EverythingAsCodeOIWorkspace {
    const { eac } = this.GetCurrent();
    return jsonMapSetClone(eac);
  }

  public OnChange(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // === Internal Emit ===

  protected emit(): void {
    for (const cb of this.listeners) cb();
  }

  // Deterministic JSON stringify (recursive lexicographic key order)
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
}

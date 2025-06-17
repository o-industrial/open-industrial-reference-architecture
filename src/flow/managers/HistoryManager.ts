import { EaCHistorySnapshot, jsonMapSetClone, NullableArrayOrObject } from '../.deps.ts';
import { OpenIndustrialEaC } from '../../types/OpenIndustrialEaC.ts';

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
    if (!this.committed) return true;

    const current = this.GetCurrent();

    return (
      JSON.stringify(current.eac) !== JSON.stringify(this.committed.eac) ||
      JSON.stringify(current.deletes) !== JSON.stringify(this.committed.deletes)
    );
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
    eac: OpenIndustrialEaC,
    deletes: NullableArrayOrObject<OpenIndustrialEaC>,
  ): void {
    if (!this.dirty) return;

    this.Push(eac, deletes);
    this.dirty = false;
  }

  public Push(
    eac: OpenIndustrialEaC,
    deletes: NullableArrayOrObject<OpenIndustrialEaC> = {},
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

  public ForkRuntime(): OpenIndustrialEaC {
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
}

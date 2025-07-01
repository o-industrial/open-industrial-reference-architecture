import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import type { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';

export type ImpulseStreamFilter = {
  Surface?: string;
};

export class ImpulseStreamManager {
  protected impulses: RuntimeImpulse[] = [];
  protected filters: Partial<ImpulseStreamFilter> = {};
  protected listeners: Set<() => void> = new Set();
  protected disconnect: (() => void) | null = null;

  constructor(protected oiSvc: OpenIndustrialAPIClient) {}

  public Connect(): void {
    if (this.disconnect) {
      console.warn('[ImpulseStreamManager] Already connected. Skipping re-connect.');
      return;
    }

    console.info('[ImpulseStreamManager] Connecting to impulse stream with filters:', this.filters);

    let impulseCount = 0;

    this.disconnect = this.oiSvc.Workspaces.StreamImpulses(
      (impulse: RuntimeImpulse) => {
        //debugger;
        impulseCount++;
        console.debug(`[ImpulseStreamManager] Received impulse #${impulseCount}:`, impulse);

        this.impulses.push(impulse);
        this.listeners.forEach((cb) => cb());
      },
      this.filters
    );
    // this.disconnect = this.oiSvc.Workspaces.StreamImpulsesSimple(
    //   (impulse: string) => {
    //     impulseCount++;
    //     console.debug(`[ImpulseStreamManager] Received impulse #${impulseCount}:`);
    //     console.debug(impulse);
    //     this.listeners.forEach((cb) => cb());
    //   }
    // );
  }

  public Disconnect(): void {
    if (this.disconnect) {
      console.info('[ImpulseStreamManager] Disconnecting from impulse stream');
      this.disconnect();
      this.disconnect = null;
    } else {
      console.warn('[ImpulseStreamManager] Disconnect called but no active connection');
    }
  }

  public SetFilters(filters: Partial<ImpulseStreamFilter>): void {
    const shouldReconnect = filters.Surface !== this.filters.Surface;

    console.info('[ImpulseStreamManager] Updating filters:', filters, `(reconnect = ${shouldReconnect})`);

    this.filters = { ...filters };

    if (shouldReconnect) {
      this.Disconnect();
      this.Connect();
    }
  }

  public OnChanged(cb: () => void): () => void {
    console.debug('[ImpulseStreamManager] Listener registered');
    this.listeners.add(cb);
    return () => {
      console.debug('[ImpulseStreamManager] Listener removed');
      this.listeners.delete(cb);
    };
  }

  public GetImpulses(): RuntimeImpulse[] {
    return this.impulses;
  }
}

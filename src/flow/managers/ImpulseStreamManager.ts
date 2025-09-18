import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import type { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';

export type ImpulseStreamFilter = {
  Surface?: string;
};

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting';
type DisconnectReason = 'manual' | 'restart' | null;

export class ImpulseStreamManager {
  protected impulses: RuntimeImpulse[] = [];
  protected filters: Partial<ImpulseStreamFilter> = {};
  protected listeners: Set<() => void> = new Set();
  protected disconnect: (() => void) | null = null;

  private connectionState: ConnectionState = 'idle';
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private disconnectReason: DisconnectReason = null;
  private lastActivityAt: number | null = null;

  private readonly baseReconnectDelayMs = 1000;
  private readonly maxReconnectDelayMs = 30_000;
  private readonly activityTimeoutMs = 45_000;

  private visibilityListener?: EventListener;
  private focusListener?: EventListener;
  private onlineListener?: EventListener;

  constructor(protected oiSvc: OpenIndustrialAPIClient) {
    this.registerLifecycleListeners();
  }

  public Connect(): void {
    if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
      console.warn('[ImpulseStreamManager] Already connecting or connected.');
      return;
    }

    console.info('[ImpulseStreamManager] Connecting to impulse stream with filters:', this.filters);

    this.clearReconnectTimer();
    this.connectionState = 'connecting';
    this.disconnectReason = null;

    let impulseCount = 0;

    this.disconnect = this.oiSvc.Workspaces.StreamImpulses(
      (impulse: RuntimeImpulse) => {
        impulseCount++;
        this.lastActivityAt = Date.now();
        console.debug(`[ImpulseStreamManager] Received impulse #${impulseCount}:`, impulse);

        this.impulses.push(impulse);
        this.listeners.forEach((cb) => cb());
      },
      this.filters,
      {
        onOpen: () => {
          console.info('[ImpulseStreamManager] Impulse stream connected.');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.lastActivityAt = Date.now();
        },
        onActivity: () => {
          this.lastActivityAt = Date.now();
        },
        onError: (err) => {
          console.error('[ImpulseStreamManager] Stream error detected:', err);
        },
        onClose: (evt) => {
          console.warn(
            '[ImpulseStreamManager] Stream closed:',
            evt.reason || '(no reason)',
            `code=${evt.code}`,
          );

          this.disconnect = null;
          this.connectionState = 'idle';

          const reason = this.disconnectReason;
          this.disconnectReason = null;

          if (reason === 'manual') {
            this.lastActivityAt = null;
            return;
          }

          if (reason === 'restart') {
            this.lastActivityAt = null;
            setTimeout(() => this.Connect(), 0);
            return;
          }

          this.scheduleReconnect();
        },
      },
      // Attempt to resume from the last activity time on reconnect; default server fallback = 20m
      this.lastActivityAt ? { since: new Date(this.lastActivityAt).toISOString() } : undefined,
    );
  }

  public Disconnect(): void {
    this.disconnectReason = 'manual';
    this.clearReconnectTimer();
    this.lastActivityAt = null;

    if (this.disconnect) {
      console.info('[ImpulseStreamManager] Disconnecting from impulse stream');
      const disconnect = this.disconnect;
      this.disconnect = null;
      disconnect();
    } else {
      console.warn('[ImpulseStreamManager] Disconnect called but no active connection');
    }

    this.connectionState = 'idle';
  }

  public SetFilters(filters: Partial<ImpulseStreamFilter>): void {
    const shouldReconnect = filters.Surface !== this.filters.Surface;

    console.info(
      '[ImpulseStreamManager] Updating filters:',
      filters,
      `(reconnect = ${shouldReconnect})`,
    );

    this.filters = { ...filters };

    if (shouldReconnect) {
      this.restartConnection();
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

  private restartConnection(): void {
    if (!this.disconnect) {
      this.Connect();
      return;
    }

    console.info('[ImpulseStreamManager] Restarting impulse stream connection');
    this.disconnectReason = 'restart';
    this.clearReconnectTimer();
    this.connectionState = 'disconnecting';

    const disconnect = this.disconnect;
    this.disconnect = null;
    disconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null || this.connectionState === 'disconnecting') {
      return;
    }

    const attempt = this.reconnectAttempts + 1;
    this.reconnectAttempts = attempt;

    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.baseReconnectDelayMs * Math.pow(2, attempt - 1),
    );

    console.info(`[ImpulseStreamManager] Scheduling reconnect in ${delay}ms (attempt ${attempt})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.connectionState === 'idle') {
        this.Connect();
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private registerLifecycleListeners(): void {
    const doc = typeof document !== 'undefined' ? document : undefined;
    if (doc && typeof doc.addEventListener === 'function') {
      this.visibilityListener = () => {
        if (doc.visibilityState === 'visible') {
          this.ensureConnectionAfterResume();
        }
      };
      doc.addEventListener('visibilitychange', this.visibilityListener);
    }

    const global = typeof globalThis !== 'undefined' ? globalThis : undefined;
    if (global && typeof global.addEventListener === 'function') {
      this.focusListener = () => this.ensureConnectionAfterResume();
      this.onlineListener = () => this.ensureConnectionAfterResume();
      global.addEventListener('focus', this.focusListener!);
      global.addEventListener('online', this.onlineListener!);
    }
  }

  private ensureConnectionAfterResume(): void {
    if (this.connectionState === 'idle') {
      this.Connect();
      return;
    }

    if (this.connectionState === 'connected' && this.isStale()) {
      console.info('[ImpulseStreamManager] Detected stale impulse stream. Restarting.');
      this.restartConnection();
    }
  }

  private isStale(): boolean {
    if (this.lastActivityAt === null) {
      return false;
    }

    return Date.now() - this.lastActivityAt > this.activityTimeoutMs;
  }
}

// deno-lint-ignore-file no-explicit-any
import { EaCStatus, EaCUserRecord } from '../.client.deps.ts';
import { EaCHistorySnapshot } from '../../types/EaCHistorySnapshot.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';
import { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { ImpulseStreamFilter } from '../../flow/managers/ImpulseStreamManager.ts';

/**
 * Subclient for managing OpenIndustrial workspace lifecycle and memory commits.
 */

export class OpenIndustrialWorkspaceAPI {
  constructor(private bridge: ClientHelperBridge) {}

  /**
   * Archive the current workspace.
   */
  public async Archive(): Promise<EverythingAsCodeOIWorkspace> {
    const res = await fetch(this.bridge.url('/api/workspaces/archive'), {
      method: 'DELETE',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to archive current workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Commit a snapshot of runtime memory (e.g. agent execution history).
   */
  public async Commit(snapshot: EaCHistorySnapshot): Promise<EaCStatus> {
    const res = await fetch(this.bridge.url('/api/workspaces/commit'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(snapshot),
    });

    if (!res.ok) {
      throw new Error(`Failed to commit workspace snapshot: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Create a new workspace from the given OpenIndustrial EaC configuration.
   */
  public async Create(
    eac: EverythingAsCodeOIWorkspace,
  ): Promise<{ EnterpriseLookup: string; CommitID: string }> {
    const res = await fetch(this.bridge.url('/api/workspaces'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(eac),
    });

    if (!res.ok) {
      throw new Error(`Failed to create workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Get the EaC JWT for a workspace for the authenticated user.
   */
  public async EaCJWT(): Promise<{ Token: string }> {
    const res = await fetch(this.bridge.url('/api/workspaces/eac/jwt'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch current workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Get the current workspace for the authenticated user.
   */
  public async Get(): Promise<EverythingAsCodeOIWorkspace> {
    const res = await fetch(this.bridge.url('/api/workspaces'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch current workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List all workspaces available to the current user.
   */
  public async ListForUser(): Promise<EaCUserRecord[]> {
    const res = await fetch(this.bridge.url('/api/workspaces/list'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list workspaces: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List all workspaces available to the current user.
   */
  public async LoadCapabilities(): Promise<Response> {
    const res = await fetch(this.bridge.url('/api/workspaces/capabilities'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to load capabilities: ${res.status}`);
    }

    return res;
  }

  /**
   * Connect to the impulse stream via WebSocket and receive live impulses.
   *
   * @param onImpulse - Callback invoked with each valid RuntimeImpulse
   * @param filters - Optional filters to scope by surface/schema
   * @returns A cleanup function to close the WebSocket connection
   */
  public StreamImpulses(
    onImpulse: (impulse: RuntimeImpulse) => void,
    filters?: ImpulseStreamFilter,
  ): () => void {
    const url = new URL(this.bridge.url('/api/workspaces/impulses/stream'));

    // 🌐 Attach surface filter if present
    if (filters?.Surface) {
      url.searchParams.set('surface', filters.Surface);
      console.info('[StreamImpulses] 🌐 Surface filter:', filters.Surface);
    }

    // 🔐 Attach auth token if present
    const token = this.bridge.token();
    if (token) {
      url.searchParams.set('Authorization', token);
      console.info('[StreamImpulses] 🛡️ Token attached');
    } else {
      console.warn('[StreamImpulses] ⚠️ No auth token present!');
    }

    // 🔁 Convert http/https to ws/wss
    url.protocol = url.protocol.replace(/^http/, 'ws');

    console.info('[StreamImpulses] 🚀 Connecting to:', url.toString());

    const socket = new WebSocket(url.toString());

    let isOpen = false;
    const messageQueue: string[] = [];

    // ✅ Helper to safely send messages
    const _send = (msg: string) => {
      if (isOpen && socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
      } else {
        messageQueue.push(msg);
        console.debug('[StreamImpulses] ⏳ Queued message until open:', msg);
      }
    };

    // ✅ Validate runtime impulse
    const isRuntimeImpulse = (obj: any): obj is RuntimeImpulse => {
      const valid = obj &&
        typeof obj.Timestamp === 'string' &&
        typeof obj.Confidence === 'number' &&
        typeof obj.Payload === 'object' &&
        obj.Payload !== null;

      if (!valid) {
        console.warn('[StreamImpulses] ❌ Invalid impulse payload:', obj);
      }

      return valid;
    };

    // ✅ WebSocket events
    socket.onopen = () => {
      isOpen = true;
      console.info('[StreamImpulses] ✅ WebSocket opened');

      // Flush message queue
      for (const msg of messageQueue) {
        socket.send(msg);
      }
      messageQueue.length = 0;

      // (Optional) Send greeting or subscription request here
      // send(JSON.stringify({ type: 'subscribe', ts: Date.now() }));
    };

    socket.onmessage = (event) => {
      console.debug('[StreamImpulses] 📥 Raw message:', event.data);
      try {
        const parsed = JSON.parse(event.data);
        if (isRuntimeImpulse(parsed)) {
          console.debug('[StreamImpulses] ✅ Parsed RuntimeImpulse');
          onImpulse(parsed);
        }
      } catch (err) {
        console.error('[StreamImpulses] ❌ Parse error:', err);
        console.debug('Raw data:', event.data);
      }
    };

    socket.onerror = (err) => {
      console.error('[StreamImpulses] ❌ WebSocket error:', err);
    };

    socket.onclose = (evt) => {
      isOpen = false;
      console.info(
        '[StreamImpulses] 🔻 WebSocket closed:',
        evt.reason || '(no reason)',
        ` | code=${evt.code}`,
      );
    };

    // ✅ Return cleanup function
    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        console.info('[StreamImpulses] 🔌 Closing WebSocket manually');
        socket.close(1000, 'Client disconnect');
      }
    };
  }
}

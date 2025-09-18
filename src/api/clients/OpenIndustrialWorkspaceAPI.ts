import { EaCStatus, EaCUserRecord } from '../.client.deps.ts';
import { EaCHistorySnapshot } from '../../types/EaCHistorySnapshot.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { ClientHelperBridge } from './ClientHelperBridge.ts';
import { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { ImpulseStreamFilter } from '../../flow/managers/ImpulseStreamManager.ts';
import { OpenIndustrialWorkspaceExplorerAPI } from './OpenIndustrialWorkspaceExplorerAPI.ts';
type ImpulseStreamHandlers = {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onActivity?: () => void;
};

/**
 * Subclient for managing OpenIndustrial workspace lifecycle and memory commits.
 */

export class OpenIndustrialWorkspaceAPI {
  public readonly Explorer: OpenIndustrialWorkspaceExplorerAPI;

  constructor(private bridge: ClientHelperBridge) {
    this.Explorer = new OpenIndustrialWorkspaceExplorerAPI(bridge);
  }

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
  public async Commit(
    snapshot: EaCHistorySnapshot,
    forceActuators?: boolean,
  ): Promise<EaCStatus> {
    const res = await fetch(
      this.bridge.url(
        `/api/workspaces/commit?forceActuators=${forceActuators}`,
      ),
      {
        method: 'POST',
        headers: this.bridge.headers(),
        body: JSON.stringify(snapshot),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to commit workspace snapshot: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Commit a snapshot of runtime memory (e.g. agent execution history).
   */
  public async Deploy(): Promise<EaCStatus> {
    const res = await fetch(this.bridge.url('/api/workspaces/commit/deploy'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      throw new Error(`Failed to deploy workspace: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List the commit statuses for the current workspace.
   */
  public async ListCommitStatuses(): Promise<EaCStatus[]> {
    const res = await fetch(
      this.bridge.url('/api/workspaces/commit/statuses'),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to list commit statuses: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * List the team users for the current workspace.
   */
  public async ListUsers(): Promise<EaCUserRecord[]> {
    const res = await fetch(this.bridge.url('/api/workspaces/teams/list'), {
      method: 'GET',
      headers: this.bridge.headers(),
    });

    if (!res.ok) {
      throw new Error(`Failed to list team users: ${res.status}`);
    }

    return await this.bridge.json(res);
  }

  /**
   * Invite new user to current workspace
   */
  public async InviteUser(
    userRecord: EaCUserRecord,
  ): Promise<{ EnterpriseLookup: string; CommitID: string }> {
    const res = await fetch(this.bridge.url('/api/workspaces/teams/invite'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify(userRecord),
    });

    if (!res.ok) {
      throw new Error(`Failed to invite user: ${res.status}`);
    }

    return await this.bridge.json(res);
  }
  /**
   * Remove a user from the current workspace team by username (email).
   */
  public async DeleteUser(username: string): Promise<void> {
    const res = await fetch(
      this.bridge.url(`/api/workspaces/teams/${encodeURIComponent(username)}`),
      {
        method: 'DELETE',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete user: ${res.status}`);
    }
  }
  /**
   * Get the status for a specific commit in the current workspace.
   *
   * @param commitId - The ID of the commit to retrieve.
   */
  public async GetCommitStatus(commitId: string): Promise<EaCStatus> {
    const res = await fetch(
      this.bridge.url(`/api/workspaces/commit/${commitId}/status`),
      {
        method: 'GET',
        headers: this.bridge.headers(),
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch commit status: ${res.status}`);
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
   * Set the active enterprise/workspace for the current user session.
   */
  public async SetActiveWorkspace(workspaceLookup: string): Promise<void> {
    const res = await fetch(this.bridge.url('/api/workspaces/active'), {
      method: 'POST',
      headers: this.bridge.headers(),
      body: JSON.stringify({ WorkspaceLookup: workspaceLookup }),
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to set active workspace: ${res.status}`);
    }
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
    handlers?: ImpulseStreamHandlers,
    opts?: { since?: string; windowSec?: number },
  ): () => void {
    const url = new URL(this.bridge.url('/api/workspaces/impulses/stream'));

    if (filters?.Surface) {
      url.searchParams.set('surface', filters.Surface);
      console.info('[StreamImpulses] Surface filter:', filters.Surface);
    }

    // Optional replay window parameters
    if (opts?.since) {
      url.searchParams.set('since', opts.since);
    } else if (typeof opts?.windowSec === 'number') {
      url.searchParams.set('windowSec', String(opts.windowSec));
    }

    const token = this.bridge.token();
    if (token) {
      url.searchParams.set('Authorization', token);
      console.info('[StreamImpulses] Token attached');
    } else {
      console.warn('[StreamImpulses] No auth token present!');
    }

    url.protocol = url.protocol.replace(/^http/, 'ws');

    console.info('[StreamImpulses] Connecting to:', url.toString());

    const socket = new WebSocket(url.toString());

    let isOpen = false;
    const messageQueue: string[] = [];

    const send = (msg: string) => {
      if (isOpen && socket.readyState === WebSocket.OPEN) {
        socket.send(msg);
      } else {
        messageQueue.push(msg);
        console.debug('[StreamImpulses] Queued message until open:', msg);
      }
    };

    const isRuntimeImpulse = (obj: RuntimeImpulse): obj is RuntimeImpulse => {
      const valid = obj &&
        typeof obj.Timestamp === 'string' &&
        typeof obj.Confidence === 'number' &&
        typeof obj.Payload === 'object' &&
        obj.Payload !== null;

      if (!valid) {
        console.warn('[StreamImpulses] Invalid impulse payload:', obj);
      }

      return valid;
    };

    socket.onopen = () => {
      isOpen = true;
      console.info('[StreamImpulses] WebSocket opened');
      handlers?.onOpen?.();

      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        if (msg) {
          socket.send(msg);
        }
      }

      handlers?.onActivity?.();
    };

    socket.onmessage = (event) => {
      console.debug('[StreamImpulses] Raw message:', event.data);
      handlers?.onActivity?.();

      const msg = typeof event.data === 'string' ? event.data : '';
      try {
        const parsed = JSON.parse(msg);
        const isPing = parsed &&
          typeof parsed === 'object' &&
          'type' in parsed &&
          (parsed as { type: string }).type === 'ping';

        if (isPing) {
          console.debug('[StreamImpulses] Ping received - sending pong');
          send(JSON.stringify({ type: 'pong', ts: new Date().toISOString() }));
          return;
        }

        if (isRuntimeImpulse(parsed)) {
          console.debug('[StreamImpulses] Parsed RuntimeImpulse');
          onImpulse(parsed);
          return;
        }
      } catch (err) {
        if (msg === 'ping') {
          console.debug('[StreamImpulses] Ping received - sending pong');
          send('pong');
          return;
        }
        console.error('[StreamImpulses] Parse error:', err);
        console.debug('Raw data:', event.data);
      }
    };

    socket.onerror = (err) => {
      console.error('[StreamImpulses] WebSocket error:', err);
      handlers?.onError?.(err);
    };

    socket.onclose = (evt) => {
      isOpen = false;
      console.info(
        '[StreamImpulses] WebSocket closed:',
        evt.reason || '(no reason)',
        `| code=${evt.code}`,
      );
      handlers?.onClose?.(evt);
    };

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        console.info('[StreamImpulses] Closing WebSocket manually');
        socket.close(1000, 'Client disconnect');
      }
    };
  }
}

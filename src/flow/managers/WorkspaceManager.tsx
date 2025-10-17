// deno-lint-ignore-file no-explicit-any
import {
  ComponentType,
  Connection,
  Dispatch,
  EaCEnterpriseDetails,
  EaCLicenseAsCode,
  EaCStatus,
  EaCStatusProcessingTypes,
  EaCUserLicense,
  EaCVertexDetails,
  Edge,
  EdgeChange,
  EverythingAsCode,
  merge,
  Node,
  NodeChange,
  RefObject,
  StateUpdater,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  XYPosition,
} from '../.deps.ts';

import { FlowNodeData } from '../types/react/FlowNodeData.ts';
import { GraphStateManager } from './GraphStateManager.ts';
import { ImpulseStreamFilter, ImpulseStreamManager } from './ImpulseStreamManager.ts';
import { InteractionManager } from './InteractionManager.ts';
import { SelectionManager } from './SelectionManager.ts';
import { AziManager, AziState } from './AziManager.ts';
import { SimulatorLibraryManager } from './SimulatorLibraryManager.ts';
import { EaCManager } from './EaCManager.ts';
import { NodeScopeTypes } from '../types/graph/NodeScopeTypes.ts';
import { EverythingAsCodeOIWorkspace } from '../../eac/EverythingAsCodeOIWorkspace.ts';
import { HistoryManager } from './HistoryManager.ts';
import { TeamManager } from './TeamManager.ts';
import { NodeEventManager } from './NodeEventManager.ts';
import { InspectorCommonProps } from '../types/nodes/InspectorCommonProps.ts';
import { WorkspaceSummary } from '../types/WorkspaceSummary.ts';
import { TeamMember } from '../types/TeamMember.ts';
import { BreadcrumbPart } from '../types/BreadcrumbPart.ts';
import { IntentTypes } from '../../types/IntentTypes.ts';
import { EaCNodeCapabilityManager, NodePreset } from '../.exports.ts';
import { OpenIndustrialAPIClient } from '../../api/clients/OpenIndustrialAPIClient.ts';
import { RuntimeImpulse } from '../../types/RuntimeImpulse.ts';
import { EverythingAsCodeIdentity, EverythingAsCodeLicensing } from '../../eac/.deps.ts';
import { AccountProfile } from '../../types/AccountProfile.ts';
import { EaCUserRecord } from '../../api/.client.deps.ts';
import { PackModule } from '../../types/PackModule.ts';

const WORKSPACE_SCOPE_STORAGE_PREFIX = 'oi.workspace.scope';

type PersistedScopePayload = {
  scope: NodeScopeTypes;
  lookup?: string;
};

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis === 'undefined') return null;
    const candidate = (globalThis as { localStorage?: Storage }).localStorage;
    return candidate ?? null;
  } catch {
    return null;
  }
}

function buildScopeStorageKey(
  workspaceLookup: string,
  username?: string,
): string {
  const workspacePart = encodeURIComponent(workspaceLookup);
  if (username && username.length > 0) {
    const userPart = encodeURIComponent(username);
    return `${WORKSPACE_SCOPE_STORAGE_PREFIX}:${workspacePart}:${userPart}`;
  }

  return `${WORKSPACE_SCOPE_STORAGE_PREFIX}:${workspacePart}`;
}

function readPersistedScope(
  workspaceLookup: string,
  username?: string,
): PersistedScopePayload | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  const raw = storage.getItem(buildScopeStorageKey(workspaceLookup, username));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.scope !== 'string') return null;

    const scope = parsed.scope as NodeScopeTypes;
    const lookup = typeof parsed.lookup === 'string' ? parsed.lookup : undefined;

    return { scope, lookup };
  } catch (err) {
    console.warn('[WorkspaceManager] Failed to parse persisted scope', err);
    storage.removeItem(buildScopeStorageKey(workspaceLookup, username));
    return null;
  }
}

function writePersistedScope(
  workspaceLookup: string,
  payload: PersistedScopePayload,
  username?: string,
): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(
      buildScopeStorageKey(workspaceLookup, username),
      JSON.stringify(payload),
    );
  } catch (err) {
    console.warn('[WorkspaceManager] Failed to persist scope', err);
  }
}

export type CommitBadgeState = 'error' | 'processing' | 'success';

export type CommitStoreSnapshot = {
  commits: EaCStatus[];
  badgeState: CommitBadgeState;
};

export class CommitStatusStore {
  protected listeners: Set<() => void> = new Set();
  protected snapshot: CommitStoreSnapshot = {
    commits: [],
    badgeState: 'success',
  };
  protected isLoading = false;

  constructor(protected readonly loader: () => Promise<EaCStatus[]>) {}

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): CommitStoreSnapshot {
    return this.snapshot;
  }

  public async load(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    try {
      const statuses = await this.loader();
      const badgeState = this.resolveBadgeState(statuses);
      this.snapshot = {
        commits: statuses,
        badgeState,
      };
      this.emit();
    } catch (err) {
      console.warn('[CommitStatusStore] Failed to load commit statuses', err);
      if (this.snapshot.badgeState !== 'error') {
        this.snapshot = {
          ...this.snapshot,
          badgeState: 'error',
        };
        this.emit();
      }
    } finally {
      this.isLoading = false;
    }
  }

  protected resolveBadgeState(statuses: EaCStatus[]): CommitBadgeState {
    const hasError = statuses.some(
      (status) => status.Processing === EaCStatusProcessingTypes.ERROR,
    );
    if (hasError) return 'error';

    const isProcessing = statuses.some(
      (status) =>
        status.Processing !== EaCStatusProcessingTypes.COMPLETE &&
        status.Processing !== EaCStatusProcessingTypes.ERROR,
    );
    if (isProcessing) return 'processing';

    return 'success';
  }

  protected emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export class WorkspaceManager {
  protected currentScope: {
    Scope: NodeScopeTypes;

    Lookup?: string;
  };
  protected Jwt: string;
  protected EnterpriseLookup: string;
  protected AziWarmQueryCircuitUrl: string;
  protected AziInterfaceCircuitUrl?: string;

  public Azi: AziManager;
  public EaC: EaCManager;
  public Graph: GraphStateManager;
  public History: HistoryManager;
  public Impulses: ImpulseStreamManager;
  public Interaction: InteractionManager;
  public NodeEvents: NodeEventManager;
  public Selection: SelectionManager;
  public Simulators: SimulatorLibraryManager;
  public Team: TeamManager;
  public WarmQueryAzis: Record<string, AziManager> = Object.create(null);
  public InterfaceAzis: Record<string, AziManager> = Object.create(null);
  protected commitsStore: CommitStatusStore;

  constructor(
    eac: EverythingAsCodeOIWorkspace,
    protected username: string,
    protected userLicense: EaCUserLicense | undefined,
    protected oiSvc: OpenIndustrialAPIClient,
    pack: PackModule,
    scope: NodeScopeTypes = 'workspace',
    scopeLookup: string | undefined = undefined,
    aziCircuitUrl: string,
    aziWarmQueryCircuitUrl: string,
    aziInterfaceCircuitUrl?: string,
    protected accessRights?: string[],
    jwt?: string,
  ) {
    const capabilitiesByScope = pack.Capabilities!;

    this.currentScope = {
      Scope: scope,
      Lookup: scope === 'surface' ? scopeLookup : undefined,
    };
    this.AziWarmQueryCircuitUrl = aziWarmQueryCircuitUrl;
    this.AziInterfaceCircuitUrl = aziInterfaceCircuitUrl ?? aziWarmQueryCircuitUrl;
    this.Azi = new AziManager({
      url: aziCircuitUrl,
      jwt,
      threadId: `workspace-${eac.EnterpriseLookup}`,
    });
    this.Jwt = jwt ?? '';
    this.EnterpriseLookup = eac.EnterpriseLookup! as string;

    this.History = new HistoryManager();
    this.Selection = new SelectionManager();
    this.Simulators = new SimulatorLibraryManager();

    this.NodeEvents = new NodeEventManager(this);

    this.Impulses = new ImpulseStreamManager(this.oiSvc);
    this.Interaction = new InteractionManager(this.Selection);

    this.Graph = new GraphStateManager(
      this.Interaction,
      (id: string) => this.UseStats(id),
      this.NodeEvents,
    );

    this.EaC = new EaCManager(
      eac,
      this.oiSvc,
      this.currentScope.Scope,
      this.Graph,
      this.History,
      capabilitiesByScope,
      this.currentScope.Lookup,
    );

    this.Team = new TeamManager(this.oiSvc, this.EaC);

    this.Interaction.BindEaCManager(this.EaC);

    this.commitsStore = new CommitStatusStore(
      async () => await this.ListCommits(),
    );

    console.log('🚀 FlowManager initialized:', {
      scope: this.currentScope,
      nodes: this.Graph.GetNodes().length,
      edges: this.Graph.GetEdges().length,
    });

    this.persistScope(this.currentScope.Scope, this.currentScope.Lookup);
  }

  public static ResolvePersistedScope(
    workspace: EverythingAsCodeOIWorkspace,
    username?: string,
  ): { Scope: NodeScopeTypes; Lookup?: string } | null {
    const workspaceLookup = workspace.EnterpriseLookup;
    if (!workspaceLookup) return null;

    const persisted = readPersistedScope(workspaceLookup as string, username);
    if (!persisted) return null;

    if (persisted.scope === 'workspace') {
      return { Scope: 'workspace' };
    }

    if (persisted.scope === 'surface') {
      const lookup = persisted.lookup;
      if (!lookup) return null;

      const surfaces = workspace.Surfaces ?? {};
      if (!surfaces || !surfaces[lookup]) return null;

      return { Scope: 'surface', Lookup: lookup };
    }

    return null;
  }

  // Build Authorization headers for direct fetch calls from UI components
  public GetAuthHeaders(extra?: HeadersInit): HeadersInit {
    const base: Record<string, string> = {};
    if (this.Jwt) {
      base['Authorization'] = `Bearer ${this.Jwt}`;
    }
    if (!extra) return base;

    const out: Record<string, string> = { ...base };
    const append = (h: HeadersInit | undefined) => {
      if (!h) return;
      if (Array.isArray(h)) {
        for (const [k, v] of h) out[String(k)] = String(v);
      } else if ((globalThis as any).Headers && h instanceof Headers) {
        (h as Headers).forEach((v, k) => (out[k] = v));
      } else {
        Object.assign(out, h as Record<string, string>);
      }
    };
    append(extra);
    return out;
  }

  // === Hooks ===
  public CreateWarmQueryAziIfNotExist(warmQueryLookup: string) {
    const threadId = `workspace-${this.EnterpriseLookup}-warmquery-${warmQueryLookup}`;
    this.WarmQueryAzis[warmQueryLookup] ??= new AziManager({
      url: this.AziWarmQueryCircuitUrl,
      jwt: this.Jwt,
      threadId: threadId,
    });
  }
  public CreateInterfaceAziIfNotExist(interfaceLookup: string) {
    const threadId = `workspace-${this.EnterpriseLookup}-interface-${interfaceLookup}`;
    const circuitUrl = this.AziInterfaceCircuitUrl ?? this.AziWarmQueryCircuitUrl;
    if (!circuitUrl) {
      return;
    }

    this.InterfaceAzis[interfaceLookup] ??= new AziManager({
      url: circuitUrl,
      jwt: this.Jwt,
      threadId,
    });
  }

  public DispatchInterfaceAction(action: {
    lookup: string;
    type: string;
    payload?: unknown;
    workspace?: string;
  }): void {
    console.log('[WorkspaceManager] Interface action received', action);
  }

  public UseAccountProfile(): {
    profile: AccountProfile;
    hasChanges: boolean;

    setProfile: (next: Partial<AccountProfile>) => void;

    save: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    signOut: () => Promise<void>;
  } {
    const initial: AccountProfile = {
      Username: this.username,
      Name: '',
      Bio: '',
      Additional: '',
    };

    const [profile, setProfileState] = useState<AccountProfile>(initial);
    const [hasChanges, setHasChanges] = useState(false);

    // --- Updaters used by the modal
    const setProfile = (next: Partial<AccountProfile>) => {
      setProfileState((p) => ({ ...p, ...next }));
      setHasChanges(true);
    };

    // --- Load profile from backend once on mount
    useEffect(() => {
      const get = async () => {
        try {
          const accountProfile = await this.oiSvc.Users.GetProfile();
          setProfileState(accountProfile);
          setHasChanges(false);
        } catch (err) {
          console.error('Failed to load account profile', err);
        }
      };

      get();
    }, []);

    // --- Persistence
    const save = async () => {
      await this.oiSvc.Users.UpdateProfile(profile);
      setHasChanges(false);
    };

    const signOut = () => {
      console.log('Signing out...');

      location.assign(
        `/oauth/signout?success_url=https://auth.openindustrial.co/fathymcloudprd.onmicrosoft.com/b2c_1_sign_up_sign_in/oauth2/v2.0/logout?post_logout_redirect_uri=${location.origin}`,
      );
      return Promise.resolve();
    };

    const deleteAccount = async () => {
      const ok1 = confirm('Permanently delete your account? There is no undo.');
      const ok2 = ok1 &&
        confirm(
          'Workspaces owned solely by this account will be lost. Continue?',
        );
      if (!ok2) return Promise.resolve();

      await this.oiSvc.Users.DeleteAccount();

      console.warn('🗑️ [UseAccountProfile] account deleted');

      await signOut();
    };

    return {
      profile,
      hasChanges,

      setProfile,

      save,
      deleteAccount,
      signOut,
    };
  }

  public UseAzureAuth(): {
    isAzureConnected: boolean;
    loading: boolean;
    error?: string;
    canUseManaged: boolean;
    canUsePrivate: boolean;
    refreshAzureStatus: () => void;
  } {
    const [isAzureConnected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>(undefined);

    const load = useCallback(async () => {
      try {
        setLoading(true);
        setError(undefined);
        const res = await fetch('/workspace/api/azure/status');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setConnected(!!data?.connected || !!data?.Connected);
      } catch (err) {
        setError((err as Error).message);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      load();
    }, [load]);

    return {
      isAzureConnected,
      loading,
      error,
      canUseManaged: this.accessRights?.includes('Workspace.Infrastructure.Managed') ??
        false,
      canUsePrivate: this.accessRights?.includes('Workspace.Infrastructure.Private') ??
        false,
      refreshAzureStatus: load,
    };
  }

  public UseAzi(aziMgr: AziManager): {
    state: AziState;
    isSending: boolean;
    send: (
      text: string,
      extraInputs?: Record<string, unknown>,
    ) => Promise<void>;
    peek: (inputs?: Record<string, unknown>) => Promise<void>;
    scrollRef: RefObject<HTMLDivElement>;
    registerStreamAnchor: (el: HTMLElement | null) => void;
    isAutoScrolling: boolean;
  } {
    const [state, setState] = useState(aziMgr.GetState());
    const [isSending, setIsSending] = useState(aziMgr.IsSending());

    const scrollRef = useRef<HTMLDivElement>(null);
    const streamAnchorRef = useRef<HTMLElement | null>(null);
    const hasScrolledInitially = useRef(false);

    const animateScroll = (container: HTMLDivElement) => {
      requestAnimationFrame(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });

        console.log(
          '[UseAzi] ✅ Initial scroll to bottom:',
          container.scrollHeight,
        );
      });
    };

    // === Scroll to bottom once on first non-empty message render
    useLayoutEffect(() => {
      const container = scrollRef.current;
      if (!container) {
        console.log('[UseAzi] ❌ No scroll container');
        return;
      }

      if (hasScrolledInitially.current) {
        console.log('[UseAzi] ⚠️ Already scrolled initially — skipping');
        return;
      }

      if (state.Messages.length <= 1) {
        console.log('[UseAzi] ⏳ No messages yet — waiting');
        return;
      }

      animateScroll(container);
    }, [state.Messages]);

    // === Keep state synced
    useEffect(() => {
      const update = () => {
        setState(aziMgr.GetState());
        setIsSending(aziMgr.IsSending());

        animateScroll(scrollRef.current!);
      };
      return aziMgr.OnStateChanged(update);
    }, []);

    const registerStreamAnchor = (el: HTMLElement | null) => {
      streamAnchorRef.current = el;
    };

    const send = async (
      text: string,
      extraInputs?: Record<string, unknown>,
    ) => {
      await aziMgr.Send(text, extraInputs);
      hasScrolledInitially.current = true;
      setIsSending(aziMgr.IsSending());
    };

    const peek = async (inputs?: Record<string, unknown>) => {
      await aziMgr.Peek(inputs);
      setIsSending(aziMgr.IsSending());
    };

    return {
      state,
      isSending,
      send,
      peek,
      scrollRef,
      registerStreamAnchor,
      isAutoScrolling: true,
    };
  }

  public UseBreadcrumb(): BreadcrumbPart[] {
    const eac = this.UseEaC();
    const { currentScope, currentScopeData } = this.UseScopeSwitcher();

    const [pathParts, setPathParts] = useState<BreadcrumbPart[]>([
      { label: 'Loading...', intentType: IntentTypes.Info },
      { label: 'Workspace', intentType: IntentTypes.Primary },
    ]);

    useEffect(() => {
      const name = eac?.Details?.Name ?? 'Loading...';

      if (currentScope === 'workspace') {
        setPathParts([
          {
            label: `${name} (Workspace)`,
          },
        ]);
      } else {
        const surfaceLookup = currentScopeData.Lookup!;
        const surfaceName = eac.Surfaces?.[surfaceLookup]?.Details?.Name ?? 'Unknown Surface';

        setPathParts([
          {
            label: `${name} (Workspace)`,
            onClick: () => this.SwitchToScope('workspace'),
          },
          {
            label: `${surfaceName} (Surface)`,
          },
        ]);
      }
    }, [eac?.Details?.Name, currentScope]);

    return pathParts;
  }

  public UseCommits(): CommitStatusStore {
    return this.commitsStore;
  }

  public UseEaC(): EverythingAsCodeOIWorkspace {
    const [eac, setEaC] = useState(this.EaC.GetEaC());

    useEffect(() => {
      const unsubscribe = this.EaC.OnEaCChanged(() => {
        setEaC(this.EaC.GetEaC());
      });

      return unsubscribe;
    }, []);

    return eac;
  }

  public UseGraphView(): { nodes: Node<FlowNodeData>[]; edges: Edge[] } {
    const [nodes, setNodes] = useState(this.Graph.GetNodes());
    const [edges, setEdges] = useState(this.Graph.GetEdges());

    useEffect(() => {
      const update = () => {
        setNodes(this.Graph.GetNodes());
        setEdges(this.Graph.GetEdges());
      };

      const unsubscribe = this.Graph.OnGraphChanged(update);
      return unsubscribe;
    }, []);

    return { nodes, edges };
  }

  public UseHistory(): {
    canUndo: boolean;
    canRedo: boolean;
    hasChanges: boolean;
    isDeploying: boolean;
    version: number;
    undo: () => void;
    redo: () => void;
    commit: () => Promise<void>;
    deploy: () => Promise<void>;
    revert: () => void;
    fork: () => void;
  } {
    const [canUndo, setCanUndo] = useState(this.History.CanUndo());
    const [canRedo, setCanRedo] = useState(this.History.CanRedo());
    const [isDeploying, setIsDeploying] = useState(false);
    const [hasChanges, setHasChanges] = useState(
      this.History.HasUnsavedChanges(),
    );
    const [version, setVersion] = useState(this.History.GetVersion());

    useEffect(() => {
      const update = () => {
        setCanUndo(this.History.CanUndo());
        setCanRedo(this.History.CanRedo());
        setHasChanges(this.History.HasUnsavedChanges());
        setVersion(this.History.GetVersion());
      };

      const unsubscribe = this.History.OnChange(update);

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (this.History.HasUnsavedChanges()) {
          e.preventDefault();
          e.returnValue = ''; // Required for Chrome
        }
      };

      addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, []);

    return {
      canUndo,
      canRedo,
      hasChanges,
      isDeploying,
      version,
      undo: () => this.Undo(),
      redo: () => this.Redo(),
      commit: async () => {
        const validation = this.ValidateGraph();
        if (validation.errors.length > 0) {
          console.warn(
            '[WorkspaceManager] Validation failed before commit:',
            validation,
          );
          // Do not commit here; caller UI should show a modal using ValidateGraph()
          return;
        }
        await this.Commit();
      },
      deploy: async () => {
        setIsDeploying(true);

        const result = await this.Deploy();

        setTimeout(() => setIsDeploying(false), 0);

        return result;
      },
      revert: () => this.RevertToLastCommit(),
      fork: () => this.Fork(),
    };
  }

  public UseImpulseStream(filters?: Partial<ImpulseStreamFilter>): {
    impulses: RuntimeImpulse[];
    connect: () => void;
    disconnect: () => void;
    setFilters: (filters: Partial<ImpulseStreamFilter>) => void;
  } {
    const [impulses, setImpulses] = useState<RuntimeImpulse[]>([]);

    useEffect(() => {
      const unsub = this.Impulses.OnChanged(() => {
        setImpulses([...this.Impulses.GetImpulses()]);
      });

      this.Impulses.SetFilters(filters ?? {});
      this.Impulses.Connect();

      return () => {
        unsub();
        this.Impulses.Disconnect();
      };
    }, [JSON.stringify(filters)]);

    return {
      impulses,
      connect: () => this.Impulses.Connect(),
      disconnect: () => this.Impulses.Disconnect(),
      setFilters: (f) => this.Impulses.SetFilters(f),
    };
  }

  public UseInspector(): {
    selected: Node<FlowNodeData> | null;
    selectedId: string | undefined;
    inspectorProps: InspectorCommonProps | undefined;
  } {
    const { currentScopeData } = this.UseScopeSwitcher();
    const { selected } = this.UseSelection();
    const selectedId = selected?.id;

    const [details, setDetails] = useState<EaCVertexDetails>({});
    const [enabled, setEnabled] = useState<boolean>(false);

    const [inspectorProps, setInspectorProps] = useState<
      InspectorCommonProps | undefined
    >();

    const handleDetailsChanged = useCallback(
      (next: Partial<EaCVertexDetails>) => {
        setDetails((prev): EaCVertexDetails => {
          const merged = merge<EaCVertexDetails>(prev, next);

          // Normalize: trim strings and drop empties
          const normalized: EaCVertexDetails = { ...merged };
          for (const k of Object.keys(normalized)) {
            const v = (normalized as any)[k];
            if (typeof v === 'string') {
              const t = v.trim();
              if (t.length === 0) {
                delete (normalized as any)[k];
              } else {
                (normalized as any)[k] = t;
              }
            }
          }

          if (selectedId) {
            // Compute removed string keys (e.g., user cleared a field)
            const removed: string[] = [];
            for (const k of Object.keys(prev)) {
              const pv = (prev as any)[k];
              if (typeof pv === 'string' && !(k in normalized)) removed.push(k);
            }

            // Only push when the normalized differs from current
            const current = this.EaC.GetNodeAsCode(selectedId)?.Details ?? {};
            const stable = (obj: unknown) => {
              const norm = (v: unknown): unknown => {
                if (Array.isArray(v)) return v.map((x) => norm(x));
                if (v && typeof v === 'object') {
                  const o = v as Record<string, unknown>;
                  const keys = Object.keys(o).sort();
                  const out: Record<string, unknown> = {};
                  for (const k of keys) out[k] = norm(o[k]);
                  return out;
                }
                return v;
              };
              return JSON.stringify(norm(obj));
            };

            if (stable(current) !== stable(normalized)) {
              this.EaC.UpdateNodePatch(selectedId, { Details: normalized });
              console.log(
                '[UseInspector] Live-synced EaC details for node',
                selectedId,
              );
            }

            // If any keys were removed, derive a delete patch generically via capability mapping
            if (removed.length) {
              try {
                const sentinel = '__OI_DELETE__';
                const detailsSentinel: Record<string, string> = {};
                for (const k of removed) detailsSentinel[k] = sentinel;

                // Build capability-scoped update patch to discover the placement of Details for this node
                const graphNode = {
                  ID: selectedId,
                  Type: selected!.type!,
                } as any;
                const ctx = {
                  GetEaC: () => this.EaC.GetEaC(),
                  SurfaceLookup: currentScopeData.Lookup!,
                } as any;
                const cap = this.EaC.GetCapabilities();
                const probe = cap.BuildUpdatePatch(
                  graphNode,
                  { Details: detailsSentinel },
                  ctx,
                ) as Record<string, unknown>;

                // Project only the sentinel-bearing branch and convert to MergeDelete shape
                const toDeleteOnly = (v: unknown): unknown => {
                  if (v === sentinel) return null;
                  if (Array.isArray(v)) return undefined;
                  if (v && typeof v === 'object') {
                    const out: Record<string, unknown> = {};
                    for (
                      const [k, val] of Object.entries(
                        v as Record<string, unknown>,
                      )
                    ) {
                      const child = toDeleteOnly(val);
                      if (child !== undefined) out[k] = child;
                    }
                    return Object.keys(out).length ? out : undefined;
                  }
                  return undefined;
                };

                const del = toDeleteOnly(probe);
                if (
                  del &&
                  typeof del === 'object' &&
                  Object.keys(del as Record<string, unknown>).length
                ) {
                  this.EaC.MergeDelete(del as any);
                  console.log(
                    '[UseInspector] Deleted fields for',
                    selectedId,
                    removed,
                  );
                }
              } catch (err) {
                console.warn(
                  '[UseInspector] Failed to compute generic delete patch',
                  err,
                );
              }
            }
          }

          return normalized;
        });
      },
      [selectedId, selected],
    );

    const handleToggleEnabled = useCallback(
      (val: boolean) => {
        if (selectedId) {
          this.EaC.UpdateNodePatch(selectedId, {
            Metadata: { Enabled: val },
          });

          console.log(
            `🟡 Toggled enabled state for node ${selectedId} → ${val}`,
          );
          setEnabled(val);
        }
      },
      [selectedId],
    );

    const handleNodeEvent = useCallback(() => {
      this.NodeEvents.Emit('surface', { Type: 'manage', NodeID: selectedId! });
    }, [selectedId]);

    const handleDeleteNode = useCallback(() => {
      if (!selectedId) return;

      console.log(`🗑️ Deleting node ${selectedId}`);
      this.EaC.DeleteNode(selectedId);
      this.Selection.ClearSelection();
    }, [selectedId]);

    useEffect(() => {
      if (!selectedId) return;

      const code = this.EaC.GetNodeAsCode(selectedId);
      setDetails({ ...(code?.Details ?? {}) });
      setEnabled(code?.Metadata?.Enabled ?? false);
    }, [selectedId]);

    useEffect(() => {
      if (!selected) {
        setInspectorProps(undefined);
        return;
      }

      const presetConfig = this.EaC.GetCapabilities().GetConfig(selected.id, selected.type!) ?? {};

      setInspectorProps({
        lookup: selectedId!,
        surfaceLookup: currentScopeData.Lookup!,
        config: presetConfig,
        details,
        enabled,
        useStats: selected.data?.useStats ?? (() => undefined),
        onDelete: handleDeleteNode,
        onDetailsChanged: handleDetailsChanged,
        onNodeEvent: handleNodeEvent,
        onToggleEnabled: handleToggleEnabled,
        oiSvc: this.oiSvc,
        workspaceMgr: this,
      });
    }, [
      selected,
      selectedId,
      details,
      enabled,
      handleDeleteNode,
      handleDetailsChanged,
      handleToggleEnabled,
    ]);

    return {
      selected,
      selectedId,
      inspectorProps,
    };
  }

  public UseInspectorSettings(): {
    settings: Partial<FlowNodeData>;
    updateSettings: (next: Partial<FlowNodeData>) => void;
    saveSettings: () => void;
  } {
    const { selected } = this.UseSelection();
    const [settings, setSettings] = useState<Partial<FlowNodeData>>({});

    useEffect(() => {
      if (selected) {
        setSettings({ ...selected.data });
      }
    }, [selected]);

    const updateSettings = (next: Partial<FlowNodeData>) => {
      setSettings((prev) => ({ ...prev, ...next }));
    };

    const saveSettings = () => {
      if (!selected) return;
      selected.data = { ...selected.data, ...settings };
    };

    return {
      settings,
      updateSettings,
      saveSettings,
    };
  }

  public UseInteraction(): {
    handleDrop: (
      event: DragEvent,
      toFlow: (point: XYPosition) => XYPosition,
    ) => void;
    handleConnect: (params: Connection) => void;
    handleNodeClick: (_e: unknown, node: Node<FlowNodeData>) => void;
    handleNodesChange: (changes: NodeChange[], nodes: Node[]) => void;
    handleEdgesChange: (changes: EdgeChange[], edges: Edge[]) => void;
  } {
    const handleDrop = useCallback(
      (event: DragEvent, toFlow: (point: XYPosition) => XYPosition) => {
        this.Interaction.HandleDrop(event, this.Graph.GetNodes(), toFlow);
      },
      [],
    );

    const handleConnect = useCallback((params: Connection) => {
      if (params.source && params.target) {
        this.Interaction.ConnectNodes(params.source, params.target);
      }
    }, []);

    const handleNodeClick = useCallback(
      (_e: unknown, node: Node<FlowNodeData>) => {
        this.Selection.SelectNode(node.id);
      },
      [],
    );

    const handleNodesChange = useCallback(
      (changes: NodeChange[], nodes: Node[]) => {
        this.Interaction.OnNodesChange(changes, nodes ?? this.Graph.GetNodes());
      },
      [],
    );

    const handleEdgesChange = useCallback(
      (changes: EdgeChange[], edges: Edge[]) => {
        this.Interaction.OnEdgesChange(changes, edges ?? this.Graph.GetEdges());
      },
      [],
    );

    return {
      handleDrop,
      handleConnect,
      handleNodeClick,
      handleNodesChange,
      handleEdgesChange,
    };
  }

  public UseLicenses(parentEaC: EverythingAsCode & EverythingAsCodeLicensing): {
    license?: EaCLicenseAsCode;
    licLookup?: string;
    userLicense?: EaCUserLicense;
    stripePublishableKey?: string;
    isMonthly: boolean;
    activePlan?: string;
    clientSecret?: string;
    error: string;
    licenseLoading: boolean;
    activateMonthly: () => Promise<void>;
    activatePlan: (planLookup: string, isMonthly: boolean) => Promise<void>;
    setActivePlan: (lookup: string | undefined) => void;
    setIsMonthly: (monthly: boolean) => void;
  } {
    const [license, setLicense] = useState<EaCLicenseAsCode | undefined>();
    const [licLookup, setLicLookup] = useState<string | undefined>();
    const [stripePublishableKey, setStripePublishableKey] = useState<
      string | undefined
    >();
    const [userLicense] = useState<EaCUserLicense | undefined>(undefined);
    const [isMonthly, setIsMonthly] = useState(true);
    const [activePlan, setActivePlan] = useState<string | undefined>(
      this.userLicense?.PlanLookup,
    );
    const [clientSecret, setClientSecret] = useState<string | undefined>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const lookup = Object.keys(parentEaC.Licenses ?? {})[0];

      if (lookup) {
        setLicLookup(lookup);
        const lic = parentEaC.Licenses![lookup];
        setLicense(lic);
        const details: any = lic.Details;
        setStripePublishableKey(details?.PublishableKey);
      }
    }, []);

    const activateMonthly = async () => {
      const next = !isMonthly;
      setIsMonthly(next);

      if (activePlan) {
        await activatePlan(activePlan, next);
      }
    };

    const activatePlan = async (
      planLookup: string,
      monthly: boolean,
    ): Promise<void> => {
      if (!license || !licLookup) return;

      const interval = monthly ? 'month' : 'year';

      const plans = Object.keys(license.Plans)
        .map((pl) => {
          const plan = license.Plans[pl];

          const prices = Object.keys(plan.Prices).map((pr) => {
            const price = plan.Prices[pr];

            return {
              Lookup: `${pl}-${price.Details!.Interval}`,
              PlanLookup: pl,
              PriceLookup: pr,
              Interval: price.Details!.Interval,
            };
          });

          return prices;
        })
        .flatMap((p) => p);

      const selected = plans.find(
        (p) => p.Lookup === `${planLookup}-${interval}`,
      );
      if (!selected) return;

      setLoading(true);
      setError('');

      try {
        const resp = await fetch(
          `/workspace/api/${licLookup}/licensing/subscribe`,
          {
            method: 'POST',
            body: JSON.stringify({
              LicenseLookup: licLookup,
              PlanLookup: planLookup,
              PriceLookup: selected.PriceLookup,
              SubscriptionID: '',
            } as EaCUserLicense),
          },
        );

        const licData = await resp.json();

        if (licData?.Subscription) {
          if (licData.Subscription.latest_invoice.payment_intent) {
            setClientSecret(
              licData.Subscription.latest_invoice.payment_intent.client_secret,
            );
          } else {
            location.reload();
          }
          setActivePlan(planLookup);
        } else if (licData?.Error) {
          setError(licData.Error);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    return {
      license,
      licLookup,
      userLicense,
      stripePublishableKey,
      isMonthly,
      activePlan,
      clientSecret,
      error,
      licenseLoading: loading,
      activateMonthly,
      activatePlan,
      setActivePlan,
      setIsMonthly,
    };
  }

  public UseScopeSwitcher(): {
    currentScope: NodeScopeTypes;
    currentScopeData: { Scope: NodeScopeTypes; Lookup?: string };
    switchToScope: (scope: NodeScopeTypes, lookup?: string) => void;
  } {
    const [scopeCtx, setScopeCtx] = useState({ ...this.currentScope });

    useEffect(() => {
      const unsubscribe = this.Graph.OnGraphChanged(() => {
        // Optional: Scope doesn't directly change from graph, but if you wire up
        // a more proper observer (e.g., this.OnScopeChanged) you can hook into that instead
        setScopeCtx(this.currentScope);
      });

      return unsubscribe;
    }, []);

    const switchToScope = (scope: NodeScopeTypes, lookup?: string) => {
      this.SwitchToScope(scope, lookup);

      setScopeCtx({ Scope: scope, Lookup: lookup });
    };

    return {
      currentScope: scopeCtx.Scope,
      currentScopeData: scopeCtx,
      switchToScope,
    };
  }

  public UseSelection(): {
    selected: Node<FlowNodeData> | null;
    setSelected: Dispatch<StateUpdater<Node<FlowNodeData> | null>>;
  } {
    const [selected, setSelected] = useState<Node<FlowNodeData> | null>(
      this.Selection.GetSelectedNodes(this.Graph.GetNodes())[0] ?? null,
    );

    useEffect(() => {
      const update = () => {
        const node = this.Selection.GetSelectedNodes(this.Graph.GetNodes())[0] ?? null;
        setSelected(node);
      };

      const unsubscribe = this.Selection.OnSelectionChanged(update);
      return () => unsubscribe();
    }, []);

    return { selected, setSelected };
  }

  public UseStats<TStats extends Record<string, unknown>>(
    id: string,
    intervalMs = 100000,
  ): TStats | undefined {
    const [stats, setStats] = useState<TStats>({} as TStats);

    useEffect(() => {
      let mounted = true;

      const fetch = async () => {
        try {
          const res = await this.EaC.GetStats(id);
          if (mounted) setStats(res as TStats);
        } catch (err) {
          console.warn(`[StatManager.UseStats] Failed for ${id}`, err);
        }
      };

      fetch(); // Prime
      const interval = setInterval(fetch, intervalMs);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }, [id]);

    return stats;
  }

  public UseUIContext(): {
    presets: Record<string, NodePreset>;
    nodeTypes: Record<string, ComponentType>;
  } {
    const [presets, setPresets] = useState<Record<string, NodePreset>>({});
    const [nodeTypes, setNodeTypes] = useState<Record<string, ComponentType>>(
      {},
    );

    useEffect(() => {
      const update = () => {
        try {
          const capabilityMgr = this.EaC.GetCapabilities();
          setPresets(capabilityMgr.GetPresets());
          setNodeTypes(capabilityMgr.GetRendererMap());
        } catch (err) {
          console.warn('⚠️ EaC scopeMgr not ready yet in UseUIContext:', err);
          setPresets({});
          setNodeTypes({});
        }
      };

      // Prime immediately
      update();

      // Subscribe to EaC changes
      const unsubscribe = this.EaC.OnEaCChanged(update);

      return () => unsubscribe();
    }, []);

    return {
      presets,
      nodeTypes,
    };
  }

  /**
   * Grant a user an access card that includes a specific access right lookup.
   * Defaults to granting the workspace deploy right.
   */
  public async GrantDeployAccess(
    username: string,
    rightLookup: string = 'Workspace.Deploy',
  ): Promise<void> {
    if (!username) return;

    const identity = await this.oiSvc.Admin.GetEaC<EverythingAsCodeIdentity>();
    const acs = identity?.AccessConfigurations ?? {};

    const match = Object.entries(acs).find(([_, ac]) => {
      const rights = (ac as any)?.AccessRightLookups ?? (ac as any)?.AccessRights ?? [];
      return Array.isArray(rights) && rights.includes(rightLookup);
    });

    if (!match) {
      throw new Error(
        `No Access Configuration found containing right '${rightLookup}'. Configure one under /admin/access-cards.`,
      );
    }

    const [acLookup] = match;
    await this.oiSvc.Admin.AddUserAccessCard(username, acLookup);
  }

  public UseWorkspaceSettings(): {
    currentWorkspace: WorkspaceSummary;
    teamMembers: EaCUserRecord[];
    inviteMember: (
      email: string,
      role: TeamMember['Role'],
      name?: string,
    ) => void;
    grantDeployAccess: (username: string) => Promise<void>;
    removeMember: (email: string) => Promise<void>;
    updateMemberRole: (email: string, role: TeamMember['Role']) => void;
    update: (next: Partial<EaCEnterpriseDetails>) => void;
    save: () => Promise<void>;
    archive: () => void;
    hasChanges: boolean;
    listWorkspaces: () => void;
    workspaces: WorkspaceSummary[];
    switchToWorkspace: (_lookup: string) => void;
    createWorkspace: (name: string, description?: string) => Promise<void>;
  } {
    const getCurrentWorkspace = (): WorkspaceSummary => {
      const eac = this.EaC.GetEaC();

      return {
        Lookup: eac.EnterpriseLookup!,
        Details: eac.Details!,
        Views: 0,
        Forks: 0,
        UpdatedAt: (eac.Details?.UpdatedAt ?? eac.Details?.CreatedAt) as string,
        Archived: false,
      };
    };

    const [current, setCurrent] = useState<WorkspaceSummary>(
      getCurrentWorkspace(),
    );
    const [hasChanges, setHasChanges] = useState(
      this.History.HasUnsavedChanges(),
    );

    useEffect(() => {
      const update = () => {
        setCurrent(getCurrentWorkspace());
        setHasChanges(this.History.HasUnsavedChanges());
      };

      const unsubscribe = this.History.OnChange(update);
      return () => unsubscribe();
    }, []);

    const [teamMembers, setTeamMembers] = useState<EaCUserRecord[]>([]);

    // Load initial users on mount and whenever the TeamManager instance changes.
    useEffect(() => {
      let cancelled = false;

      (async () => {
        try {
          const users = await this.Team?.ListUsers?.();
          if (!cancelled) setTeamMembers(users ?? []);
        } catch (err) {
          console.error('Failed to load team members', err);
          if (!cancelled) setTeamMembers([]); // fallback
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [this.Team]);

    // Keep teamMembers in sync with TeamManager changes.
    useEffect(() => {
      const unsubscribe = this.Team?.OnChange?.(() => {
        // Run the async call inside the sync callback.
        (async () => {
          try {
            const users = await this.Team.ListUsers();
            setTeamMembers(users ?? []);
          } catch (err) {
            console.error('Failed to refresh team members', err);
          }
        })();
      });

      return () => unsubscribe?.();
    }, [this.Team]);

    const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);

    const listWorkspaces = (): void => {
      this.EaC.List?.().then((results) => {
        setWorkspaces(results ?? []);
      });
    };

    useEffect(() => {
      listWorkspaces();
    }, []);

    const createWorkspace = async (name: string, description?: string) => {
      const trimmedName = (name || '').trim();
      if (!trimmedName) return;

      try {
        const res = await fetch('/workspace/api/workspaces/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            Name: trimmedName,
            Description: description ?? '',
          }),
        });

        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(
            errMsg || `Failed to create workspace (${res.status})`,
          );
        }

        const result = await res.json() as {
          EnterpriseLookup?: string;
        };

        if (result?.EnterpriseLookup) {
          switchToWorkspace(result.EnterpriseLookup);
        } else {
          listWorkspaces();
        }
      } catch (err) {
        console.error('Workspace creation failed', err);
        alert('Failed to create workspace. Please try again.');
      }
    };

    const update = (next: Partial<EaCEnterpriseDetails>) => {
      this.EaC.UpdateWorkspace(next);

      setCurrent(getCurrentWorkspace());
    };

    const save = async () => {
      await this.Commit();

      console.log('💾 Saved workspace details');

      // Refresh list so Manage Workspaces reflects latest name/desc
      listWorkspaces();
    };

    const archive = () => {
      const name = current.Details.Name ?? 'this workspace';

      const confirmed = confirm(
        `Are you sure you want to archive ${name}? This will remove it from the current session.`,
      );

      if (!confirmed) return;

      this.EaC.Archive?.().then(() => {
        location.reload();
      });
    };

    const inviteMember = (
      email: string,
      role: TeamMember['Role'],
      name?: string,
    ) => {
      if (!email) return;
      this.Team?.InviteUser?.(email, role, name);
    };

    const removeMember = async (email: string) => {
      await this.Team?.RemoveUser?.(email);
    };

    const updateMemberRole = (email: string, role: TeamMember['Role']) => {
      this.Team?.UpdateUserRole?.(email, role);
    };

    const switchToWorkspace = (_lookup: string) => {
      try {
        // Submit a full-page POST so server can set KV and issue redirect
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/workspace/api/workspaces/active';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'WorkspaceLookup';
        input.value = _lookup;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        console.error('Failed to set active workspace (form submit)', err);
        // Last-resort fallback
        location.href = '/workspace';
      }
    };

    return {
      currentWorkspace: current,
      teamMembers,
      inviteMember,
      grantDeployAccess: async (username: string) => await this.GrantDeployAccess(username),
      removeMember,
      updateMemberRole,
      update,
      save,
      archive,
      hasChanges,
      listWorkspaces,
      workspaces,
      switchToWorkspace,
      createWorkspace,
    };
  }

  // === History Actions ===

  public async Commit(): Promise<void> {
    const history = this.History.GetCurrent();

    const status = await this.EaC.Commit(history);

    if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
      this.History.Commit();
    }
  }

  // Validate all graph nodes against their capability managers
  public ValidateGraph(): {
    errors: Array<{
      node: { ID: string; Type: string; Label?: string };
      issues: { code?: string; field?: string; message: string }[];
    }>;
  } {
    const nodes = this.Graph.GetGraph().Nodes;
    const caps = this.EaC.GetCapabilities();
    // Validate against the current in-memory snapshot (including unsaved diffs)
    const snapshot = this.History.GetCurrent();
    const liveEaC = snapshot.eac;
    const ctx = {
      GetEaC: () => liveEaC,
      ...(this.currentScope.Scope === 'surface' && this.currentScope.Lookup
        ? { SurfaceLookup: this.currentScope.Lookup }
        : {}),
    } as any;

    const errors: Array<{
      node: { ID: string; Type: string; Label?: string };
      issues: { code?: string; field?: string; message: string }[];
    }> = [];

    for (const n of nodes) {
      const cap = caps.GetCapabilityFor(n);
      const hasValidate = cap && typeof (cap as any).Validate === 'function';
      if (!hasValidate) continue;

      const res = (cap as any).Validate(n, ctx);
      if (
        res &&
        res.valid === false &&
        Array.isArray(res.errors) &&
        res.errors.length
      ) {
        errors.push({
          node: { ID: n.ID, Type: n.Type, Label: n.Label },
          issues: res.errors,
        });
      }
    }

    return { errors };
  }

  public async Deploy(): Promise<void> {
    const status = await this.EaC.Deploy();

    if (status.Processing === EaCStatusProcessingTypes.COMPLETE) {
      location.reload();
    }
  }

  public Fork(): void {
    const forked = this.History.ForkRuntime();
    console.log('🌱 Forked runtime snapshot:', forked);
  }

  public HasUnsavedChanges(): boolean {
    return this.History.HasUnsavedChanges();
  }

  public RevertToLastCommit(): void {
    const snapshot = this.History.RevertToLastCommit();
    if (snapshot) {
      this.EaC.ResetFromSnapshot(snapshot);
      console.log('🔄 Reverted to last commit');
    }
  }

  public Undo(): void {
    const snapshot = this.History.Undo();
    if (snapshot) {
      this.EaC.ResetFromSnapshot(snapshot);
      console.log('↩️ Undo successful');
    }
  }

  public Redo(): void {
    const snapshot = this.History.Redo();
    if (snapshot) {
      this.EaC.ResetFromSnapshot(snapshot);
      console.log('↪️ Redo successful');
    }
  }

  public async ListCommits(): Promise<EaCStatus[]> {
    return await this.oiSvc.Workspaces.ListCommitStatuses();
  }

  public async GetCommitStatus(id: string): Promise<EaCStatus> {
    return await this.oiSvc.Workspaces.GetCommitStatus(id);
  }

  public ReloadCapabilities(
    capabilitiesByScope: Record<NodeScopeTypes, EaCNodeCapabilityManager[]>,
  ): void {
    this.EaC.LoadCapabilities(capabilitiesByScope);

    this.SwitchToScope(this.currentScope.Scope, this.currentScope.Lookup);
  }

  public SwitchToScope(scope: NodeScopeTypes, lookup?: string): void {
    console.log(`🔀 Switching scope to: ${scope} (${lookup})`);

    // Update internal scope reference
    this.currentScope = { Scope: scope, Lookup: lookup };
    this.persistScope(scope, lookup);

    // Clear selection before switching
    this.Selection.ClearSelection();

    // Delegate the actual scope swap and graph rebuild to the EaCManager
    this.EaC.SwitchTo(scope, lookup);

    // You may also want to trigger a stat refresh or reset other managers if needed
    // e.g., this.Stats.Reset(); this.Runtime.Rebind();

    // Optionally, you could emit a custom hook event or callback here
  }

  protected persistScope(scope: NodeScopeTypes, lookup?: string): void {
    if (!this.EnterpriseLookup) return;

    if (scope === 'surface' && !lookup) return;

    const payload: PersistedScopePayload = {
      scope,
      lookup: scope === 'surface' ? lookup : undefined,
    };

    writePersistedScope(
      this.EnterpriseLookup as string,
      payload,
      this.username,
    );
  }
}

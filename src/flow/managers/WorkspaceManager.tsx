import {
  ComponentType,
  Connection,
  Dispatch,
  EaCEnterpriseDetails,
  EaCStatusProcessingTypes,
  EaCVertexDetails,
  Edge,
  EdgeChange,
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
import {
  ImpulseStreamFilter,
  ImpulseStreamManager,
} from './ImpulseStreamManager.ts';
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
import {
  RuntimeImpulse,
  RuntimeImpulseSources,
} from "../../types/RuntimeImpulse.ts";
import { IntentStyleMap } from "../../../atomic/utils/getIntentStyles.ts";
import { impulseSourceColorMap } from "../../../atomic/utils/impulseSourceColorMap.ts";
import {
  AccountProfileModal,
  BillingDetailsModal,
  CurrentLicenseModal,
  DataAPISuiteModal,
  ManageWorkspacesModal,
  SimulatorLibraryModal,
  TeamManagementModal,
  WarmQueryAPIsModal,
  WorkspaceSettingsModal,
} from "../../../atomic/organisms/modals/.exports.ts";
import { MenuActionItem } from "../../../atomic/molecules/FlyoutMenu.tsx";

export type AccountProfile = {
  Name: string;
  Email: string;
  Username: string;
  Password?: string; // write-only
  AvatarUrl?: string;
  Bio?: string;
  Location?: string;
  Website?: string;
  Additional?: string; // <-- unify name with modal
  CreatedAt?: string;
  ID?: string;
};

export type TeamMembership = {
  Lookup: string; // team id
  Team: string; // team display name
  Role: 'Owner' | 'Editor' | 'Viewer';
  MemberSince: string; // friendly text
};

export class WorkspaceManager {
  protected currentScope: {
    Scope: NodeScopeTypes;

    Lookup?: string;
  };

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

  constructor(
    eac: EverythingAsCodeOIWorkspace,
    protected oiSvc: OpenIndustrialAPIClient,
    capabilitiesByScope: Record<NodeScopeTypes, EaCNodeCapabilityManager[]>,
    scope: NodeScopeTypes = 'workspace',
    aziCircuitUrl: string,
    jwt?: string
  ) {
    this.currentScope = { Scope: scope };

    this.Azi = new AziManager({
      url: aziCircuitUrl,
      jwt,
      threadId: `workspace-${eac.EnterpriseLookup}`,
    });

    this.History = new HistoryManager();
    this.Selection = new SelectionManager();
    this.Simulators = new SimulatorLibraryManager();
    this.Team = new TeamManager();

    this.NodeEvents = new NodeEventManager(this);

    this.Impulses = new ImpulseStreamManager(this.oiSvc);
    this.Interaction = new InteractionManager(this.Selection);

    this.Graph = new GraphStateManager(
      this.Interaction,
      (id: string) => this.UseStats(id),
      this.NodeEvents
    );

    this.EaC = new EaCManager(
      eac,
      this.oiSvc,
      this.currentScope.Scope,
      this.Graph,
      this.History,
      capabilitiesByScope
    );

    this.Interaction.BindEaCManager(this.EaC);

    console.log('🚀 FlowManager initialized:', {
      scope: this.currentScope,
      nodes: this.Graph.GetNodes().length,
      edges: this.Graph.GetEdges().length,
    });
  }

  // === Hooks ===

  public UseAppMenu() {
    const { Modal: accProfModal, Show: showAccProf } =
      AccountProfileModal.Modal(this);
    const { Modal: mngWkspsModal, Show: showMngWksps } =
      ManageWorkspacesModal.Modal(this);
    const { Modal: simLibModal, Show: showSimLib } =
      SimulatorLibraryModal.Modal(this);
    const { Modal: teamMgmtModal, Show: showTeamMgmt } =
      TeamManagementModal.Modal(this);
    const { Modal: wkspSetsModal, Show: showWkspSets } =
      WorkspaceSettingsModal.Modal(this);
    const { Modal: warmQueryModal, Show: showWarmQuery } =
      WarmQueryAPIsModal.Modal(this);
    const { Modal: dataSuiteModal, Show: showDataSuite } =
      DataAPISuiteModal.Modal(this);
    const { Modal: billingModal, Show: showBilling } =
      BillingDetailsModal.Modal(this);
    const { Modal: licenseModal, Show: showLicense } =
      CurrentLicenseModal.Modal(this);

    const modals = (
      <>
        {simLibModal}
        {accProfModal}
        {mngWkspsModal}
        {teamMgmtModal}
        {wkspSetsModal}
        {warmQueryModal}
        {dataSuiteModal}
        {billingModal}
        {licenseModal}
      </>
    );

    const handleMenu = (item: MenuActionItem) => {
      console.log("menu", item);

      switch (item.id) {
        case "workspace.settings": {
          showWkspSets();
          break;
        }

        case "workspace.team": {
          showTeamMgmt();
          break;
        }

        case "workspace.viewAll": {
          showMngWksps();
          break;
        }

        case "apis.warmQuery": {
          showWarmQuery();
          break;
        }

        case "apis.dataSuite": {
          showDataSuite();
          break;
        }

        case "billing.details": {
          showBilling();
          break;
        }

        case "billing.license": {
          showLicense();
          break;
        }
      }
    };

    return {
      handleMenu,
      modals,
      showWkspSets,
      showTeamMgmt,
      showSimLib,
      showMngWksps,
      showAccProf,
      showWarmQuery,
      showDataSuite,
      showBilling,
      showLicense,
    };
  }

  public UseAccountProfile(): {
    profile: AccountProfile;
    teams: TeamMembership[];
    hasChanges: boolean;

    // used by modal
    setProfile: (next: Partial<AccountProfile>) => void;
    setAvatarUrl: (url: string) => void;

    updateTeamRole: (teamLookup: string, role: TeamMembership['Role']) => void;
    leaveTeam: (teamLookup: string) => void;

    save: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    signOut: () => Promise<void>;
  } {
    // Seed mock profile (hydrate from API in real impl)
    const initial: AccountProfile = {
      Name: 'Jane Doe',
      Email: 'jane.doe@factory.com',
      Username: 'jane_d',
      AvatarUrl: '',
      Bio: '',
      Location: '',
      Website: '',
      Additional: '',
      CreatedAt: '2025-07-01',
      ID: 'user_123',
    };

    const [profile, setProfileState] = useState<AccountProfile>(initial);
    const [hasChanges, setHasChanges] = useState(false);

    // Mock teams (swap to this.Team?.ListTeams?.() later)
    const [teams, setTeams] = useState<TeamMembership[]>([
      {
        Lookup: 'a',
        Team: 'Team A',
        Role: 'Viewer',
        MemberSince: '2 days ago',
      },
      {
        Lookup: 'b',
        Team: 'Team B',
        Role: 'Editor',
        MemberSince: '1 month ago',
      },
      {
        Lookup: 'c',
        Team: 'Team C',
        Role: 'Owner',
        MemberSince: '2 months ago',
      },
    ]);

    // --- Updaters used by the modal
    const setProfile = (next: Partial<AccountProfile>) => {
      setProfileState((p) => ({ ...p, ...next }));
      setHasChanges(true);
    };

    const setAvatarUrl = (url: string) => setProfile({ AvatarUrl: url });

    const updateTeamRole = (
      teamLookup: string,
      role: TeamMembership['Role']
    ) => {
      setTeams((prev) =>
        prev.map((t) => (t.Lookup === teamLookup ? { ...t, Role: role } : t))
      );
    };

    const leaveTeam = (teamLookup: string) => {
      // TODO: this.Team?.LeaveTeam?.(teamLookup)
      setTeams((prev) => prev.filter((t) => t.Lookup !== teamLookup));
    };

    // --- Persistence (mock)
    const save = async () => {
      const { Password: _pw, ...persistable } = profile;
      console.log('💾 [UseAccountProfile] saving profile →', persistable);

      if (profile.Password) {
        console.log('🔐 [UseAccountProfile] updating password (mock)…');
        // await this.oiSvc.Users.UpdatePassword(profile.Password)
      }

      setHasChanges(false);
      return Promise.resolve();
    };

    const signOut = async () => {
      console.log('Signing out...');
    };

    const deleteAccount = async () => {
      const ok1 = confirm('Permanently delete your account? There is no undo.');
      const ok2 =
        ok1 &&
        confirm(
          'Workspaces owned solely by this account will be lost. Continue?'
        );
      if (!ok2) return;

      // await this.oiSvc.Users.DeleteMyAccount()
      console.warn('🗑️ [UseAccountProfile] account deleted (mock)');
      location.assign('/'); // simulate sign-out
    };

    return {
      profile,
      teams,
      hasChanges,

      setProfile,
      setAvatarUrl,

      updateTeamRole,
      leaveTeam,

      save,
      deleteAccount,
      signOut,
    };
  }

  public UseAzi(): {
    state: AziState;
    isSending: boolean;
    send: (text: string) => Promise<void>;
    peek: (inputs?: Record<string, unknown>) => Promise<void>;
    scrollRef: RefObject<HTMLDivElement>;
    registerStreamAnchor: (el: HTMLElement | null) => void;
    isAutoScrolling: boolean;
  } {
    const [state, setState] = useState(this.Azi.GetState());
    const [isSending, setIsSending] = useState(this.Azi.IsSending());

    const scrollRef = useRef<HTMLDivElement>(null);
    const streamAnchorRef = useRef<HTMLElement | null>(null);
    const hasScrolledInitially = useRef(false);

    const animateScroll = (container: HTMLDivElement) => {
      requestAnimationFrame(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });

        console.log(
          '[UseAzi] ✅ Initial scroll to bottom:',
          container.scrollHeight
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
        setState(this.Azi.GetState());
        setIsSending(this.Azi.IsSending());

        animateScroll(scrollRef.current!);
      };
      return this.Azi.OnStateChanged(update);
    }, []);

    const registerStreamAnchor = (el: HTMLElement | null) => {
      streamAnchorRef.current = el;
    };

    const send = async (text: string) => {
      await this.Azi.Send(text);
      hasScrolledInitially.current = true;
      setIsSending(this.Azi.IsSending());
    };

    const peek = async (inputs?: Record<string, unknown>) => {
      await this.Azi.Peek(inputs);
      setIsSending(this.Azi.IsSending());
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
        const surfaceName =
          eac.Surfaces?.[surfaceLookup]?.Details?.Name ?? 'Unknown Surface';

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
    version: number;
    undo: () => void;
    redo: () => void;
    commit: () => Promise<void>;
    revert: () => void;
    fork: () => void;
  } {
    const [canUndo, setCanUndo] = useState(this.History.CanUndo());
    const [canRedo, setCanRedo] = useState(this.History.CanRedo());
    const [hasChanges, setHasChanges] = useState(
      this.History.HasUnsavedChanges()
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
      version,
      undo: () => this.Undo(),
      redo: () => this.Redo(),
      commit: () => this.Commit(),
      revert: () => this.RevertToLastCommit(),
      fork: () => this.Fork(),
    };
  }

  public UseImpulseStream(filters?: Partial<ImpulseStreamFilter>): {
    impulses: RuntimeImpulse[];
    impulseSourceColorMap: Record<RuntimeImpulseSources, IntentStyleMap>;
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
      impulseSourceColorMap,
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

          if (selectedId) {
            this.EaC.UpdateNodePatch(selectedId, { Details: merged });
            console.log(`🟢 Live-synced EaC details for node ${selectedId}`);
          }

          return merged;
        });
      },
      [selectedId]
    );

    const handleToggleEnabled = useCallback(
      (val: boolean) => {
        if (selectedId) {
          this.EaC.UpdateNodePatch(selectedId, {
            Metadata: { Enabled: val },
          });

          console.log(
            `🟡 Toggled enabled state for node ${selectedId} → ${val}`
          );
          setEnabled(val);
        }
      },
      [selectedId]
    );

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

      const presetConfig =
        this.EaC.GetCapabilities().GetConfig(selected.id, selected.type!) ?? {};

      setInspectorProps({
        config: presetConfig,
        details,
        enabled,
        useStats: selected.data?.useStats ?? (() => undefined),
        onDelete: handleDeleteNode,
        onDetailsChanged: handleDetailsChanged,
        onToggleEnabled: handleToggleEnabled,
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
      toFlow: (point: XYPosition) => XYPosition
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
      []
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
      []
    );

    const handleNodesChange = useCallback(
      (changes: NodeChange[], nodes: Node[]) => {
        this.Interaction.OnNodesChange(changes, nodes ?? this.Graph.GetNodes());
      },
      []
    );

    const handleEdgesChange = useCallback(
      (changes: EdgeChange[], edges: Edge[]) => {
        this.Interaction.OnEdgesChange(changes, edges ?? this.Graph.GetEdges());
      },
      []
    );

    return {
      handleDrop,
      handleConnect,
      handleNodeClick,
      handleNodesChange,
      handleEdgesChange,
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
      this.Selection.GetSelectedNodes(this.Graph.GetNodes())[0] ?? null
    );

    useEffect(() => {
      const update = () => {
        const node =
          this.Selection.GetSelectedNodes(this.Graph.GetNodes())[0] ?? null;
        setSelected(node);
      };

      const unsubscribe = this.Selection.OnSelectionChanged(update);
      return () => unsubscribe();
    }, []);

    return { selected, setSelected };
  }

  public UseStats<TStats extends Record<string, unknown>>(
    id: string,
    intervalMs = 100000
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
      {}
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

  public UseWorkspaceSettings(): {
    currentWorkspace: WorkspaceSummary;
    teamMembers: TeamMember[];
    inviteMember: (
      email: string,
      role: TeamMember['Role'],
      name?: string
    ) => void;
    removeMember: (email: string) => void;
    updateMemberRole: (email: string, role: TeamMember['Role']) => void;
    update: (next: Partial<EaCEnterpriseDetails>) => void;
    save: () => Promise<void>;
    archive: () => void;
    hasChanges: boolean;
    listWorkspaces: () => void;
    workspaces: WorkspaceSummary[];
    switchToWorkspace: (_lookup: string) => void;
  } {
    const getCurrentWorkspace = (): WorkspaceSummary => {
      const eac = this.EaC.GetEaC();

      return {
        Lookup: eac.EnterpriseLookup!,
        Details: eac.Details!,
        Views: 0,
        Forks: 0,
        UpdatedAt: eac.Details?.UpdatedAt ?? eac.Details?.CreatedAt,
        Archived: false,
      };
    };

    const [current, setCurrent] = useState<WorkspaceSummary>(
      getCurrentWorkspace()
    );
    const [hasChanges, setHasChanges] = useState(
      this.History.HasUnsavedChanges()
    );

    useEffect(() => {
      const update = () => {
        setCurrent(getCurrentWorkspace());
        setHasChanges(this.History.HasUnsavedChanges());
      };

      const unsubscribe = this.History.OnChange(update);
      return () => unsubscribe();
    }, []);

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
      this.Team?.ListUsers?.() ?? []
    );

    useEffect(() => {
      const unsubscribe = this.Team?.OnChange?.(() => {
        setTeamMembers(this.Team.ListUsers());
      });

      return () => unsubscribe?.();
    }, []);

    const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);

    const listWorkspaces = (): void => {
      this.EaC.List?.().then((results) => {
        setWorkspaces(results ?? []);
      });
    };

    useEffect(() => {
      listWorkspaces();
    }, []);

    const update = (next: Partial<EaCEnterpriseDetails>) => {
      this.EaC.UpdateWorkspace(next);

      setCurrent(getCurrentWorkspace());
    };

    const save = () => {
      this.Commit();

      console.log('💾 Saved workspace details');

      return Promise.resolve();
      // this.ReloadPacks();
    };

    const archive = () => {
      const name = current.Details.Name ?? 'this workspace';

      const confirmed = confirm(
        `Are you sure you want to archive ${name}? This will remove it from the current session.`
      );

      if (!confirmed) return;

      this.EaC.Archive?.().then(() => {
        location.reload();
      });
    };

    const inviteMember = (
      email: string,
      role: TeamMember['Role'],
      name?: string
    ) => {
      if (!email) return;
      this.Team?.InviteUser?.(email, role, name);
    };

    const removeMember = (email: string) => {
      this.Team?.RemoveUser?.(email);
    };

    const updateMemberRole = (email: string, role: TeamMember['Role']) => {
      this.Team?.UpdateUserRole?.(email, role);
    };

    const switchToWorkspace = (_lookup: string) => {
      //  TODO(mcgear): Set the kv Current EaC value for the user

      location.reload();

      setCurrent(getCurrentWorkspace());
    };

    return {
      currentWorkspace: current,
      teamMembers,
      inviteMember,
      removeMember,
      updateMemberRole,
      update,
      save,
      archive,
      hasChanges,
      listWorkspaces,
      workspaces,
      switchToWorkspace,
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

  public ReloadCapabilities(
    capabilitiesByScope: Record<NodeScopeTypes, EaCNodeCapabilityManager[]>
  ): void {
    this.EaC.LoadCapabilities(capabilitiesByScope);

    this.SwitchToScope(this.currentScope.Scope, this.currentScope.Lookup);
  }

  public SwitchToScope(scope: NodeScopeTypes, lookup?: string): void {
    console.log(`🔀 Switching scope to: ${scope} (${lookup})`);

    // Update internal scope reference
    this.currentScope = { Scope: scope, Lookup: lookup };

    // Clear selection before switching
    this.Selection.ClearSelection();

    // Delegate the actual scope swap and graph rebuild to the EaCManager
    this.EaC.SwitchTo(scope, lookup);

    // You may also want to trigger a stat refresh or reset other managers if needed
    // e.g., this.Stats.Reset(); this.Runtime.Rebind();

    // Optionally, you could emit a custom hook event or callback here
  }
}

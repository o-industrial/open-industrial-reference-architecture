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
  JSX,
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
import { RuntimeImpulse, RuntimeImpulseSources } from '../../types/RuntimeImpulse.ts';
import { IntentStyleMap } from '../../../atomic/utils/getIntentStyles.ts';
import { impulseSourceColorMap } from '../../../atomic/utils/impulseSourceColorMap.ts';
import {
  AccountProfileModal,
  APIKeysModal,
  BillingDetailsModal,
  CloudConnectionsModal,
  CurrentLicenseModal,
  DataAPISuiteModal,
  ManageWorkspacesModal,
  SimulatorLibraryModal,
  TeamManagementModal,
  WarmQueryAPIsModal,
  WorkspaceSettingsModal,
} from '../../../atomic/organisms/modals/.exports.ts';
import { MenuActionItem, MenuRoot } from '../../../atomic/molecules/FlyoutMenu.tsx';
import { EverythingAsCodeIdentity, EverythingAsCodeLicensing } from '../../eac/.deps.ts';
import { AccountProfile } from '../../types/AccountProfile.ts';
import { EaCUserRecord } from '../../api/.client.deps.ts';

export class WorkspaceManager {
  protected currentScope: {
    Scope: NodeScopeTypes;

    Lookup?: string;
  };
  protected Jwt: string;
  protected EnterpriseLookup: string;
  protected AziWarmQueryCircuitUrl: string;

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

  constructor(
    eac: EverythingAsCodeOIWorkspace,
    protected username: string,
    protected userLicense: EaCUserLicense | undefined,
    protected oiSvc: OpenIndustrialAPIClient,
    capabilitiesByScope: Record<NodeScopeTypes, EaCNodeCapabilityManager[]>,
    scope: NodeScopeTypes = 'workspace',
    aziCircuitUrl: string,
    aziWarmQueryCircuitUrl: string,
    protected accessRights?: string[],
    jwt?: string,
  ) {
    this.currentScope = { Scope: scope };
    this.AziWarmQueryCircuitUrl = aziWarmQueryCircuitUrl;
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
    );

    this.Team = new TeamManager(this.oiSvc, this.EaC);

    this.Interaction.BindEaCManager(this.EaC);

    console.log('🚀 FlowManager initialized:', {
      scope: this.currentScope,
      nodes: this.Graph.GetNodes().length,
      edges: this.Graph.GetEdges().length,
    });
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

  public UseAppMenu(eac: EverythingAsCode & EverythingAsCodeLicensing): {
    handleMenu: (item: MenuActionItem) => void;
    modals: JSX.Element;
    runtimeMenus: MenuRoot[];
    showWkspSets: () => void;
    showTeamMgmt: () => void;
    showSimLib: () => void;
    showMngWksps: () => void;
    showAccProf: () => void;
    showWarmQuery: () => void;
    showApiKeys: () => void;
    showDataSuite: () => void;
    showBilling: () => void;
    showLicense: () => void;
    showExternalConns: () => void;
  } {
    const { Modal: accProfModal, Show: showAccProf } = AccountProfileModal.Modal(this);
    const { Modal: mngWkspsModal, Show: showMngWksps } = ManageWorkspacesModal.Modal(this);
    const { Modal: simLibModal, Show: showSimLib } = SimulatorLibraryModal.Modal(this);
    const { Modal: teamMgmtModal, Show: showTeamMgmt } = TeamManagementModal.Modal(this);
    const { Modal: wkspSetsModal, Show: showWkspSets } = WorkspaceSettingsModal.Modal(this);
    const { Modal: warmQueryModal, Show: showWarmQuery } = WarmQueryAPIsModal.Modal(this);
    const { Modal: apiKeysModal, Show: showApiKeys } = APIKeysModal.Modal(this);
    const { Modal: dataSuiteModal, Show: showDataSuite } = DataAPISuiteModal.Modal(this);
    const { Modal: billingModal, Show: showBilling } = BillingDetailsModal.Modal(this);
    const { Modal: licenseModal, Show: showLicense } = CurrentLicenseModal.Modal(eac, this);
    const { Modal: externalConnsModal, Show: showExternalConns } = CloudConnectionsModal.Modal(
      this,
    );

    const modals = (
      <>
        {simLibModal}
        {accProfModal}
        {mngWkspsModal}
        {teamMgmtModal}
        {wkspSetsModal}
        {externalConnsModal}
        {warmQueryModal}
        {apiKeysModal}
        {dataSuiteModal}
        {billingModal}
        {licenseModal}
      </>
    );

    const handleMenu = (item: MenuActionItem) => {
      console.log('menu', item);

      switch (item.id) {
        case 'workspace.settings': {
          showWkspSets();
          break;
        }

        case 'workspace.team': {
          showTeamMgmt();
          break;
        }

        case 'workspace.viewAll': {
          showMngWksps();
          break;
        }

        case 'apis.warmQuery': {
          showWarmQuery();
          break;
        }

        case 'apis.apiKeys': {
          showApiKeys();
          break;
        }

        case 'apis.dataSuite': {
          showDataSuite();
          break;
        }

        case 'env.connections': {
          showExternalConns();
          break;
        }

        case 'billing.details': {
          showBilling();
          break;
        }

        case 'billing.license': {
          showLicense();
          break;
        }
      }
    };

    // Icons — reuse your existing set; add a couple of lucide fallbacks where needed
    const I = {
      // existing
      save: 'https://api.iconify.design/lucide:save.svg',
      fork: 'https://api.iconify.design/lucide:git-fork.svg',
      archive: 'https://api.iconify.design/lucide:archive.svg',
      export: 'https://api.iconify.design/lucide:download.svg',
      eye: 'https://api.iconify.design/lucide:eye.svg',
      check: 'https://api.iconify.design/lucide:check.svg',
      commit: 'https://api.iconify.design/lucide:git-commit.svg',

      // from your icon map
      settings: 'https://api.iconify.design/lucide:settings.svg',
      users: 'https://api.iconify.design/lucide:users.svg',
      link: 'https://api.iconify.design/mdi:link-variant.svg',
      lock: 'https://api.iconify.design/lucide:lock.svg',
      warmQuery: 'https://api.iconify.design/mdi:sql-query.svg',
      key: 'https://api.iconify.design/lucide:key.svg',
      stack: 'https://api.iconify.design/lucide:layers-3.svg',
      dollar: 'https://api.iconify.design/lucide:dollar-sign.svg',

      // sensible additions (lucide)
      cloud: 'https://api.iconify.design/lucide:cloud.svg',
      cloudAttach: 'https://api.iconify.design/lucide:cloud-upload.svg',
      privateCloud: 'https://api.iconify.design/lucide:server.svg',
      license: 'https://api.iconify.design/lucide:badge-check.svg',
      creditCard: 'https://api.iconify.design/lucide:credit-card.svg',
    } as const;

    const runtimeMenus: MenuRoot[] = [
      // // ===== File (unchanged example) =====
      // {
      //   id: 'file',
      //   label: 'File',
      //   items: [
      //     {
      //       type: 'submenu',
      //       id: 'file.new',
      //       label: 'New',
      //       items: [
      //         { type: 'item', id: 'file.new.workspace', label: 'Workspace', iconSrc: I.archive },
      //         { type: 'item', id: 'file.new.surface', label: 'Surface', iconSrc: I.archive },
      //       ],
      //     },
      //     { type: 'item', id: 'file.save', label: 'Save', shortcut: '⌘S', iconSrc: I.save },
      //     { type: 'item', id: 'file.fork', label: 'Fork Workspace', iconSrc: I.fork },
      //     { type: 'separator', id: 'file.sep1' },
      //     {
      //       type: 'submenu',
      //       id: 'file.export',
      //       label: 'Export',
      //       items: [
      //         { type: 'item', id: 'file.export.json', label: 'Export JSON', iconSrc: I.export, payload: { format: 'json' } },
      //         { type: 'item', id: 'file.export.png', label: 'Export PNG', iconSrc: I.export, payload: { format: 'png' } },
      //       ],
      //     },
      //   ],
      // },

      // ===== View (unchanged example) =====
      // {
      //   id: 'view',
      //   label: 'View',
      //   items: [
      //     {
      //       type: 'submenu',
      //       id: 'view.panels',
      //       label: 'Panels',
      //       items: [
      //         {
      //           type: 'item',
      //           id: 'view.toggle.azi',
      //           label: 'Azi',
      //           iconSrc: I.eye,
      //           checked: true,
      //         },
      //         {
      //           type: 'item',
      //           id: 'view.toggle.inspector',
      //           label: 'Inspector',
      //           iconSrc: I.eye,
      //           checked: true,
      //         },
      //         {
      //           type: 'item',
      //           id: 'view.toggle.stream',
      //           label: 'Stream',
      //           iconSrc: I.eye,
      //           checked: true,
      //         },
      //         {
      //           type: 'item',
      //           id: 'view.toggle.timeline',
      //           label: 'Timeline',
      //           iconSrc: I.eye,
      //           checked: true,
      //         },
      //       ],
      //     },
      //     { type: 'item', id: 'view.fullscreen', label: 'Enter Fullscreen' },
      //     { type: 'item', id: 'view.reset', label: 'Reset Layout' },
      //   ],
      // },

      // ===== Workspace =====
      {
        id: 'workspace',
        label: 'Workspace',
        items: [
          {
            type: 'item',
            id: 'workspace.settings',
            label: 'Settings',
            iconSrc: I.settings,
          },
          {
            type: 'item',
            id: 'workspace.team',
            label: 'Team Members',
            iconSrc: I.users,
          },
          {
            type: 'item',
            id: 'workspace.viewAll',
            label: 'View All…',
            iconSrc: I.stack,
            payload: { target: 'workspace-index' },
          },
        ],
      },

      // ===== Environment =====
      // {
      //   id: 'environment',
      //   label: 'Environment',
      //   items: [
      //     {
      //       type: 'item',
      //       id: 'env.connections',
      //       label: 'External Connections',
      //       iconSrc: I.link,
      //     },
      //     // Future: Cloud submenus
      //     // { type: 'item', id: 'env.secrets', label: 'Manage Secrets', iconSrc: I.lock },
      //     // {
      //     //   type: 'submenu',
      //     //   id: 'env.cloud',
      //     //   label: 'Cloud',
      //     //   iconSrc: I.cloud,
      //     //   items: [
      //     //     { type: 'item', id: 'env.cloud.attachManaged', label: 'Attach Managed Cloud', iconSrc: I.cloudAttach },
      //     //     { type: 'item', id: 'env.cloud.addPrivate', label: 'Add Private Cloud', iconSrc: I.privateCloud },
      //     //   ],
      //     // },
      //   ],
      // },

      // ===== APIs =====
      {
        id: 'apis',
        label: 'APIs',
        items: [
          {
            type: 'item',
            id: 'apis.apiKeys',
            label: 'API Keys',
            iconSrc: I.key,
          },
          {
            type: 'item',
            id: 'apis.dataSuite',
            label: 'Data API Suite',
            iconSrc: I.stack,
            payload: { section: 'data' },
          },
          {
            type: 'item',
            id: 'apis.warmQuery',
            label: 'Warm Query Management',
            iconSrc: I.warmQuery,
          },
        ],
      },

      // ===== Billing =====
      {
        id: 'billing',
        label: 'Billing',
        items: [
          {
            type: 'item',
            id: 'billing.license',
            label: 'Current License',
            iconSrc: I.license,
          },
          // {
          //   type: 'item',
          //   id: 'billing.details',
          //   label: 'Billing Details',
          //   iconSrc: I.creditCard, /* or I.dollar */
          // },
        ],
      },
    ];

    return {
      handleMenu,
      modals,
      runtimeMenus,
      showWkspSets,
      showTeamMgmt,
      showSimLib,
      showMngWksps,
      showAccProf,
      showWarmQuery,
      showApiKeys,
      showExternalConns,
      showDataSuite,
      showBilling,
      showLicense,
    };
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
      location.assign('/'); // Simulate signout
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

  public UseCommits(): {
    commits: EaCStatus[];
    badgeState: 'error' | 'processing' | 'success';
    showCommitPanel: boolean;
    selectedCommitId: string | undefined;
    toggleCommitPanel: () => void;
    selectCommit: (id: string | undefined) => void;
  } {
    const [commits, setCommits] = useState<EaCStatus[]>([]);
    const [badgeState, setBadgeState] = useState<
      'error' | 'processing' | 'success'
    >('success');
    const [showCommitPanel, setShowCommitPanel] = useState(false);
    const [selectedCommitId, setSelectedCommitId] = useState<
      string | undefined
    >(undefined);

    const load = useCallback(async () => {
      try {
        const listed = await this.ListCommits();
        const statuses = listed;
        // const statuses = await Promise.all(
        //   listed.map((c) => this.GetCommitStatus(c.ID)),
        // );

        setCommits(statuses);

        const hasError = statuses.some(
          (s) => s.Processing === EaCStatusProcessingTypes.ERROR,
        );
        const isProcessing = statuses.some(
          (s) =>
            s.Processing !== EaCStatusProcessingTypes.COMPLETE &&
            s.Processing !== EaCStatusProcessingTypes.ERROR,
        );

        setBadgeState(
          hasError ? 'error' : isProcessing ? 'processing' : 'success',
        );
      } catch (_err) {
        setBadgeState('error');
      }
    }, []);

    useEffect(() => {
      load();
      const id = setInterval(load, 4000);
      return () => clearInterval(id);
    }, [load]);

    const toggleCommitPanel = () => {
      setShowCommitPanel((p) => {
        console.log(`Toggled to: ${!p}`);
        return !p;
      });
    };
    const selectCommit = (id: string | undefined) => {
      if (id !== selectedCommitId) {
        setSelectedCommitId(id);
      } else {
        setSelectedCommitId(undefined);
      }
    };

    return {
      commits,
      badgeState,
      showCommitPanel,
      selectedCommitId,
      toggleCommitPanel,
      selectCommit,
    };
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
      commit: () => this.Commit(),
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

          if (selectedId) {
            this.EaC.UpdateNodePatch(selectedId, { Details: merged });
            console.log(`🟢 Live-synced EaC details for node ${selectedId}`);
          }

          return merged;
        });
      },
      [selectedId],
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
        // deno-lint-ignore no-explicit-any
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
      // deno-lint-ignore no-explicit-any
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

      const eac: EverythingAsCodeOIWorkspace = {
        Details: { Name: trimmedName, Description: description ?? '' },
      } as unknown as EverythingAsCodeOIWorkspace;

      const result = await this.oiSvc.Workspaces.Create(eac);
      // After creating, switch to the new workspace (triggers reload)
      if (result?.EnterpriseLookup) {
        switchToWorkspace(result.EnterpriseLookup);
      } else {
        // Fallback: refresh list if no lookup returned
        listWorkspaces();
      }
    };

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
      //  TODO(mcgear): Set the kv Current EaC value for the user

      location.reload();

      setCurrent(getCurrentWorkspace());
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

    // Clear selection before switching
    this.Selection.ClearSelection();

    // Delegate the actual scope swap and graph rebuild to the EaCManager
    this.EaC.SwitchTo(scope, lookup);

    // You may also want to trigger a stat refresh or reset other managers if needed
    // e.g., this.Stats.Reset(); this.Runtime.Rebind();

    // Optionally, you could emit a custom hook event or callback here
  }
}

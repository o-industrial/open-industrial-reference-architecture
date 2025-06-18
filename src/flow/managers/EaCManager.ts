import {
  EaCEnterpriseDetails,
  EaCFlowNodeMetadata,
  EaCHistorySnapshot,
  EaCStatus,
  EaCVertexDetails,
  Edge,
  EdgeChange,
  jsonMapSetClone,
  merge,
  Node,
  NodeChange,
  NullableArrayOrObject,
  OpenIndustrialAPIClient,
  Position,
  Proposal,
  RecordKind,
} from '../.deps.ts';

import { HistoryManager } from './HistoryManager.ts';
import { GraphStateManager } from './GraphStateManager.ts';
import { FlowNodeData } from '../types/react/FlowNodeData.ts';
import { SimulatorDefinition } from './SimulatorLibraryManager.ts';
import { FlowGraphNode } from '../types/graph/FlowGraphNode.ts';
import { OpenIndustrialEaC } from '../../types/OpenIndustrialEaC.ts';
import { NodeScopeTypes } from '../types/graph/NodeScopeTypes.ts';

import { EaCDiffManager } from './eac/EaCDiffManager.ts';
import { EaCWorkspaceScopeManager } from './eac/EaCWorkspaceScopeManager.ts';
import { EaCScopeManager } from './eac/EaCScopeManager.ts';
import { EaCSurfaceScopeManager } from './eac/EaCSurfaceScopeManager.ts';
import { EaCProposalManager } from './eac/EaCProposalManager.ts';
import { EaCCapabilitiesManager } from './eac/EaCCapabilitiesManager.ts';
import { EaCNodeCapabilityManager } from './eac/EaCNodeCapabilityManager.ts';

import { ProposalOverlayMode } from '../types/graph/ProposalOverlayMode.ts';
import { WorkspaceSummary } from '../types/WorkspaceSummary.ts';
import { PackModule } from '../../types/PackModule.ts';

/**
 * Top-level controller for managing the Everything-as-Code runtime state,
 * scoped graphs, capability models, and proposal overlays.
 */
export class EaCManager {
  protected deleteEaC: NullableArrayOrObject<OpenIndustrialEaC> = {};
  protected changeListeners: Set<() => void> = new Set<() => void>();
  protected diff: EaCDiffManager;
  protected proposals: EaCProposalManager;
  protected scopeMgr!: EaCScopeManager;
  protected overlayMode: ProposalOverlayMode = 'pending';

  // === New Pack Cache ===

  /**
   * Stores all successfully loaded packs, keyed by their declared EaC lookup.
   */
  protected loadedPacks: Record<string, PackModule> = {};

  /**
   * Returns all capabilities from loaded packs, grouped by node scope.
   */
  protected get capabilityManagersByScope(): Record<
    NodeScopeTypes,
    EaCNodeCapabilityManager[]
  > {
    const scopeCaps: Record<NodeScopeTypes, EaCNodeCapabilityManager[]> = {
      workspace: [],
      surface: [],
    };

    for (const mod of Object.values(this.loadedPacks)) {
      const caps = mod.Capabilities;
      if (!caps) continue;

      if (caps.Workspace?.length) {
        scopeCaps.workspace.push(...caps.Workspace);
      }

      if (caps.Surface?.length) {
        scopeCaps.surface.push(...caps.Surface);
      }
    }

    return scopeCaps;
  }

  constructor(
    protected eac: OpenIndustrialEaC,
    protected oiSvc: OpenIndustrialAPIClient,
    protected scope: NodeScopeTypes,
    protected graph: GraphStateManager,
    protected history: HistoryManager,
  ) {
    this.diff = new EaCDiffManager(history, this.emitEaCChanged.bind(this));
    this.proposals = new EaCProposalManager(oiSvc, this);
    this.LoadPacks().then(() => {
      this.SwitchTo(scope);
    });
  }

  /**
   * Dynamically loads and caches all declared packs, by importing `.pack.ts` modules
   * and extracting their capabilities and steps.
   */
  public async LoadPacks(): Promise<void> {
    this.loadedPacks = {};

    const packs = this.eac.Packs;
    if (!packs) return;

    for (const [lookup, packDef] of Object.entries(packs)) {
      try {
        const path = packDef.Details?.Path;
        if (!path) throw new Error(`Missing pack path for ${lookup}`);

        const mod = await import(path);
        const exported: PackModule = mod.default ?? mod;

        this.loadedPacks[lookup] = exported;
      } catch (err) {
        console.error(`❌ Failed to load pack ${lookup}`, err);
      }
    }
  }

  /**
   * Switches the current runtime scope to either workspace or surface level.
   * Also reloads graph state and binds the relevant capability set.
   */
  public SwitchTo(scope: NodeScopeTypes, lookup?: string): void {
    console.log(`[EaCManager] Switching to scope: ${scope} (${lookup})`);

    this.scope = scope;
    const capabilities = new EaCCapabilitiesManager(
      this.getCapabilitiesByScope(scope),
    );

    switch (scope) {
      case 'workspace':
        this.scopeMgr = new EaCWorkspaceScopeManager(
          this.graph,
          capabilities,
          () => this.GetEaC(),
        );
        break;
      case 'surface':
        if (!lookup) {
          throw new Error(`Lookup must be defined for scope: ${scope}`);
        }
        this.scopeMgr = new EaCSurfaceScopeManager(
          this.graph,
          capabilities,
          () => this.GetEaC(),
          lookup,
        );
        break;
      default:
        throw new Error(`Unsupported scope: ${scope}`);
    }

    this.graph.ResetGraph();
    this.reloadFromEaC();
  }

  /** Returns the capability manager instance for the current scope. */
  public GetCapabilities(): EaCCapabilitiesManager {
    return this.scopeMgr.GetCapabilities();
  }

  /** Returns the current working Everything-as-Code runtime. */
  public GetEaC(): OpenIndustrialEaC {
    return this.getEaCWithProposals();
  }

  /** Returns stats for a given node, via current scope manager. */
  public async GetStats(id: string): Promise<Record<string, unknown>> {
    return await this.scopeMgr.GetStats(id);
  }

  /** Returns node metadata and detail by ID. */
  public GetNodeAsCode(id: string): {
    Metadata?: EaCFlowNodeMetadata;
    Details: EaCVertexDetails;
  } | null {
    return this.scopeMgr.GetNodeAsCode(id);
  }

  /** Applies flow node change set and merges any partial EaC updates. */
  public ApplyReactFlowNodeChanges(
    changes: NodeChange[],
    currentNodes: Node<FlowNodeData>[],
  ): void {
    const partial = this.scopeMgr.UpdateNodesFromChanges(changes, currentNodes);
    if (partial) this.MergePartial(partial);
  }

  /** Applies flow edge change set and merges any partial EaC updates. */
  public ApplyReactFlowEdgeChanges(
    changes: EdgeChange[],
    currentEdges: Edge[],
  ): void {
    const partial = this.scopeMgr.UpdateConnections(changes, currentEdges);
    if (partial) this.MergePartial(partial);
  }

  /** Creates a new node from a preset and merges resulting EaC partial. */
  public CreateNodeFromPreset(type: string, position: Position): FlowGraphNode {
    const id = `${type}-${Date.now()}`;
    const partial = this.scopeMgr.CreatePartialEaCFromPreset(
      type,
      id,
      position,
    );
    this.MergePartial(partial);

    const node = this.graph.GetGraph().Nodes.find((n) => n.ID === id);
    if (!node) throw new Error(`Failed to locate node after create: ${id}`);
    return node;
  }

  public CreateConnectionEdge(source: string, target: string): void {
    const partial = this.scopeMgr.CreateConnectionEdge(source, target);
    if (partial) this.MergePartial(partial);
  }

  public RemoveConnectionEdge(edgeId: string): void {
    const partial = this.scopeMgr.RemoveConnectionEdge(edgeId);
    if (partial) this.MergePartial(partial);
  }

  public DeleteNode(id: string): void {
    const partial = this.scopeMgr.BuildPartialForNodeDelete(id);
    if (partial) this.MergeDelete(partial);
  }

  public HasConnection(source: string, target: string): boolean {
    return this.scopeMgr.HasConnection(source, target);
  }

  public InstallSimulators(simDefs: SimulatorDefinition[]): void {
    const partial = this.scopeMgr.InstallSimulators(simDefs);
    if (partial) this.MergePartial(partial);
  }

  public async Archive(): Promise<void> {
    await this.oiSvc.Workspaces.Archive();
  }

  public async Commit(history: EaCHistorySnapshot): Promise<EaCStatus> {
    const status = await this.oiSvc.Workspaces.Commit(history);
    console.log(`✅ Runtime committed: CommitID ${status.ID}`);
    return status;
  }

  public async List(): Promise<WorkspaceSummary[]> {
    const workspaces = await this.oiSvc.Workspaces.ListForUser();
    return workspaces.map((wkspc) => ({
      Lookup: wkspc.EnterpriseLookup,
      Details: { Name: wkspc.EnterpriseName },
    }));
  }

  public MergePartial(partial: OpenIndustrialEaC): void {
    const result = this.diff.MergePartial(this.eac, this.deleteEaC, partial);
    if (result.changed) {
      this.eac = result.updated;
      this.reloadFromEaC();
    }
  }

  public MergeDelete(partial: NullableArrayOrObject<OpenIndustrialEaC>): void {
    const result = this.diff.MergeDelete(this.eac, this.deleteEaC, partial);
    if (result.changed) {
      this.eac = result.updated;
      this.reloadFromEaC();
    }
  }

  public ResetFromSnapshot(snapshot: EaCHistorySnapshot): void {
    this.eac = jsonMapSetClone(snapshot.eac);
    this.deleteEaC = jsonMapSetClone(snapshot.deletes);
    this.reloadFromEaC();
  }

  public SetProposalOverlayMode(mode: ProposalOverlayMode): void {
    this.overlayMode = mode;
    this.reloadFromEaC();
  }

  public UpdateWorkspace(details: Partial<EaCEnterpriseDetails>): void {
    const merged = merge<EaCEnterpriseDetails>(this.eac.Details || {}, details);
    if (JSON.stringify(this.eac.Details) === JSON.stringify(merged)) return;
    this.MergePartial({ Details: merged });
  }

  public UpdateNodePatch(
    id: string,
    patch: Partial<{
      Details: EaCVertexDetails;
      Metadata: Partial<EaCFlowNodeMetadata>;
    }>,
  ): void {
    const current = this.GetNodeAsCode(id);
    if (!current) return;

    const merged: Partial<{
      Details: EaCVertexDetails;
      Metadata: EaCFlowNodeMetadata;
    }> = {};

    if (patch.Details) {
      const combined = { ...current.Details, ...patch.Details };
      if (JSON.stringify(current.Details) !== JSON.stringify(combined)) {
        merged.Details = combined;
      }
    }

    if (patch.Metadata) {
      const prevMeta = current.Metadata ?? {};
      const combined = merge<EaCFlowNodeMetadata>(prevMeta, patch.Metadata);
      if (JSON.stringify(prevMeta) !== JSON.stringify(combined)) {
        merged.Metadata = combined;
      }
    }

    if (Object.keys(merged).length > 0) {
      const partial = this.scopeMgr.BuildPartialForNodeUpdate(id, merged);
      if (partial) this.MergePartial(partial);
    }
  }

  public OnEaCChanged(cb: () => void): () => void {
    this.changeListeners.add(cb);
    return () => this.changeListeners.delete(cb);
  }

  /**
   * Returns capabilities for the given scope.
   */
  protected getCapabilitiesByScope(
    scope: NodeScopeTypes,
  ): EaCNodeCapabilityManager[] {
    return this.capabilityManagersByScope[scope] ?? [];
  }

  /**
   * Applies proposal overlays to the base EaC model and returns the composite.
   */
  protected getEaCWithProposals(): OpenIndustrialEaC {
    const base = jsonMapSetClone(this.eac);

    if (!this.proposals || this.overlayMode === 'none') return base;

    const overlays = this.overlayMode === 'pending'
      ? this.proposals.GetPending()
      : 'ids' in this.overlayMode
      ? this.overlayMode.ids
        .map((id) => this.proposals.GetByID(id))
        .filter((p): p is Proposal<RecordKind> => !!p)
      : [];

    for (const proposal of overlays) {
      const patch = {
        [proposal.Kind]: {
          [proposal.Key]: proposal.Proposed,
        },
      };
      merge(base, patch);
    }

    return base;
  }

  /**
   * Rebuilds the internal graph from current EaC state.
   */
  protected reloadFromEaC(): void {
    const rebuilt = this.scopeMgr.BuildGraph();
    this.graph.LoadFromGraph(rebuilt);
    this.emitEaCChanged();
  }

  /**
   * Notifies all registered listeners that EaC has changed.
   */
  protected emitEaCChanged(): void {
    for (const cb of this.changeListeners) cb();
  }
}

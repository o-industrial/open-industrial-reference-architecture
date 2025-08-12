// deno-lint-ignore-file no-explicit-any

import { OpenIndustrialAPIClient } from '../../../api/clients/OpenIndustrialAPIClient.ts';
import { EaCFlowNodeMetadata } from '../../../eac/EaCFlowNodeMetadata.ts';
import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';
import { Position } from '../../../eac/types/Position.ts';
import { APIEndpointDescriptor } from '../../../types/APIEndpointDescriptor.ts';
import { ComponentType, EaCVertexDetails, NullableArrayOrObject } from '../../.deps.ts';
import { FlowGraphEdge } from '../../types/graph/FlowGraphEdge.ts';
import { FlowGraphNode } from '../../types/graph/FlowGraphNode.ts';
import { EaCNodeCapabilityAsCode } from '../../types/nodes/EaCNodeCapabilityAsCode.ts';
import { EaCNodeCapabilityContext } from '../../types/nodes/EaCNodeCapabilityContext.ts';
import { EaCNodeCapabilityPatch } from '../../types/nodes/EaCNodeCapabilityPatch.ts';
import { NodeEventRouter } from '../../types/nodes/NodeEventRouter.ts';
import { NodePreset } from '../../types/react/NodePreset.ts';
import { WorkspaceManager } from '../WorkspaceManager.tsx';

/**
 * Abstract base class for managing scoped node capabilities in the EaC model.
 *
 * Implementations of this class define how a specific node type:
 * - Projects into the graph (`BuildNode`)
 * - Generates edges (`BuildEdgesForNode`)
 * - Computes patch mutations (`BuildUpdatePatch`, `BuildDeletePatch`, `BuildConnectionPatch`, `BuildDisconnectionPatch`)
 * - Extracts structured metadata and details (`GetAsCode`)
 */
export abstract class EaCNodeCapabilityManager<
  TDetails extends EaCVertexDetails = EaCVertexDetails,
> {
  /**
   * Canonical node type string, used for matching and capability resolution.
   */
  public abstract Type: string;

  /** */
  constructor(protected oiSvc: OpenIndustrialAPIClient) {}

  /**
   * Generate a partial EaC patch representing a valid connection from source → target.
   */
  public BuildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    return this.buildConnectionPatch?.(source, target, context) ?? null;
  }

  /**
   * Builds a partial EaC delete patch for the given node.
   */
  public BuildDeletePatch(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> | null {
    return this.buildDeletePatch(node, context);
  }

  /**
   * Generate a partial EaC patch representing a disconnection from source → target.
   */
  public BuildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    return this.buildDisconnectionPatch?.(source, target, context) ?? null;
  }

  /**
   * Generate outbound FlowGraphEdges from the given node.
   */
  public BuildEdgesForNode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): FlowGraphEdge[] {
    return this.buildEdgesForNode?.(node, context) ?? [];
  }

  /**
   * Construct a FlowGraphNode from a known ID and current EaC context.
   */
  public BuildNode(
    id: string,
    context: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    return this.buildNode?.(id, context) ?? null;
  }

  /**
   * Constructs a scoped partial EaC object for creating a new node from preset UI interaction.
   * This method is used by scope managers when a user drops a node onto the canvas.
   */
  public BuildPresetPatch(
    id: string,
    position: Position,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> {
    return this.buildPresetPatch?.(id, position, context) ?? {};
  }

  /**
   * Builds a partial EaC update patch from a node mutation.
   */
  public BuildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch<TDetails>,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null {
    return this.buildUpdatePatch(node, update, context);
  }

  /**
   * Extracts the structured AsCode representation of a node’s current state.
   */
  public GetAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode<TDetails> | null {
    return this.buildAsCode(node, context);
  }

  public GetConfig(id: string): Record<string, unknown> {
    return this.getConfig?.(id) ?? {};
  }

  /**
   * Optional inspector component for the right-hand panel.
   * Subclasses can override `buildInspector` to provide a custom inspector.
   */
  public GetInspector(): ComponentType | undefined {
    return this.getInspector?.();
  }

  /**
   * Optional preset descriptor used in scope banks.
   * Subclasses can override `buildPreset` to define how this type appears in a node bank.
   */
  public GetPreset(): NodePreset | undefined {
    return this.getPreset?.();
  }

  /**
   * Optional ReactFlow node renderer component.
   * Subclasses can override `buildRenderer` to define how the node should render on the canvas.
   * The result is automatically wrapped in `memo()` for performance.
   */
  public GetRenderer(): ComponentType | undefined {
    return this.getRenderer?.();
  }

  /**
   * Returns the API endpoint descriptors for this node type, if any.
   * Subclasses should override `getAPIDescriptors` to provide descriptors.
   */
  public GetAPIDescriptors(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): APIEndpointDescriptor[] {
    return this.getAPIDescriptors?.(node, context) ?? [];
  }

  /**
   * Returns the event router for this capability’s node type, if any.
   * Subclasses should override `getEventRouter` to provide scoped behavior.
   */
  public GetEventRouter(
    workspace: WorkspaceManager,
  ): NodeEventRouter | undefined {
    return this.getEventRouter?.(workspace);
  }

  /**
   * Returns stats for the given node ID, scoped to this capability.
   * Default implementation provides a rolling impulseRates buffer.
   * Subclasses should override `buildStats(...)` to customize output.
   */
  public GetStats(
    type: string,
    id: string,
    context: EaCNodeCapabilityContext,
  ): Promise<Record<string, unknown>> {
    return this.getStats(type, id, context);
  }

  /**
   * Checks if this capability manager supports the given node.
   */
  public Matches(node: FlowGraphNode): boolean {
    return node.Type === this.Type;
  }

  // ---------------------------------------------------------------------
  // Subclass-required implementations (to be overridden)
  // ---------------------------------------------------------------------

  protected abstract buildAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode<TDetails> | null;

  protected abstract buildUpdatePatch(
    node: FlowGraphNode,
    update: EaCNodeCapabilityPatch<TDetails>,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null;

  protected abstract buildDeletePatch(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> | null;

  /**
   * Optional override for building a node from ID.
   */
  protected abstract buildNode?(
    id: string,
    context: EaCNodeCapabilityContext,
  ): FlowGraphNode | null;

  /**
   * Optional override for computing outbound edges.
   */
  protected abstract buildEdgesForNode?(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): FlowGraphEdge[];

  /**
   * Optional override for generating a patch that connects source → target.
   */
  protected abstract buildConnectionPatch?(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null;

  /**
   * Optional override for generating a patch that disconnects source → target.
   */
  protected abstract buildDisconnectionPatch?(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace> | null;

  /**
   * Abstract hook for creating a new node definition from a UI preset.
   * Used to scaffold node metadata, initial settings, and surface bindings (if applicable).
   */
  protected buildPresetPatch?(
    id: string,
    position: Position,
    context: EaCNodeCapabilityContext,
  ): Partial<EverythingAsCodeOIWorkspace>;

  protected getConfig?(id: string): Record<string, unknown>;

  /**
   * Optional override to return an un-memoized inspector component.
   */
  protected getInspector?(): ComponentType<any>;

  /**
   * Optional override to define the preset descriptor shown in node banks.
   */
  protected getPreset?(): NodePreset;

  /**
   * Optional override to provide the node renderer component.
   * This will be wrapped in `memo()` by the public accessor.
   */
  protected abstract getRenderer?(): ComponentType<any>;

  /**
   * Internal implementation of GetStats.
   * Subclasses can override this to extend or replace default metrics.
   */
  protected async getStats(
    type: string,
    id: string,
    _1context: EaCNodeCapabilityContext,
  ): Promise<Record<string, unknown>> {
    return await this.oiSvc.Stats.GetStats(type, id);
  }

  /**
   * Optional override to return API endpoint descriptors for this node type.
   */
  protected getAPIDescriptors?(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): APIEndpointDescriptor[];

  /**
   * Optional override to return the NodeEventRouter for this node type.
   */
  protected getEventRouter?(workspace: WorkspaceManager): NodeEventRouter;

  // ---------------------------------------------------------------------
  // Shared utility helpers
  // ---------------------------------------------------------------------

  /**
   * Utility to merge node details + metadata into a single object.
   */
  protected mergeDetailsAndMetadata<T extends object>(
    details?: T,
    metadata?: EaCFlowNodeMetadata,
  ): T & { Metadata?: EaCFlowNodeMetadata } {
    return {
      ...(details ?? {}),
      ...(metadata ? { Metadata: metadata } : {}),
    } as T & { Metadata?: EaCFlowNodeMetadata };
  }

  /**
   * Splits compound node ID (like "surface->connection") into [parent, child].
   * Throws if invalid format.
   */
  protected extractCompoundIDs(node: FlowGraphNode): [string, string] {
    const parts = node.ID.split('->');
    if (parts.length !== 2) {
      throw new Error(`Invalid compound ID: ${node.ID}`);
    }
    return [parts[0], parts[1]];
  }

  /**
   * Wraps a delete operation into the correct EaC nesting structure.
   */
  protected wrapDeletePatch(
    outer: keyof EverythingAsCodeOIWorkspace,
    inner: string,
  ): NullableArrayOrObject<EverythingAsCodeOIWorkspace> {
    return {
      [outer]: {
        [inner]: null,
      },
    };
  }
}

// deno-lint-ignore-file no-explicit-any
import { ComponentType, NullableArrayOrObject } from '../../.deps.ts';

import { FlowGraphEdge } from '../../types/graph/FlowGraphEdge.ts';
import { FlowGraphNode } from '../../types/graph/FlowGraphNode.ts';

import { EaCNodeCapabilityContext } from '../../types/nodes/EaCNodeCapabilityContext.ts';
import { EaCNodeCapabilityAsCode } from '../../types/nodes/EaCNodeCapabilityAsCode.ts';
import { EaCNodeCapabilityPatch } from '../../types/nodes/EaCNodeCapabilityPatch.ts';

import { EaCNodeCapabilityManager } from './EaCNodeCapabilityManager.ts';
import { NodePreset } from '../../types/react/NodePreset.ts';
import { WorkspaceManager } from '../WorkspaceManager.ts';
import { NodeEventRouter } from '../../types/nodes/NodeEventRouter.ts';
import { OpenIndustrialEaC } from '../../types/OpenIndustrialEaC.ts';
import { Position } from '../../../eac/types/Position.ts';

/**
 * Pure registry and dispatcher for active node capability managers.
 *
 * This class is scope-agnostic and accepts a fixed list of capability managers,
 * typically injected based on the current active workspace or surface.
 */
export class EaCCapabilitiesManager {
  protected rendererMap: Record<string, ComponentType<any>>;
  protected capabilities: EaCNodeCapabilityManager[];

  constructor(capabilities: EaCNodeCapabilityManager[]) {
    this.capabilities = capabilities;

    this.rendererMap = Object.fromEntries(
      capabilities.map((c) => [c.Type, c.GetRenderer()]).filter(([, r]) => !!r),
    );
  }

  public BuildConnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    return (
      this.GetCapabilityFor(target)?.BuildConnectionPatch?.(
        source,
        target,
        context,
      ) ?? null
    );
  }

  public BuildEdgesForNode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): FlowGraphEdge[] {
    return (
      this.GetCapabilityFor(node)?.BuildEdgesForNode?.(node, context) ?? []
    );
  }

  public BuildNode(
    id: string,
    type: string,
    context: EaCNodeCapabilityContext,
  ): FlowGraphNode | null {
    return (
      this.GetCapabilityFor({ ID: id, Type: type })?.BuildNode?.(id, context) ??
        null
    );
  }

  public BuildDeletePatch(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): NullableArrayOrObject<OpenIndustrialEaC> | null {
    return this.GetCapabilityFor(node)?.BuildDeletePatch(node, context) ?? null;
  }

  public BuildDisconnectionPatch(
    source: FlowGraphNode,
    target: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    return (
      this.GetCapabilityFor(target)?.BuildDisconnectionPatch?.(
        source,
        target,
        context,
      ) ?? null
    );
  }

  public BuildPresetPatch(
    type: string,
    id: string,
    position: Position,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    const capability = this.GetCapabilityFor({ ID: id, Type: type });

    if (!capability?.BuildPresetPatch) {
      throw new Error(
        `❌ Capability for type '${type}' does not support preset patching.`,
      );
    }

    return capability.BuildPresetPatch(id, position, context);
  }

  public BuildUpdatePatch(
    node: FlowGraphNode,
    patch: EaCNodeCapabilityPatch,
    context: EaCNodeCapabilityContext,
  ): Partial<OpenIndustrialEaC> | null {
    return (
      this.GetCapabilityFor(node)?.BuildUpdatePatch(node, patch, context) ??
        null
    );
  }

  public GetAsCode(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): EaCNodeCapabilityAsCode | null {
    return this.GetCapabilityFor(node)?.GetAsCode(node, context) ?? null;
  }

  public GetCapabilityFor(
    node: FlowGraphNode,
  ): EaCNodeCapabilityManager | undefined {
    return this.capabilities.find((cap) => cap.Matches(node));
  }

  public GetConfig(id: string, type: string): Record<string, unknown> {
    return this.GetCapabilityFor({ ID: id, Type: type })?.GetConfig(id) ?? {};
  }

  public GetEventRouterForType(
    type: string,
    workspace: WorkspaceManager,
  ): NodeEventRouter | undefined {
    return this.GetCapabilityFor({ ID: '', Type: type })?.GetEventRouter(
      workspace,
    );
  }

  public GetPresets(): Record<string, NodePreset> {
    return Object.fromEntries(
      this.capabilities
        .map((c) => [c.Type, c.GetPreset()])
        .filter(([_, p]) => !!p),
    );
  }

  public GetInspector(id: string, type: string): ComponentType<any> | null {
    return (
      this.GetCapabilityFor({ ID: id, Type: type })?.GetInspector() ?? null
    );
  }

  public GetRendererMap(): Record<string, ComponentType<any>> {
    return this.rendererMap;
  }

  public async GetStats(
    node: FlowGraphNode,
    context: EaCNodeCapabilityContext,
  ): Promise<Record<string, unknown>>;

  public async GetStats(
    type: string,
    id: string,
    context: EaCNodeCapabilityContext,
  ): Promise<Record<string, unknown>>;

  public async GetStats(
    nodeOrType: FlowGraphNode | string,
    contextOrId: EaCNodeCapabilityContext | string,
    context?: EaCNodeCapabilityContext,
  ): Promise<Record<string, unknown>> {
    let node: FlowGraphNode = typeof nodeOrType === 'string'
      ? ({ Type: nodeOrType } as FlowGraphNode)
      : nodeOrType;

    if (typeof contextOrId === 'string') {
      node = {
        ...node,
        ID: contextOrId,
      } as FlowGraphNode;
    } else {
      context = contextOrId;
    }

    const capability = this.GetCapabilityFor(node)!;

    return await capability.GetStats(node.Type, node.ID, context!);
  }
}

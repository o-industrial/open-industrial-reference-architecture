import { APIEndpointDescriptor } from '../types/APIEndpointDescriptor.ts';
import { EaCNodeCapabilityManager } from '../flow/managers/eac/EaCNodeCapabilityManager.ts';
import { FlowGraphNode } from '../flow/types/graph/FlowGraphNode.ts';
import { EaCNodeCapabilityContext } from '../flow/types/nodes/EaCNodeCapabilityContext.ts';

/**
 * Build a catalog of API endpoint descriptors for the given nodes.
 *
 * Each node is checked against the provided capability managers. When a
 * matching manager is found, its `GetAPIDescriptors` implementation is used
 * to gather endpoint metadata. The combined list of descriptors is returned.
 */
export function APICatalog(
  nodes: FlowGraphNode[],
  capabilityManagers: EaCNodeCapabilityManager[],
  context: EaCNodeCapabilityContext,
): APIEndpointDescriptor[] {
  const descriptors: APIEndpointDescriptor[] = [];

  for (const node of nodes) {
    for (const manager of capabilityManagers) {
      if (manager.Matches(node)) {
        descriptors.push(...manager.GetAPIDescriptors(node, context));
        break;
      }
    }
  }

  return descriptors;
}

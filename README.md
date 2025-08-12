# open-industrial-reference-architecture

## Capability Managers and API Endpoints

API endpoints for each node capability are defined by its capability manager. Implementations expose their HTTP interfaces by overriding the `getAPIDescriptors` hook, which is surfaced through the public `GetAPIDescriptors` method. Each returned [`APIEndpointDescriptor`](src/types/APIEndpointDescriptor.ts) describes an endpoint the runtime should register.

```ts
protected override getAPIDescriptors(
  node: FlowGraphNode,
  ctx: EaCNodeCapabilityContext,
): APIEndpointDescriptor[] {
  return [{
    Method: 'GET',
    Path: `/api/my-nodes/${node.ID}`,
    Description: 'Fetch data for the node',
  }];
}
```

## Custom Capability Manager Example

Custom node types can extend `EaCNodeCapabilityManager` to participate in the flow graph and expose APIs. Alongside `getAPIDescriptors`, other lifecycle methods may be overridden to tailor behaviour.

```ts
import {
  APIEndpointDescriptor,
  EaCNodeCapabilityContext,
  EaCNodeCapabilityManager,
  FlowGraphNode,
} from './src/flow/.exports.ts';

export class CounterNodeCapabilityManager
  extends EaCNodeCapabilityManager<CounterDetails> {
  public Type = 'counter';

  protected override buildNode(
    id: string,
    _ctx: EaCNodeCapabilityContext,
  ): FlowGraphNode {
    return { ID: id, Type: this.Type };
  }

  protected override getAPIDescriptors(
    node: FlowGraphNode,
    ctx: EaCNodeCapabilityContext,
  ): APIEndpointDescriptor[] {
    return [{
      Method: 'POST',
      Path: `/counter/${node.ID}/increment`,
      Description: 'Increment the counter value',
    }];
  }
}
```


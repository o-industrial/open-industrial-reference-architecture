export type NodeEvent = {
  Type: string;
  NodeID: string;
};

export interface NodeEventRouter {
  Handle(event: NodeEvent): void;
}

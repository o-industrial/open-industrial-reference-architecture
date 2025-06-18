import { FlowGraphEdge } from './FlowGraphEdge.ts';
import { FlowGraphNode } from './FlowGraphNode.ts';

export type FlowGraph = {
  Edges: FlowGraphEdge[];

  Nodes: FlowGraphNode[];
};

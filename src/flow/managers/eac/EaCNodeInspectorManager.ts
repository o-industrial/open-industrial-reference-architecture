// // deno-lint-ignore-file no-explicit-any
// import { jsonMapSetClone, NullableArrayOrObject } from '@fathym/common';
// import { EaCVertexDetails } from '@fathym/eac';
// import {
//   EaCFlowNodeMetadata,
//   EaCFlowSettings,
//   EaCSchemaAsCode,
//   SurfaceSchemaSettings,
// } from '@o-industrial/common/eac';
// import { GraphStateManager } from '../GraphStateManager.ts';
// import { OpenIndustrialEaC } from '../../../types/OpenIndustrialEaC.ts';

// /**
//  * Central inspector and mutator for EaC-backed node state.
//  */
// export class EaCNodeInspectorManager {
//   constructor(
//     protected graph: GraphStateManager,
//     protected getEaC: () => OpenIndustrialEaC
//   ) {}

//   public BuildPartialForNodeUpdate(
//     id: string,
//     update: Partial<{
//       Metadata: EaCFlowNodeMetadata;
//       Details: EaCVertexDetails;
//     }>
//   ): Partial<OpenIndustrialEaC> | null {
//     const node = this.graph.GetGraph().Nodes.find((n) => n.ID === id);
//     if (!node) return null;

//     const typePath = node.Type.toLowerCase();
//     const updateBlock =
//       update.Details || update.Metadata
//         ? {
//             ...(update.Details ?? {}),
//             ...(update.Metadata ? { Metadata: update.Metadata } : {}),
//           }
//         : null;

//     if (!updateBlock) return null;

//     if (typePath.includes('->')) {
//       const [from, to] = typePath.split('->');
//       const [parentId, childId] = id.split('->');

//       return this.buildCompoundUpdatePatch(from, to, parentId, childId, {
//         Metadata: update.Metadata,
//         Details: update.Details,
//       });
//     }

//     const key = this.getEaCKeyForType(node.Type);
//     return {
//       [key]: {
//         [id]: {
//           ...(update.Details ? { Details: update.Details } : {}),
//           ...(update.Metadata ? { Metadata: update.Metadata } : {}),
//         },
//       },
//     };
//   }

//   public BuildPartialForNodeDelete(
//     id: string
//   ): NullableArrayOrObject<OpenIndustrialEaC> | null {
//     const node = this.graph.GetGraph().Nodes.find((n) => n.ID === id);
//     if (!node) return null;

//     const typePath = node.Type.toLowerCase();

//     if (typePath.includes('->')) {
//       const [from, to] = typePath.split('->');
//       const [parentId, childId] = id.split('->');
//       const outerKey = this.getEaCKeyForType(from);
//       const collectionKey = this.getEaCKeyForType(to);

//       return {
//         [outerKey]: {
//           [parentId]: {
//             [collectionKey]: {
//               [childId]: null,
//             },
//           },
//         },
//       };
//     }

//     const key = this.getEaCKeyForType(node.Type);
//     return {
//       [key]: { [id]: null },
//     };
//   }

//   public FindAsCode(node: {
//     ID: string;
//     Type: string;
//     SurfaceLookup?: string;
//   }): {
//     ID: string;
//     Type: string;
//     AsCode: {
//       Metadata?: EaCFlowNodeMetadata;
//       Details: EaCVertexDetails;
//     };
//   } | null {
//     const nodeId = node.ID;

//     const typePath = node.Type.toLowerCase();

//     const [from, to] = typePath.split('->');

//     const [parentId, childId] = nodeId.split('->');

//     const embedded = this.extractAsCode(
//       nodeId,
//       from,
//       to,
//       parentId,
//       childId,
//       node.SurfaceLookup || ''
//     );

//     return embedded ? { ID: nodeId, Type: typePath, AsCode: embedded } : null;
//   }

//   public GetNodeAsCode(id: string): {
//     Metadata?: EaCFlowNodeMetadata;
//     Details: EaCVertexDetails;
//   } | null {
//     const node = this.graph.GetGraph().Nodes.find((n) => n.ID === id);

//     return node ? this.FindAsCode(node)?.AsCode ?? null : null;
//   }

//   // ----------------------- Protected Helpers ------------------------

//   protected extractEmbeddedAsCode<T extends EaCFlowSettings>(
//     eacBlock: EaCVertexDetails,
//     block: T | undefined
//   ): { Metadata?: EaCFlowNodeMetadata; Details: EaCVertexDetails } | null {
//     if (!block) return null;
//     const { Metadata, ...details } = block;
//     return {
//       Metadata: Metadata ?? {},
//       Details: { ...(details ?? {}), Name: eacBlock.Name },
//     };
//   }

//   protected extractSurfaceSchemaOverlay(
//     globalSchema: EaCVertexDetails | undefined,
//     surfaceSchemaEntry: Record<string, unknown> | undefined
//   ): { Metadata?: EaCFlowNodeMetadata; Details: EaCVertexDetails } | null {
//     if (!globalSchema || !surfaceSchemaEntry) return null;
//     const { Metadata, ...overrides } = surfaceSchemaEntry;
//     return {
//       Metadata: Metadata as EaCFlowNodeMetadata,
//       Details: {
//         ...globalSchema,
//         ...overrides,
//       },
//     };
//   }

//   protected extractAsCode(
//     nodeId: string,
//     from: string,
//     to: string,
//     fromId: string,
//     toId: string,
//     surfaceLookup: string
//   ): { Metadata?: EaCFlowNodeMetadata; Details: EaCVertexDetails } | null {
//     if (to) {
//       const fromAsCode = this.FindAsCode({
//         ID: fromId,
//         Type: from,
//         SurfaceLookup: surfaceLookup,
//       });

//       if (!fromAsCode) return null;

//       const collectionKey = this.getEaCKeyForType(to);

//       const toAsCode = this.FindAsCode({
//         ID: toId,
//         Type: to,
//         SurfaceLookup: surfaceLookup,
//       })?.AsCode;

//       const childEntry = (fromAsCode.AsCode as any)?.[collectionKey]?.[toId];

//       if (!toAsCode || !childEntry) return null;

//       return this.extractEmbeddedAsCode(toAsCode.Details, childEntry);
//     }

//     const eac = this.getEaC();

//     const fromCollectionKey = this.getEaCKeyForType(from);

//     const asCode = (eac[fromCollectionKey] as Record<string, any>)?.[nodeId];

//     if (!asCode) return null;

//     if (from === 'schema' && surfaceLookup) {
//       const surfaceAsCode = this.FindAsCode({
//         ID: surfaceLookup,
//         Type: 'surface',
//       })?.AsCode;

//       const settingsEntry = (surfaceAsCode as any)?.[fromCollectionKey]?.[
//         fromId
//       ];

//       if (!asCode || !settingsEntry) return null;

//       return this.extractSurfaceSchemaOverlay(asCode.Details, settingsEntry);
//     }

//     const cloned = jsonMapSetClone(asCode);
//     cloned.Metadata ??= {};
//     cloned.Details ??= {};

//     return {
//       ...cloned,
//       Details: cloned.Details!,
//     };
//   }

//   protected buildCompoundUpdatePatch(
//     from: string,
//     to: string,
//     parentId: string,
//     childId: string,
//     update: {
//       Metadata?: EaCFlowNodeMetadata;
//       Details?: EaCVertexDetails;
//     }
//   ): Partial<OpenIndustrialEaC> {
//     const outerKey = this.getEaCKeyForType(from);

//     if (from === 'surface' && to === 'schema') {
//       const patch: Partial<OpenIndustrialEaC> = {};

//       const { surfaceSettings, schemaDetails } =
//         this.splitFlowSettingsForSurfaceSchema({
//           ...(update.Details ?? {}),
//           ...(update.Metadata ? { Metadata: update.Metadata } : {}),
//         });

//       if (Object.keys(surfaceSettings).length > 0) {
//         patch.Surfaces = {
//           [parentId]: {
//             Schemas: {
//               [childId]: surfaceSettings,
//             },
//           },
//         };
//       }

//       if (Object.keys(schemaDetails).length > 0) {
//         patch.Schemas = {
//           [childId]: {
//             Details: schemaDetails,
//           } as EaCSchemaAsCode,
//         };
//       }

//       return patch;
//     }

//     const block: Record<string, unknown> = {};
//     if (update.Metadata) block.Metadata = update.Metadata;
//     if (update.Details) Object.assign(block, update.Details);

//     return {
//       [outerKey]: {
//         [parentId]: {
//           [this.getEaCKeyForType(to)]: {
//             [childId]: block,
//           },
//         },
//       },
//     };
//   }

//   protected splitFlowSettingsForSurfaceSchema(
//     update: EaCVertexDetails & { Metadata?: EaCFlowNodeMetadata }
//   ): {
//     surfaceSettings: SurfaceSchemaSettings;
//     schemaDetails: EaCVertexDetails;
//   } {
//     const { DisplayMode, Metadata, ...rest } = update;
//     return {
//       surfaceSettings: {
//         ...(Metadata ? { Metadata } : {}),
//         ...(DisplayMode ? { DisplayMode } : { DisplayMode: 'table' }),
//       } as SurfaceSchemaSettings,
//       schemaDetails: rest,
//     };
//   }

//   protected getEaCKeyForType(type: string): keyof OpenIndustrialEaC {
//     switch (type.toLowerCase()) {
//       case 'agent':
//         return 'Agents';
//       case 'connection':
//         return 'DataConnections';
//       case 'schema':
//       case 'reference-schema':
//       case 'composite-schema':
//         return 'Schemas';
//       case 'simulator':
//         return 'Simulators';
//       case 'surface':
//         return 'Surfaces';
//       default:
//         throw new Error(`Unsupported type: ${type}`);
//     }
//   }
// }

import { assertEquals } from '../tests.deps.ts';
import { DataConnectionNodeCapabilityManager } from '../../src/packs/oi-core/capabilities/connection/DataConnectionNodeCapabilityManager.ts';
import { SurfaceNodeCapabilityManager } from '../../src/packs/oi-core/capabilities/surface/SurfaceNodeCapabilityManager.ts';
import { SurfaceConnectionNodeCapabilityManager } from '../../src/packs/oi-core/capabilities/surface-connection/SurfaceConnectionNodeCapabilityManager.ts';
import { SurfaceWarmQueryNodeCapabilityManager } from '../../src/packs/oi-core/capabilities/surface-warmquery/SurfaceWarmQueryNodeCapabilityManager.tsx';

Deno.test('DataConnection manager descriptors are namespaced under /api/data', () => {
  const mgr = new DataConnectionNodeCapabilityManager({} as any);
  const descriptors = mgr.GetAPIDescriptors(
    { ID: 'conn1', Type: 'connection' } as any,
    { GetEaC: () => ({}) as any },
  );
  assertEquals(descriptors, [
    { Method: 'GET', Path: '/api/data/conn1/cold', Handler: 'ColdExportController', Cold: true },
    { Method: 'POST', Path: '/api/data/conn1/warm', Handler: 'WarmQueryController', Warm: true },
    { Method: 'GET', Path: '/api/data/conn1/sse', SSE: true },
    { Method: 'GET', Path: '/api/data/conn1/ws', WebSocket: true },
    { Method: 'POST', Path: '/api/data/conn1/chat', Chat: true },
  ]);
});

Deno.test('Surface manager descriptors include surface namespace and warm query paths', () => {
  const mgr = new SurfaceNodeCapabilityManager({} as any);
  const eac = {
    Surfaces: {
      surf1: {
        DataConnections: { conn1: {} },
        WarmQueries: { wq1: {} },
      },
    },
  };
  const descriptors = mgr.GetAPIDescriptors(
    { ID: 'surf1', Type: 'surface' } as any,
    { GetEaC: () => eac as any },
  );
  assertEquals(descriptors, [
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/cold', Handler: 'ColdExportController', Cold: true },
    { Method: 'POST', Path: '/api/surface/surf1/data/conn1/warm', Handler: 'WarmQueryController', Warm: true },
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/sse', SSE: true },
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/ws', WebSocket: true },
    { Method: 'POST', Path: '/api/surface/surf1/data/conn1/chat', Chat: true },
    { Method: 'POST', Path: '/api/surface/surf1/warm/wq1', Handler: 'WarmQueryController', Warm: true },
  ]);
});

Deno.test('SurfaceConnection manager descriptors mirror DataConnection under surface namespace', () => {
  const mgr = new SurfaceConnectionNodeCapabilityManager({} as any);
  const descriptors = mgr.GetAPIDescriptors(
    { ID: 'surf1->conn1', Type: 'surface->connection' } as any,
    { GetEaC: () => ({}) as any },
  );
  assertEquals(descriptors, [
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/cold', Handler: 'ColdExportController', Cold: true },
    { Method: 'POST', Path: '/api/surface/surf1/data/conn1/warm', Handler: 'WarmQueryController', Warm: true },
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/sse', SSE: true },
    { Method: 'GET', Path: '/api/surface/surf1/data/conn1/ws', WebSocket: true },
    { Method: 'POST', Path: '/api/surface/surf1/data/conn1/chat', Chat: true },
  ]);
});

Deno.test('SurfaceWarmQuery manager descriptors derive from ApiPath and are warm', () => {
  const mgr = new SurfaceWarmQueryNodeCapabilityManager({} as any);
  const eac = { WarmQueries: { wq1: { Details: { ApiPath: '/example/path' } } } };
  const descriptors = mgr.GetAPIDescriptors(
    { ID: 'wq1', Type: 'warmquery' } as any,
    { GetEaC: () => eac as any },
  );
  assertEquals(descriptors, [
    { Method: 'GET', Path: '/api/warm/example/path', Warm: true },
    { Method: 'POST', Path: '/api/warm/example/path', Warm: true },
  ]);
});


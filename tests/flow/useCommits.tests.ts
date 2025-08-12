import { assertEquals } from '../tests.deps.ts';
import { h, render } from 'npm:preact@10.20.1';
import { act } from 'npm:preact@10.20.1/test-utils';
import { FakeTime } from 'jsr:@std/testing@0.210.0/time';
import { EaCStatusProcessingTypes, type EaCStatus } from '../../src/flow/.deps.ts';
import { WorkspaceManager } from '../../src/flow/managers/WorkspaceManager.tsx';

Deno.test('UseCommits sets badge state based on commit statuses', async () => {
  const scenarios: Array<{ statuses: EaCStatusProcessingTypes[]; expected: string }> = [
    { statuses: [EaCStatusProcessingTypes.COMPLETE], expected: 'success' },
    { statuses: [EaCStatusProcessingTypes.ERROR], expected: 'error' },
    { statuses: [EaCStatusProcessingTypes.PROCESSING], expected: 'processing' },
  ];

  for (const { statuses, expected } of scenarios) {
    const wm = {
      ListCommits: async () => statuses.map((_, i) => ({ ID: `${i}` })),
      GetCommitStatus: async (id: string) => ({
        ID: id,
        Processing: statuses[Number(id)],
      }) as EaCStatus,
    } as unknown as WorkspaceManager;

    let hook: ReturnType<WorkspaceManager['UseCommits']>;
    function Test() {
      hook = WorkspaceManager.prototype.UseCommits.call(wm);
      return null;
    }

    const container = document.createElement('div');
    await act(() => {
      render(h(Test, {}), container);
    });

    // Allow async load to resolve
    await act(async () => {
      await Promise.resolve();
    });

    assertEquals(hook.badgeState, expected);
    render(null, container);
  }
});

Deno.test('UseCommits polls and clears interval on unmount', async () => {
  const time = new FakeTime();

  let calls = 0;
  const wm = {
    ListCommits: async () => {
      calls++;
      return [] as EaCStatus[];
    },
    GetCommitStatus: async () => ({}) as EaCStatus,
  } as unknown as WorkspaceManager;

  let hook: ReturnType<WorkspaceManager['UseCommits']>;
  function Test() {
    hook = WorkspaceManager.prototype.UseCommits.call(wm);
    return null;
  }

  const container = document.createElement('div');
  await act(() => {
    render(h(Test, {}), container);
  });
  await act(async () => {
    await Promise.resolve();
  });

  assertEquals(calls, 1);

  await act(() => {
    time.tick(4000);
  });
  assertEquals(calls, 2);

  await act(() => {
    render(null, container);
  });
  await act(() => {
    time.tick(4000);
  });
  assertEquals(calls, 2);

  time.restore();
});

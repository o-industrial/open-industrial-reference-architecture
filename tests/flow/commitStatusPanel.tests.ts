// import { assertStringIncludes } from '../tests.deps.ts';
// import { h } from 'npm:preact@10.20.1';
// import render from 'npm:preact-render-to-string@6.2.1';
// import { CommitStatusPanel } from '../../atomic/organisms/CommitStatusPanel.tsx';
// import { type EaCStatus, EaCStatusProcessingTypes } from '../../src/flow/.deps.ts';

// Deno.test('CommitStatusPanel renders provided commits', () => {
//   const commits: EaCStatus[] = [
//     { ID: '1', Processing: EaCStatusProcessingTypes.COMPLETE } as EaCStatus,
//     { ID: '2', Processing: EaCStatusProcessingTypes.ERROR } as EaCStatus,
//   ];

//   const html = render(
//     h(CommitStatusPanel, {
//       commits,
//       selectedCommitId: '1',
//       onSelectCommit: () => {},
//       onClose: () => {},
//     }),
//   );

//   assertStringIncludes(html, '1');
//   assertStringIncludes(html, '2');
// });

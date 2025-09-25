import { useMemo } from '../../.deps.ts';
import type { InterfaceSpec } from '../../../../eac/InterfaceSpec.ts';

export type VisualBuilderCanvasProps = {
  spec: InterfaceSpec;
  onSpecChange?: (next: InterfaceSpec) => void;
};

function flattenNodes(nodes: InterfaceSpec['Layout']) {
  const result: Array<{ id: string; type: string; depth: number }> = [];
  const walk = (
    entries: InterfaceSpec['Layout'],
    depth: number,
  ) => {
    entries?.forEach((node) => {
      result.push({ id: node.ID, type: node.Type, depth });
      if (node.Children && node.Children.length > 0) {
        walk(node.Children, depth + 1);
      }
    });
  };

  walk(nodes ?? [], 0);
  return result;
}

export function VisualBuilderCanvas({ spec, onSpecChange }: VisualBuilderCanvasProps) {
  const nodes = useMemo(() => flattenNodes(spec.Layout), [spec.Layout]);

  return (
    <div class='flex h-full flex-col rounded border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200'>
      <header class='mb-3 flex items-center justify-between'>
        <div>
          <h3 class='text-base font-semibold text-slate-100'>Layout Preview</h3>
          <p class='text-xs text-slate-400'>Draft canvas stub � future WYSIWYG hooks land here.</p>
        </div>
        <button
          type='button'
          class='rounded border border-teal-500 px-3 py-1 text-xs font-semibold text-teal-200 transition hover:bg-teal-500/10'
          onClick={() => onSpecChange?.(spec)}
        >
          Sync Draft
        </button>
      </header>

      <div class='flex-1 overflow-auto rounded border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs leading-6 text-slate-300'>
        {nodes.length === 0 && <p class='text-slate-500'>No layout nodes defined.</p>}
        {nodes.map((node) => (
          <div key={node.id} style={{ paddingLeft: `${node.depth * 16}px` }}>
            <span class='text-slate-500'>+-</span> {node.type}
            <span class='text-slate-500'>�</span>
            <span class='text-slate-300'>{node.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

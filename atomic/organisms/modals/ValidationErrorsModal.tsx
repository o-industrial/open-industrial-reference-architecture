import { Modal } from '../../.exports.ts';
import type { FunctionalComponent, JSX } from 'npm:preact@10.20.1';

export type ValidationIssue = { code?: string; field?: string; message: string };
export type ValidationErrorEntry = {
  node: { ID: string; Type: string; Label?: string };
  issues: ValidationIssue[];
};

type Props = {
  errors: ValidationErrorEntry[];
  onClose: () => void;
};

export const ValidationErrorsModal: FunctionalComponent<Props> = ({ errors, onClose }) => {
  return (
    <Modal title="Validation Errors" onClose={onClose}>
      <div class="space-y-4">
        {errors.map(({ node, issues }) => (
          <div class="rounded-2xl border border-red-700/50 bg-neutral-900/80 p-4 shadow-lg" key={node.ID}>
            <div class="mb-2 font-semibold text-red-300">
              {node.Label ?? node.ID}
            </div>
            <ul class="list-disc list-inside text-red-400 text-sm space-y-1">
              {issues.map((iss, idx) => (
                <li key={idx}>{iss.message}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
};

import { JSX, WorkspaceManager, useState } from '../../.deps.ts';
import { Modal } from '../../.exports.ts';

export type DataAPISuiteModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function DataAPISuiteModal({
  workspaceMgr,
  onClose,
}: DataAPISuiteModalProps): JSX.Element {
  void workspaceMgr;

  return (
    <Modal title="Data API Suite" onClose={onClose}>
      <div class="space-y-10 text-sm text-slate-600">
        <div class="rounded-2xl bg-gradient-to-r from-sky-600 via-blue-500 to-indigo-500 p-6 text-white shadow-xl">
          <h3 class="text-2xl font-bold">The Data API Suite is almost here</h3>
          <p class="mt-2 text-base leading-relaxed">
            We are polishing a unified API surface that unlocks effortless movement between live operations,
            historical insights, and intelligent automations.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <section class="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h4 class="text-lg font-semibold text-slate-900">Cold Query Downloads</h4>
            <p>
              Streamline analytics with on-demand CSV and JSONL exports so your downstream tools always have the
              latest historical snapshots.
            </p>
          </section>

          <section class="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h4 class="text-lg font-semibold text-slate-900">Warm Query Enhancements</h4>
            <p>
              Expand real-time observability with additional warm query APIs designed to surface the KPIs that drive
              your industrial workflows.
            </p>
          </section>

          <section class="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h4 class="text-lg font-semibold text-slate-900">Agentic &amp; AI Experiences</h4>
            <p>
              Chat with your data, embed answers into copilots, and orchestrate actions through upcoming agent-ready
              APIs tuned for your operations.
            </p>
          </section>

          <section class="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
            <h4 class="text-lg font-semibold text-slate-900">MCP &amp; Profiles</h4>
            <p>
              Bring every system into the conversation with Model Context Protocol server support and connection
              profiles that keep credentials, schemas, and access aligned.
            </p>
          </section>
        </div>

        <div class="rounded-xl border border-dashed border-sky-400 bg-sky-50/80 p-6 text-slate-700">
          <h4 class="text-lg font-semibold text-slate-900">Want in early?</h4>
          <p class="mt-2">
            We are lining up design partners now. Tell us what unlocks your next experience and we will invite you to
            the preview cohort.
          </p>
          <a
            class="mt-4 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            href="mailto:support@fathym.com"
          >
            Email support@fathym.com
          </a>
        </div>
      </div>
    </Modal>
  );
}

DataAPISuiteModal.Modal = (
  workspaceMgr: WorkspaceManager
): {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
} => {
  const [shown, setShow] = useState(false);

  return {
    Modal: (
      <>
        {shown && (
          <DataAPISuiteModal
            workspaceMgr={workspaceMgr}
            onClose={() => setShow(false)}
          />
        )}
      </>
    ),
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default DataAPISuiteModal;

import { IntentTypes, JSX, WorkspaceManager, useEffect, useState } from '../../.deps.ts';
import { Action, ActionStyleTypes, LoadingIcon, Modal } from '../../.exports.ts';

export type APIKeysModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

type DurationPreset = {
  hint: string;
  label: string;
  value: number;
};

const durationPresets: DurationPreset[] = [
  { label: '15 minutes', value: 15, hint: 'CLI smoke tests' },
  { label: '1 hour', value: 60, hint: 'Short automation' },
  { label: '8 hours', value: 480, hint: 'Full workday' },
  { label: '24 hours', value: 1440, hint: 'Daily rotation' },
  { label: '7 days', value: 10080, hint: 'Temporary integration' },
  { label: '30 days', value: 43200, hint: 'Long-lived service' },
];

export function APIKeysModal({ workspaceMgr, onClose }: APIKeysModalProps): JSX.Element {
  void workspaceMgr;

  const [minutes, setMinutes] = useState<number>(60);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [copyError, setCopyError] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<number | undefined>(undefined);

  const applyMinutes = (value: number) => {
    if (!Number.isFinite(value)) return;

    const sanitized = Math.max(1, Math.round(value));
    setMinutes(sanitized);
  };

  const handleGenerate = async () => {
    if (loading) return;

    setLoading(true);
    setError('');
    setToken('');
    setCopyState('idle');
    setCopyError('');
    setGeneratedAt(undefined);

    try {
      const res = await fetch(`/workspace/api/keys/jwt?minutes=${encodeURIComponent(minutes)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tok = typeof data === 'string' ? data : (data?.Token as string | undefined);
      if (!tok) throw new Error('No token returned');

      setToken(tok);
      setGeneratedAt(Date.now());
    } catch (err) {
      console.error('Failed to generate token');
      console.error(err);
      setError('We could not generate a token. Try again or come back later.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setCopyState('copied');
      setCopyError('');
    } catch (err) {
      console.error('Failed to copy token');
      console.error(err);
      setCopyError('Copy to clipboard is not available in this browser.');
    }
  };

  useEffect(() => {
    if (copyState !== 'copied') return;

    const timeout = window.setTimeout(() => setCopyState('idle'), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const activePreset = durationPresets.find((preset) => preset.value === minutes);

  return (
    <Modal title="API Keys" onClose={onClose}>
      <div class="space-y-6 text-sm text-slate-200">
        <section class="rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-900/80 via-neutral-900/70 to-slate-950/80 p-6 shadow-xl">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="max-w-xl space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-sky-300/90">Access tokens</p>
              <h3 class="text-2xl font-semibold text-white">Workspace API keys as JWTs</h3>
              <p class="text-sm leading-relaxed text-slate-300">Generate time-bound bearer tokens to call Open Industrial APIs from automation, CLI scripts, or downstream services.</p>
            </div>
            <div class="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-xs text-sky-100 md:max-w-xs">
              <p class="font-semibold uppercase tracking-wide">Best practice</p>
              <p class="mt-1 leading-relaxed text-sky-100/90">Keep lifetimes short and rotate tokens whenever team membership or infrastructure changes.</p>
            </div>
          </div>
        </section>

        <section class="space-y-5 rounded-3xl border border-slate-700/60 bg-neutral-900/80 p-6 shadow-xl">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-white">Choose an expiration</h3>
            <p class="text-sm text-slate-400">Pick a preset or enter a custom duration. Tokens expire automatically; you can regenerate at any time.</p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                {durationPresets.map((preset) => {
                  const selected = preset.value === minutes;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => applyMinutes(preset.value)}
                      class={`group inline-flex flex-col rounded-xl border px-3 py-2 text-left transition ${
                        selected
                          ? 'border-sky-500/70 bg-sky-500/15 text-white shadow-lg shadow-sky-500/20'
                          : 'border-slate-700/70 bg-neutral-950/40 text-slate-300 hover:border-sky-500/40 hover:text-sky-100'
                      }`}
                    >
                      <span class="text-sm font-semibold">{preset.label}</span>
                      <span class="text-xs text-slate-400 transition group-hover:text-slate-300">{preset.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div class="space-y-2 rounded-2xl border border-slate-700/60 bg-neutral-950/40 p-4">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-400"
                for="api-keys-custom-minutes"
              >
                Custom duration
              </label>
              <div class="flex flex-wrap items-center gap-2">
                <input
                  id="api-keys-custom-minutes"
                  type="number"
                  min={1}
                  step={1}
                  class="w-24 rounded-lg border border-slate-700/70 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  value={minutes}
                  onChange={(event) => {
                    const value = Number((event.currentTarget as HTMLInputElement).value);
                    if (Number.isNaN(value)) return;

                    applyMinutes(value);
                  }}
                />
                <span class="text-xs uppercase tracking-wide text-slate-500">Minutes</span>
                {activePreset ? (
                  <span class="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                    {activePreset.label}
                  </span>
                ) : (
                  <span class="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                    Custom
                  </span>
                )}
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-xs text-slate-500">Tokens are scoped to this workspace and inherit current permissions.</p>
            <Action intentType={IntentTypes.Primary} disabled={loading} onClick={handleGenerate}>
              {loading ? (
                <span class="flex items-center gap-2">
                  <LoadingIcon class="h-4 w-4 animate-spin text-sky-200" />
                  Generating JWT...
                </span>
              ) : (
                'Generate JWT'
              )}
            </Action>
          </div>

          {error && (
            <div class="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
          )}
        </section>

        {token ? (
          <section class="space-y-4 rounded-3xl border border-slate-700/60 bg-neutral-900/80 p-6 shadow-xl">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <h3 class="text-lg font-semibold text-white">Workspace JWT</h3>
                <p class="text-sm text-slate-400">Use this value as a Bearer token in the Authorization header.</p>
              </div>
              {generatedAt && (
                <span class="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Generated {new Date(generatedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div class="rounded-2xl border border-neutral-800/70 bg-neutral-950/80 p-4">
              <textarea
                class="h-36 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 font-mono text-xs text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                readOnly
                value={token}
              />
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap gap-2">
                <Action
                  styleType={ActionStyleTypes.Outline}
                  disabled={!token}
                  onClick={copy}
                >
                  {copyState === 'copied' ? 'Copied' : 'Copy to clipboard'}
                </Action>
                <Action
                  intentType={IntentTypes.Info}
                  styleType={ActionStyleTypes.Outline}
                  disabled={!token}
                  onClick={() => {
                    setToken('');
                    setGeneratedAt(undefined);
                    setCopyState('idle');
                  }}
                >
                  Clear
                </Action>
              </div>
              <p class="text-xs text-slate-500">Store this token in your secrets manager. It is never persisted by Open Industrial.</p>
            </div>

            {copyError && (
              <div class="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{copyError}</div>
            )}
          </section>
        ) : (
          <section class="rounded-3xl border border-dashed border-slate-700/60 bg-neutral-900/40 p-6 text-center text-sm text-slate-400">
            <p>Generate a JWT to preview it here. Tokens are shown once so you can capture them in a secure vault.</p>
          </section>
        )}

        <section class="space-y-4 rounded-3xl border border-slate-700/60 bg-neutral-900/70 p-6 shadow-inner">
          <h3 class="text-lg font-semibold text-white">Usage tips</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <p class="text-sm font-semibold text-white">Authorization header</p>
              <p class="mt-2 text-xs text-slate-400">Send <code class="rounded bg-neutral-800/70 px-2 py-0.5 font-mono text-[0.65rem] text-slate-100">Authorization: Bearer your_jwt_token</code> with every request.</p>
            </div>
            <div class="rounded-2xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <p class="text-sm font-semibold text-white">Rotate frequently</p>
              <p class="mt-2 text-xs text-slate-400">Schedule rotation to align with automation cadences or when team membership changes.</p>
            </div>
            <div class="rounded-2xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <p class="text-sm font-semibold text-white">Scope awareness</p>
              <p class="mt-2 text-xs text-slate-400">JWTs inherit the permissions of the issuing account. Remove access in the workspace to invalidate future tokens.</p>
            </div>
            <div class="rounded-2xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <p class="text-sm font-semibold text-white">Pair with warm queries</p>
              <p class="mt-2 text-xs text-slate-400">Use the same JWT with the Warm Query APIs modal to drop ready-to-run snippets into your clients.</p>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

APIKeysModal.Modal = (
  workspaceMgr: WorkspaceManager,
): {
  Modal: JSX.Element;
  Hide: () => void;
  IsOpen: () => boolean;
  Show: () => void;
} => {
  const [shown, setShow] = useState(false);

  return {
    Modal: <>{shown && <APIKeysModal workspaceMgr={workspaceMgr} onClose={() => setShow(false)} />}</>,
    Hide: () => setShow(false),
    IsOpen: () => shown,
    Show: () => setShow(true),
  };
};

export default APIKeysModal;

import { JSX, WorkspaceManager, useState, IntentTypes } from '../../.deps.ts';
import { Modal, Action, ActionStyleTypes } from '../../.exports.ts';

export type APIKeysModalProps = {
  workspaceMgr: WorkspaceManager;
  onClose: () => void;
};

export function APIKeysModal({ workspaceMgr, onClose }: APIKeysModalProps): JSX.Element {
  void workspaceMgr;

  const [minutes, setMinutes] = useState<number>(60);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const presets = [
    { label: '15 minutes', value: 15 },
    { label: '1 hour', value: 60 },
    { label: '8 hours', value: 480 },
    { label: '24 hours', value: 1440 },
    { label: '7 days', value: 10080 },
    { label: '30 days', value: 43200 },
  ];

  const generate = async () => {
    setLoading(true);
    setError('');
    setToken('');
    try {
      const res = await fetch(`/workspace/api/keys/jwt?minutes=${encodeURIComponent(minutes)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const tok = typeof data === 'string' ? data : (data?.Token as string | undefined);
      if (!tok) throw new Error('No token returned');
      setToken(tok);
    } catch (err) {
      console.error('Failed to generate token');
      console.error(err);
      setError('Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
  };

  return (
    <Modal title="API Keys" onClose={onClose}>
      <div class="space-y-6 text-sm">
        <section class="space-y-3">
          <h3 class="text-lg font-semibold">Generate JWT</h3>
          <div class="flex items-center gap-2 flex-wrap">
            <label class="text-neutral-300">Expires in:</label>
            <select
              class="bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
              onChange={(e) => setMinutes(Number((e.target as HTMLSelectElement).value))}
              value={minutes}
            >
              {presets.map((p) => (
                <option value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              step={1}
              class="w-28 bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
              value={minutes}
              onChange={(e) => setMinutes(Number((e.target as HTMLInputElement).value || '1'))}
              title="Minutes until expiration"
            />
            <Action disabled={loading} onClick={generate}>
              {loading ? 'Generating…' : 'Generate Token'}
            </Action>
          </div>
          {error && <div class="text-red-400">{error}</div>}
        </section>

        {token && (
          <section class="space-y-2">
            <h3 class="text-lg font-semibold">Your JWT</h3>
            <div class="flex flex-col gap-2">
              <textarea
                class="w-full h-32 bg-neutral-800 border border-neutral-700 rounded p-2 font-mono text-xs"
                readOnly
                value={token}
              />
              <div class="flex gap-2">
                <Action styleType={ActionStyleTypes.Outline} onClick={copy}>Copy</Action>
                <Action intentType={IntentTypes.Info} styleType={ActionStyleTypes.Outline} onClick={() => setToken('')}>
                  Clear
                </Action>
              </div>
              <p class="text-neutral-400">
                Keep this token secure. Rotate as needed by generating a new one.
              </p>
            </div>
          </section>
        )}
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

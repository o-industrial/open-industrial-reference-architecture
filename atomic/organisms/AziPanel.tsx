import {
  WorkspaceManager,
  IntentTypes,
  JSX,
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  HumanMessageChunk,
  ToolMessage,
  ToolMessageChunk,
  useEffect,
} from '../.deps.ts';
import { AziPanelTemplate } from '../templates/AziPanelTemplate.tsx';
import { AziChatInput } from '../molecules/azi/AziChatInput.tsx';
import { AziChatMessage } from '../molecules/azi/AziChatMessage.tsx';

export const IsIsland = true;

type Role = 'user' | 'azi' | 'tool';

type AziPanelProps = {
  workspaceMgr: WorkspaceManager;
  onClose?: () => void;
  intentTypes?: Partial<Record<Role, IntentTypes>>;
  renderMessage?: (message: string) => string;
};

export function AziPanel({
  workspaceMgr,
  onClose,
  intentTypes = {
    user: IntentTypes.Secondary,
    azi: IntentTypes.Info,
    tool: IntentTypes.Tertiary,
  },
  renderMessage,
}: AziPanelProps): JSX.Element {
  const { state, send, peek, isSending } = workspaceMgr.UseAzi();

  useEffect(() => {
    peek();
  }, []);

  useEffect(() => {
    if (state.Messages?.length === 0) {
      send('');
    }
  }, [state]);

  const resolveRole = (msg: unknown): Role => {
    if (msg instanceof HumanMessage || msg instanceof HumanMessageChunk)
      return 'user';
    if (msg instanceof ToolMessage || msg instanceof ToolMessageChunk)
      return 'tool';
    if (msg instanceof AIMessage || msg instanceof AIMessageChunk) return 'azi';
    return 'azi';
  };

  return (
    <AziPanelTemplate
      onClose={onClose}
      input={<AziChatInput onSend={send} disabled={isSending} />}
    >
      {state.Messages.map((msg, idx) => {
        const content = msg.content?.toString?.() ?? '';
        const role = resolveRole(msg);

        return (
          <AziChatMessage
            key={idx}
            align={role === 'user' ? 'right' : 'left'}
            badge={role === 'azi' ? 'Azi' : role === 'tool' ? 'Tool' : 'You'}
            content={content}
            intentType={intentTypes[role] ?? IntentTypes.None}
            inline
            renderMessage={renderMessage}
          />
        );
      })}
    </AziPanelTemplate>
  );
}

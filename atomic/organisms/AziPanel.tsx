import { WorkspaceManager, IntentTypes, JSX } from '../.deps.ts';
import { AziPanelTemplate } from '../templates/AziPanelTemplate.tsx';
import { AziChatInput } from '../molecules/azi/AziChatInput.tsx';
import { AziChatMessage } from '../molecules/azi/AziChatMessage.tsx';

type Role = 'user' | 'azi' | 'tool';

type AziPanelProps = {
  workspaceMgr: WorkspaceManager;
  onClose?: () => void;
  intentTypes?: Partial<Record<Role, IntentTypes>>;
};

export function AziPanel({
  workspaceMgr,
  onClose,
  intentTypes = {
    user: IntentTypes.Secondary,
    azi: IntentTypes.Info,
    tool: IntentTypes.Tertiary,
  },
}: AziPanelProps): JSX.Element {
  const { messages, send } = workspaceMgr.UseAzi();

  return (
    <AziPanelTemplate
      onClose={onClose}
      input={<AziChatInput onSend={(text) => send(text)} />}
    >
      {messages.map((msg, idx) => (
        <AziChatMessage
          key={idx}
          align={msg.role === 'user' ? 'right' : 'left'}
          badge={
            msg.role === 'azi' ? 'Azi' : msg.role === 'tool' ? 'Tool' : 'You'
          }
          content={msg.content}
          intentType={intentTypes[msg.role] ?? IntentTypes.None}
          inline
        />
      ))}
    </AziPanelTemplate>
  );
}

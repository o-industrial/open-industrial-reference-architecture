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
  useRef,
  useState,
  useCallback,
} from '../.deps.ts';

import { AziPanelTemplate } from '../templates/AziPanelTemplate.tsx';
import { AziChatInput } from '../molecules/azi/AziChatInput.tsx';
import { AziChatMessage } from '../molecules/azi/AziChatMessage.tsx';
import { AziManager, AziState } from '../../src/flow/managers/AziManager.ts';
import { string } from 'jsr:@fathym/common@0.2.272/third-party/zod';

export const IsIsland = true;

type Role = 'user' | 'azi' | 'tool';

type AziPanelProps = {
  workspaceMgr: WorkspaceManager;
  aziMgr: AziManager;
  onClose?: () => void;
  onStartSend?: (state: AziState) => void;
  onFinishSend?: (state: AziState) => void;
  onStateChange?: (state: AziState) => void;
  intentTypes?: Partial<Record<Role, IntentTypes>>;
  renderMessage?: (message: string) => string;
  extraInputs?: Record<string, unknown>;
  elementId?: string;
};

function ReasoningBlock({
  messages,
  isStreaming,
}: {
  messages: ToolMessage[];
  isStreaming: boolean;
}) {
  const renderMessage = (msg: ToolMessage, index: number) => {
    let parsed: unknown;
    let pretty = msg.content.toString();

    try {
      parsed = JSON.parse(msg.content.toString());
      pretty = JSON.stringify(parsed, null, 2);
    } catch {
      // fall back to plain text
    }

    return (
      <details
        key={index}
        class="text-sm text-tertiary my-2 bg-muted rounded px-4 py-2 overflow-hidden"
      >
        <summary class="cursor-pointer text-xs">🧠 Step {index + 1}</summary>
        <pre class="overflow-auto text-xs whitespace-pre-wrap mt-2 break-words">
          {pretty}
        </pre>
      </details>
    );
  };

  if (messages.length === 1) {
    return (
      <details class="text-sm text-tertiary my-2 max-w-[80%] overflow-hidden">
        <summary class="cursor-pointer text-xs">
          🧠 {isStreaming ? 'Reasoning…' : ''}
        </summary>
        <pre class="bg-muted rounded px-4 py-2 mt-2 overflow-auto text-xs whitespace-pre-wrap break-words">
          {renderMessage(messages[0], 0).props.children[1].props.children}
        </pre>
      </details>
    );
  }

  return (
    <div class="text-sm text-tertiary my-2 max-w-[80%]">
      {messages.map(renderMessage)}
    </div>
  );
}

export function AziPanel({
  workspaceMgr,
  onClose,
  onStartSend,
  onFinishSend,
  onStateChange,
  intentTypes = {
    user: IntentTypes.Secondary,
    azi: IntentTypes.Info,
    tool: IntentTypes.Tertiary,
  },
  renderMessage,
  aziMgr,
  extraInputs,
}: AziPanelProps): JSX.Element {
  const {
    state,
    isSending,
    send,
    peek,
    scrollRef,
    registerStreamAnchor,
  } = workspaceMgr.UseAzi(aziMgr);

  // Track when the initial peek has completed
  const hasPeekedRef = useRef(false);

  // Initial peek when mounted (and mark completion)
  useEffect(() => {
    console.log('[AziPanel] Initial peek()');
    (async () => {
      try {
        await peek();
      } finally {
        hasPeekedRef.current = true;
      }
    })();
  }, []);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Notify parent on state changes for live updates (e.g., errors)
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const wrappedSend = useCallback(
    async (...args: Parameters<typeof send>) => {
      onStartSend?.(stateRef.current);
      const result = await send(...args);     // run the real send
      onFinishSend?.(stateRef.current);             // call your callback afterwards
      return result;                          // preserve return value
    },
    [send, onStartSend, onFinishSend]
  );

  // After initial peek, if still empty, trigger a single empty message to prompt greeting
  const autoGreetSentRef = useRef(false);
  useEffect(() => {
    if (!hasPeekedRef.current) return;
    if (autoGreetSentRef.current) return;
    if ((state.Messages?.length ?? 0) === 0 && !isSending) {
      autoGreetSentRef.current = true;
      console.log('[AziPanel] No messages after peek – sending empty message');
      send('', extraInputs);
    }
  }, [state, isSending]);

  const resolveRole = (msg: unknown): Role => {
    if (msg instanceof HumanMessage || msg instanceof HumanMessageChunk)
      return 'user';
    if (msg instanceof ToolMessage || msg instanceof ToolMessageChunk)
      return 'tool';
    if (msg instanceof AIMessage || msg instanceof AIMessageChunk) return 'azi';
    return 'azi';
  };

  const renderedMessages: JSX.Element[] = [];
  const toolBlocks: { index: number; messages: ToolMessage[] }[] = [];

  let buffer: ToolMessage[] = [];

  for (let i = 0; i < state.Messages.length; i++) {
    const msg = state.Messages[i];
    const role = resolveRole(msg);
    const content = msg.content?.toString?.() ?? '';

    if (role === 'tool') {
      buffer.push(msg as ToolMessage);
      const next = state.Messages[i + 1];
      const nextRole = next ? resolveRole(next) : null;

      if (nextRole !== 'tool') {
        toolBlocks.push({ index: renderedMessages.length, messages: buffer });
        renderedMessages.push(<></>);
        buffer = [];
      }
    } else {
      if (buffer.length) {
        toolBlocks.push({ index: renderedMessages.length, messages: buffer });
        renderedMessages.push(<></>);
        buffer = [];
      }

      if (content) {
        renderedMessages.push(
          <AziChatMessage
            key={`msg-${i}`}
            align={role === 'user' ? 'right' : 'left'}
            badge={role === 'azi' ? 'Azi' : role === 'user' ? 'You' : 'Tool'}
            content={content}
            intentType={intentTypes[role] ?? IntentTypes.None}
            inline
            renderMessage={renderMessage}
            class="mb-3"
          />
        );
      }
    }
  }

  const lastToolBlockIndex = toolBlocks.length - 1;

  toolBlocks.forEach(({ index, messages }, i) => {
    const isLast = i === lastToolBlockIndex;
    renderedMessages[index] = (
      <ReasoningBlock
        key={`tool-${index}`}
        messages={messages}
        isStreaming={isLast && isSending}
      />
    );
  });

  return (
    <AziPanelTemplate
      onClose={onClose}
      input={<AziChatInput onSend={wrappedSend} extraInputs={extraInputs} disabled={isSending} />}
    >
      <div ref={scrollRef} class="overflow-y-auto h-full">
        {renderedMessages}

        <div
          ref={(el) => {
            registerStreamAnchor(el);
          }}
          class="h-4"
        />
      </div>
    </AziPanelTemplate>
  );
}

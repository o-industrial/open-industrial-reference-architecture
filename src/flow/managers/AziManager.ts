// deno-lint-ignore-file no-explicit-any
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
  RemoteRunnable,
  ToolMessage,
} from '../.deps.ts';

export type AziInputs = {
  Input?: string;
} & Record<string, unknown>;

export type AziState = {
  Messages: BaseMessage[];
} & Record<string, unknown>;

export class AziManager {
  protected state: AziState = { Messages: [] };
  protected listeners: Set<() => void> = new Set();
  protected circuit: RemoteRunnable<AziInputs, AziState, any>;
  protected sending = false;
  protected threadId: string;

  constructor(opts: { url: string; jwt?: string; threadId?: string }) {
    const { url, jwt, threadId = crypto.randomUUID() } = opts;

    this.threadId = threadId;

    this.circuit = new RemoteRunnable({
      url,
      options: {
        headers: { Authorization: jwt ? `Bearer ${jwt}` : '' },
      },
      fetch: fetch.bind(window),
    });

    console.info(`[AziManager] Initialized with thread ID: ${this.threadId}`);
  }

  // === Peek (hydrate full memory state) ===
  public async Peek(inputs?: AziInputs): Promise<void> {
    console.info('[AziManager] Peek initiated', { inputs });

    const state = await this.circuit.invoke(inputs ?? {}, {
      configurable: {
        thread_id: this.threadId,
        checkpoint_ns: 'current',
        peek: true,
      },
    });

    console.info('[AziManager] Peek response received', { state });

    this.state = state as AziState;
    this.emit();
  }

  // === Send (stream, then sync full state) ===
  public async Send(
    input: string,
    extraInputs?: Record<string, unknown>
  ): Promise<void> {
    if (this.sending) return;

    this.sending = true;
    this.emit();

    console.info('[AziManager] Send initiated', { input, extraInputs });

    try {
      const humanMsg = new HumanMessage(input);
      const aiMsg = new AIMessage('');
      this.state.Messages.push(humanMsg, aiMsg);
      this.emit();

      const toolStreams: Record<string, ToolMessage> = {};

      const events = await this.circuit.streamEvents(
        { Input: input, ...(extraInputs ?? {}) },
        {
          version: 'v2',
          configurable: {
            thread_id: this.threadId,
            checkpoint_ns: 'current',
          },
          recursionLimit: 100,
        }
      );

      for await (const event of events) {
        const { event: eventName, name, data } = event;

        console.debug('[AziManager] Streamed event received', {
          eventName,
          name,
          data,
        });

        // === Handle custom events ===
        if (eventName === 'on_custom_event' && name?.startsWith('thinky:')) {
          this.handleCustomEvent(name.replace('thinky:', ''), data);
        }

        // === Handle LLM streaming ===
        if (
          eventName === 'on_chat_model_stream' ||
          eventName === 'on_llm_stream'
        ) {
          const chunk = data?.chunk;
          const value =
            typeof chunk === 'string'
              ? chunk
              : chunk?.content?.toString?.() ?? chunk?.value ?? '';

          if (value && typeof value === 'string') {
            aiMsg.content += value;
            this.emit();
          }
        }

        // // === Handle tool stream ===
        // if (eventName === 'on_tool_stream') {
        //   const callId = data?.tool_call_id ?? data?.id ?? 'tool-call-unknown';
        //   const name = data?.name ?? 'tool';
        //   const contentChunk = data?.chunk ?? '';

        //   if (!toolStreams[callId]) {
        //     const toolMsg = new ToolMessage({
        //       tool_call_id: callId,
        //       name,
        //       content: '',
        //     });
        //     this.state.Messages.push(toolMsg);
        //     toolStreams[callId] = toolMsg;
        //   }

        //   // Accumulate the content
        //   toolStreams[callId].content += contentChunk;
        //   this.emit();
        // }
      }

      console.info('[AziManager] Stream complete — syncing final state');
      await this.Peek(extraInputs);
    } catch (err) {
      console.error('[AziManager] Send error', err);
    } finally {
      this.sending = false;
      this.emit();
    }
  }

  // === Accessors ===
  public GetState(): AziState {
    return {
      ...this.state,
      Messages: [...this.state.Messages],
    };
  }

  public IsSending(): boolean {
    return this.sending;
  }

  public OnStateChanged(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  protected emit(): void {
    for (const cb of this.listeners) cb();
  }

  // === Optional Custom Events ===
  protected handleCustomEvent(name: string, data: unknown): void {
    console.debug('[AziManager] Handling custom event', { name, data });

    switch (name) {
      case 'page_navigate':
        if (typeof data === 'string') location.href = data;
        else location.reload();
        break;
    }
  }
}

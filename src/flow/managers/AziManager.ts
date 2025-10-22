// deno-lint-ignore-file no-explicit-any
import { AIMessage, type BaseMessage, HumanMessage, RemoteRunnable } from '../.deps.ts';

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
  protected currentAbort: AbortController | null = null;
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
    extraInputs?: Record<string, unknown>,
  ): Promise<void> {
    if (this.sending) return;

    this.sending = true;
    this.emit();

    console.info('[AziManager] Send initiated', { input, extraInputs });
    const abort = new AbortController();
    this.currentAbort = abort;

    try {
      // Reset error state for a fresh run
      (this.state as any).Error = undefined;
      (this.state as any).Errors = [] as string[];

      const humanMsg = new HumanMessage(input);
      const aiMsg = new AIMessage('');
      this.state.Messages.push(humanMsg, aiMsg);
      this.emit();

      const events = await this.circuit.streamEvents(
        { Input: input, ...(extraInputs ?? {}) },
        {
          version: 'v2',
          configurable: {
            thread_id: this.threadId,
            checkpoint_ns: 'current',
          },
          recursionLimit: 100,
          signal: abort.signal,
        },
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

        // === Handle errors and related fields embedded in payload ===
        try {
          const foundErrors: string[] = [];
          let latestDataQuery: string | undefined;
          let latestErrorCode: string | undefined;

          const collect = (obj: unknown) => {
            if (!obj || typeof obj !== 'object') return;
            const rec: any = obj as any;

            // Single error field
            if (typeof rec.Error !== 'undefined') {
              const val = rec.Error;
              if (val != null) foundErrors.push(typeof val === 'string' ? val : String(val));
            }
            // Errors array
            if (Array.isArray(rec.Errors)) {
              for (const e of rec.Errors) {
                const msg = typeof e === 'string'
                  ? e
                  : (e?.message ?? e?.Message ?? e?.Error ?? String(e));
                foundErrors.push(String(msg));
              }
            }
            // Live query and error code updates
            if (typeof rec.DataQuery !== 'undefined' && rec.DataQuery != null) {
              latestDataQuery = String(rec.DataQuery);
            }
            if (typeof rec.ErrorCode !== 'undefined' && rec.ErrorCode != null) {
              latestErrorCode = String(rec.ErrorCode);
            }

            // Recurse into common containers
            for (const k of ['state', 'output', 'result', 'checkpoint', 'data']) {
              if (rec && typeof rec[k] === 'object') collect(rec[k]);
            }
          };

          collect(data);

          let emitted = false;
          if (foundErrors.length) {
            const errorsArr = ((this.state as any).Errors ?? []) as string[];
            for (const m of foundErrors) errorsArr.push(String(m));
            (this.state as any).Errors = errorsArr;
            (this.state as any).Error = String(foundErrors[foundErrors.length - 1]);
            emitted = true;
          }
          if (typeof latestDataQuery !== 'undefined') {
            (this.state as any).DataQuery = latestDataQuery;
            emitted = true;
          }
          if (typeof latestErrorCode !== 'undefined') {
            (this.state as any).ErrorCode = latestErrorCode;
            emitted = true;
          }
          if (emitted) this.emit();
        } catch (err) {
          console.log(err);
        }

        // === Handle error events immediately ===
        if (
          typeof eventName === 'string' &&
          (eventName.endsWith('_error') || eventName === 'on_error')
        ) {
          try {
            const errMsg = (data as any)?.error?.message ??
              (data as any)?.message ??
              (typeof (data as any)?.error === 'string' ? (data as any).error : undefined) ??
              (typeof data === 'string' ? data : '') ??
              'Unknown error';

            const msg = String(errMsg);
            const errorsArr = ((this.state as any).Errors ?? []) as string[];
            errorsArr.push(msg);
            (this.state as any).Errors = errorsArr;
            (this.state as any).Error = msg;
            this.emit();
          } catch (e) {
            console.warn('[AziManager] Failed to capture stream error', e);
          }
        }

        // === Handle LLM streaming ===
        if (
          eventName === 'on_chat_model_stream' ||
          eventName === 'on_llm_stream'
        ) {
          const chunk = data?.chunk;
          const value = typeof chunk === 'string'
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

      console.info('[AziManager] Stream complete – syncing final state');
      const __prevError = (this.state as any).Error;
      const __prevErrors = (this.state as any).Errors as string[] | undefined;
      const __prevDataQuery = (this.state as any).DataQuery as string | undefined;
      const __prevErrorCode = (this.state as any).ErrorCode as string | undefined;
      await this.Peek(extraInputs);
      // Merge any locally accumulated errors with the peeked state instead of overwriting it.
      try {
        const peekedErrors = ((this.state as any).Errors ?? []) as string[];
        const localErrors = (__prevErrors ?? []) as string[];
        const mergedErrors = [...peekedErrors, ...localErrors].filter(
          (e) => typeof e === 'string' && e.length > 0,
        );

        if (mergedErrors.length) {
          (this.state as any).Errors = mergedErrors;
          (this.state as any).Error = mergedErrors[mergedErrors.length - 1];
        } else if (typeof __prevError !== 'undefined' && __prevError !== null) {
          // Preserve a single error if present
          (this.state as any).Error = String(__prevError);
          (this.state as any).Errors = __prevErrors ?? [];
        }

        // Restore last streamed DataQuery and ErrorCode if present
        if (typeof __prevDataQuery !== 'undefined') {
          (this.state as any).DataQuery = __prevDataQuery;
        }
        if (typeof __prevErrorCode !== 'undefined') {
          (this.state as any).ErrorCode = __prevErrorCode;
        }
        this.emit();
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.info('[AziManager] Send aborted by user');
      } else if ((err as { name?: string })?.name === 'AbortError') {
        console.info('[AziManager] Send aborted', err);
      } else {
        console.error('[AziManager] Send error', err);
      }
    } finally {
      this.sending = false;
      if (this.currentAbort === abort) {
        this.currentAbort = null;
      }
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

  // Expose the thread id for callers that need to correlate
  // API actions (e.g., reset) with the current conversation.
  public GetThreadId(): string {
    return this.threadId;
  }

  public Stop(): void {
    if (!this.sending) return;
    if (!this.currentAbort) return;

    console.info('[AziManager] Stop requested - aborting current send');
    this.currentAbort.abort();
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

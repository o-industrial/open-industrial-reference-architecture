export type AziMessage = {
  role: 'user' | 'azi' | 'tool';
  content: string;
};

export class AziManager {
  protected messages: AziMessage[] = [
    {
      role: 'azi',
      content: 'Welcome. You can ask me about schemas, surfaces, or logic.',
    },
    {
      role: 'user',
      content: 'How do I connect this logic to a surface?',
    },
    {
      role: 'azi',
      content: 'Let me check the available schemas in memory...',
    },
    {
      role: 'tool',
      content: 'Queried: Found `RoomState.v1` and `RoomState.v2` as recent schemas.',
    },
    {
      role: 'azi',
      content:
        'I recommend promoting `RoomState.v2` — it includes surface and environment metadata.',
    },
    {
      role: 'user',
      content: 'Okay. What happens if I promote it?',
    },
    {
      role: 'azi',
      content:
        'It becomes part of your runtime memory. Any agent linked to that schema will begin receiving surface context.',
    },
  ];

  protected listeners: Set<() => void> = new Set<() => void>();

  // === Message Handling ===

  public Send(text: string): void {
    const userMsg: AziMessage = { role: 'user', content: text };

    const response: AziMessage = {
      role: 'azi',
      content: `I'm processing your request about "${text}".`,
    };

    this.messages.push(userMsg, response);
    this.emit();
  }

  public Reset(): void {
    this.messages = [
      {
        role: 'azi',
        content: 'Welcome. You can ask me about schemas, surfaces, or logic.',
      },
    ];
    this.emit();
  }

  // === State Access ===

  public GetMessages(): AziMessage[] {
    return [...this.messages];
  }

  // === Listener Management ===

  public OnMessagesChanged(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  protected emit(): void {
    for (const cb of this.listeners) cb();
  }
}

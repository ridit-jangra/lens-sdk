export interface ToolContext {
  repoPath: string;
  /** All messages in the current conversation so far */
  messages: unknown[];
}

export type ToolResult =
  | { kind: "text"; value: string }
  | { kind: "error"; value: string };

export interface Tool<TInput = string> {
  /**
   * Tag name used in XML: <name>...</name>
   * Must be lowercase, hyphens allowed. Must be unique.
   */
  name: string;

  /**
   * Short description shown in system prompt and /help.
   */
  description: string;

  /**
   * System prompt snippet explaining how to invoke this tool.
   * Return the full ### N. name — description block.
   */
  systemPromptEntry(index: number): string;

  /**
   * Parse the raw inner text of the XML tag into a typed input.
   * Throw or return null to signal a parse failure (tool will be skipped).
   */
  parseInput(body: string): TInput | null;

  /**
   * Execute the tool. May be async.
   * Return a ToolResult — the value is fed back to the model as the tool result.
   */
  execute(input: TInput, ctx: ToolContext): Promise<ToolResult> | ToolResult;

  /**
   * Whether this tool is safe to auto-approve (read-only, no side effects).
   * Defaults to false.
   */
  safe?: boolean;

  /**
   * Optional: permission prompt label shown to the user before execution.
   * e.g. "run", "read", "write", "delete"
   * Defaults to the tool name.
   */
  permissionLabel?: string;

  /**
   * Optional: summarise the input for display in the chat history.
   * Defaults to showing the raw input string.
   */
  summariseInput?(input: TInput): string;
}

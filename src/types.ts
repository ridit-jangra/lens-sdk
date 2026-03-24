export interface ToolContext {
  repoPath: string;
  /** All messages in the current conversation so far */
  messages: unknown[];
}

export type ToolResult =
  | { kind: "text"; value: string }
  | { kind: "error"; value: string };

export const TOOL_TAGS = {
  read: "read",
  net: "net",
  write: "write",
  delete: "delete",
  shell: "shell",
  git: "git",
  find: "find",
} as const;

export type ToolTag = (typeof TOOL_TAGS)[keyof typeof TOOL_TAGS];

export interface ToolFewShot {
  /**
   * The user message — typically a tool result or a usage example.
   * e.g. "Here is the output from my-tool:\n\nsome result\n\nPlease continue..."
   */
  user: string;

  /**
   * The expected assistant response to the above user message.
   * e.g. "Done — the tool returned: some result"
   */
  assistant: string;
}

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
   * Tag for the model to identify the usage of tool.
   */
  tag: ToolTag;

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

  /**
   * Optional: few-shot examples for this tool.
   * Injected into the conversation history so the model learns how to
   * invoke the tool and interpret its results correctly.
   * Each entry is a user/assistant pair — typically showing a tool result
   * followed by the correct model response.
   */
  fewShots?: ToolFewShot[];
}

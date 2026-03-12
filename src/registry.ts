export interface ToolContext {
  repoPath: string;
  provider?: string;
}

export interface Tool<TInput = unknown> {
  /** The XML tag name used in model responses, e.g. "write-file" */
  name: string;
  /** One-line description shown in the system prompt */
  description: string;
  /** If true, runs without asking the user for permission */
  safe?: boolean;
  /** Label shown in the permission prompt, e.g. "Write file" */
  permissionLabel?: string;
  /** The line added to the system prompt tools section */
  systemPromptEntry: () => string;
  /** Parse the raw XML body string into a typed input */
  parseInput: (body: string) => TInput;
  /** Short summary shown in the UI while running, e.g. the file path */
  summariseInput?: (input: TInput) => string;
  /** Run the tool and return a result string */
  execute: (input: TInput, ctx: ToolContext) => Promise<string>;
}

class ToolRegistry {
  private tools = new Map<string, Tool<unknown>>();

  register<T>(tool: Tool<T>): void {
    this.tools.set(tool.name, tool as Tool<unknown>);
  }

  get(name: string): Tool<unknown> | undefined {
    return this.tools.get(name);
  }

  names(): string[] {
    return Array.from(this.tools.keys());
  }

  all(): Tool<unknown>[] {
    return Array.from(this.tools.values());
  }

  buildSystemPromptSection(): string {
    return this.all()
      .map((t) => t.systemPromptEntry())
      .join("\n");
  }
}

// Singleton — shared across the running Lens process
export const registry = new ToolRegistry();

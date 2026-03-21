# @ridit/lens-sdk

SDK for building addons for **Lens**.

Lens addons extend the CLI with custom tools that the AI can call using
XML tags.

---

## Install

```bash
npm install @ridit/lens-sdk
```

---

## Usage

Create a `.js` file inside:

    ~/.lens/addons/

Then define a tool:

```js
const { defineTool } = require("@ridit/lens-sdk");

defineTool({
  name: "my-tool",
  description: "Does something custom",
  safe: false,
  permissionLabel: "Run my tool",

  systemPromptEntry: () =>
    `<my-tool>{"arg": "value"}</my-tool> — runs my custom tool`,

  parseInput: (body) => JSON.parse(body),

  summariseInput: (input) => input.arg,

  execute: async (input, ctx) => {
    // ctx.repoPath — absolute path to the current repo
    return { kind: "text", value: `Result: ${input.arg}` };
  },
});
```

Lens automatically loads all `.js` files in:

    ~/.lens/addons/

when it starts.

---

## Example

Example tool that shows recent git commits:

```js
const { defineTool } = require("@ridit/lens-sdk");
const { execSync } = require("child_process");

defineTool({
  name: "git-summary",
  description: "Summarises recent git commits",
  safe: true,

  systemPromptEntry: () =>
    `<git-summary>{"count":5}</git-summary> — show recent git commits`,

  parseInput: JSON.parse,

  summariseInput: (input) => `last ${input.count} commits`,

  execute: async (input, ctx) => {
    const count = input.count ?? 5;

    const output = execSync(
      `git log -n ${count} --pretty=format:"%h - %s (%an)"`,
      { cwd: ctx.repoPath },
    ).toString();

    return { kind: "text", value: `Recent commits:\n${output}` };
  },
});
```

---

## API

### `defineTool(tool: Tool<T>)`

Registers a new tool with the Lens runtime.

Tools must run **inside Lens**. Calling `defineTool()` outside of Lens
will throw an error.

---

## `Tool<T>` interface

| Field               | Type                                                  | Required | Description                               |
| ------------------- | ----------------------------------------------------- | -------- | ----------------------------------------- |
| `name`              | `string`                                              | ✅       | XML tag name (e.g. `"write-file"`)        |
| `description`       | `string`                                              | ✅       | One-line description used in the prompt   |
| `safe`              | `boolean`                                             |          | If `true`, runs without asking permission |
| `permissionLabel`   | `string`                                              |          | Label shown in the permission prompt      |
| `systemPromptEntry` | `() => string`                                        | ✅       | Entry added to the AI system prompt       |
| `parseInput`        | `(body: string) => T`                                 | ✅       | Parses the XML body into structured input |
| `summariseInput`    | `(input: T) => string`                                |          | Short summary shown in the UI             |
| `execute`           | `(input: T, ctx: ToolContext) => Promise<ToolResult>` | ✅       | Runs the tool                             |

---

## `ToolResult`

The object returned from `execute`:

| Field   | Type                | Description                              |
| ------- | ------------------- | ---------------------------------------- |
| `kind`  | `"text" \| "error"` | Whether the result is a success or error |
| `value` | `string`            | The result string returned to the AI     |

---

## `ToolContext`

| Field      | Type                  | Description                       |
| ---------- | --------------------- | --------------------------------- |
| `repoPath` | `string`              | Absolute path to the current repo |
| `provider` | `string \| undefined` | The active AI provider            |

---

## How Lens calls tools

When the AI wants to use a tool it emits XML like:

```xml
<git-summary>{"count":5}</git-summary>
```

Lens then:

1. Parses the body
2. Calls `parseInput`
3. Executes the tool
4. Returns the result to the AI

---

## Addon location

Lens loads addons from:

    ~/.lens/addons/

Example structure:

    ~/.lens
     └ addons
        ├ git-summary.js
        ├ search-code.js
        └ loc.js

# @ridit/lens-sdk

SDK for building [Lens](https://github.com/ridit/lens) addons.

## Install

```bash
npm install @ridit/lens-sdk
```

## Usage

Create a `.js` file in `~/.lens/addons/` and register your tool:

```js
const { registry } = require("@ridit/lens-sdk");

registry.register({
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
    return `Result: ${input.arg}`;
  },
});
```

Lens auto-loads all `.js` files in `~/.lens/addons/` at startup.

## API

### `registry.register(tool: Tool<T>)`

Register a new tool. The `Tool<T>` interface:

| Field               | Type                                              | Required | Description                               |
| ------------------- | ------------------------------------------------- | -------- | ----------------------------------------- |
| `name`              | `string`                                          | ✅       | XML tag name, e.g. `"write-file"`         |
| `description`       | `string`                                          | ✅       | One-liner for the system prompt           |
| `safe`              | `boolean`                                         |          | If `true`, runs without asking permission |
| `permissionLabel`   | `string`                                          |          | Label shown in the permission prompt      |
| `systemPromptEntry` | `() => string`                                    | ✅       | Line added to the model's system prompt   |
| `parseInput`        | `(body: string) => T`                             | ✅       | Parses the raw XML body                   |
| `summariseInput`    | `(input: T) => string`                            |          | Short summary shown in the UI             |
| `execute`           | `(input: T, ctx: ToolContext) => Promise<string>` | ✅       | Runs the tool                             |

### `ToolContext`

| Field      | Type                  | Description                       |
| ---------- | --------------------- | --------------------------------- |
| `repoPath` | `string`              | Absolute path to the current repo |
| `provider` | `string \| undefined` | The active AI provider            |

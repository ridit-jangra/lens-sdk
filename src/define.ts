import type { Tool } from "../dist";

export function defineTool(tool: Tool) {
  const registry = (globalThis as any).__lens_registry;

  if (!registry) {
    throw new Error("Lens runtime not detected. Tools must run inside Lens.");
  }

  if (!tool || typeof tool !== "object") {
    throw new Error("defineTool: tool must be an object");
  }

  if (!tool.name) {
    throw new Error("defineTool: tool.name is required");
  }

  if (!tool.description) {
    throw new Error(`defineTool(${tool.name}): description is required`);
  }

  if (typeof tool.execute !== "function") {
    throw new Error(`defineTool(${tool.name}): execute() is required`);
  }

  registry.register(tool);

  return tool;
}

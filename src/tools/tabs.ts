import { zodToJsonSchema } from "zod-to-json-schema";

import {
  SpawnTabTool,
  SwitchTabTool,
  ListTabsTool,
  CloseTabTool,
  ShowKeybindingsTool,
  HideKeybindingsTool,
  ScreenshotWithOverlayTool,
} from "@/types/tab-tools";

import type { Tool } from "./tool";

export const spawnTab: Tool = {
  schema: {
    name: SpawnTabTool.shape.name.value,
    description: SpawnTabTool.shape.description.value,
    inputSchema: zodToJsonSchema(SpawnTabTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { url } = SpawnTabTool.shape.arguments.parse(params || {});
    const result = await context.sendSocketMessage("browser_spawn_tab", {
      url: url || "about:blank",
    });
    return {
      content: [
        {
          type: "text",
          text: `Spawned new tab${url ? ` and navigated to ${url}` : ""}`,
        },
      ],
    };
  },
};

export const switchTab: Tool = {
  schema: {
    name: SwitchTabTool.shape.name.value,
    description: SwitchTabTool.shape.description.value,
    inputSchema: zodToJsonSchema(SwitchTabTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { tabId } = SwitchTabTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_switch_tab", { tabId });
    return {
      content: [
        {
          type: "text",
          text: `Switched to tab ${tabId}`,
        },
      ],
    };
  },
};

export const listTabs: Tool = {
  schema: {
    name: ListTabsTool.shape.name.value,
    description: ListTabsTool.shape.description.value,
    inputSchema: zodToJsonSchema(ListTabsTool.shape.arguments),
  },
  handle: async (context) => {
    const tabs = await context.sendSocketMessage("browser_list_tabs", {});
    return {
      content: [
        {
          type: "text",
          text: `Controlled tabs:\n${JSON.stringify(tabs, null, 2)}`,
        },
      ],
    };
  },
};

export const closeTab: Tool = {
  schema: {
    name: CloseTabTool.shape.name.value,
    description: CloseTabTool.shape.description.value,
    inputSchema: zodToJsonSchema(CloseTabTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { tabId } = CloseTabTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_close_tab", { tabId });
    return {
      content: [
        {
          type: "text",
          text: `Closed tab ${tabId}`,
        },
      ],
    };
  },
};

export const showKeybindings: Tool = {
  schema: {
    name: ShowKeybindingsTool.shape.name.value,
    description: ShowKeybindingsTool.shape.description.value,
    inputSchema: zodToJsonSchema(ShowKeybindingsTool.shape.arguments),
  },
  handle: async (context) => {
    const result = await context.sendSocketMessage(
      "browser_show_keybindings",
      {}
    );
    return {
      content: [
        {
          type: "text",
          text: `Showing keybindings. Available bindings: ${result.bindings?.join(", ") || "none"}`,
        },
      ],
    };
  },
};

export const hideKeybindings: Tool = {
  schema: {
    name: HideKeybindingsTool.shape.name.value,
    description: HideKeybindingsTool.shape.description.value,
    inputSchema: zodToJsonSchema(HideKeybindingsTool.shape.arguments),
  },
  handle: async (context) => {
    await context.sendSocketMessage("browser_hide_keybindings", {});
    return {
      content: [
        {
          type: "text",
          text: "Keybindings hidden",
        },
      ],
    };
  },
};

export const screenshotWithOverlay: Tool = {
  schema: {
    name: ScreenshotWithOverlayTool.shape.name.value,
    description: ScreenshotWithOverlayTool.shape.description.value,
    inputSchema: zodToJsonSchema(ScreenshotWithOverlayTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { fullPage } = ScreenshotWithOverlayTool.shape.arguments.parse(
      params || {}
    );

    // Show keybindings first
    await context.sendSocketMessage("browser_show_keybindings", {});

    // Wait a bit for overlays to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Take screenshot
    const screenshot = await context.sendSocketMessage(
      "browser_screenshot",
      {}
    );

    // Hide keybindings
    await context.sendSocketMessage("browser_hide_keybindings", {});

    return {
      content: [
        {
          type: "image",
          data: screenshot,
          mimeType: "image/png",
        },
        {
          type: "text",
          text: "Screenshot captured with keybinding overlays. Use the visible keybindings to interact with elements.",
        },
      ],
    };
  },
};

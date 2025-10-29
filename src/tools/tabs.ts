import { zodToJsonSchema } from "zod-to-json-schema";

import {
  CreateTabTool,
  CloseTabTool,
  SwitchTabTool,
  ListTabsTool,
  LabelElementsTool,
} from "@/types/mcp-tools";

import { Tool } from "./tool";

export const createTab: Tool = {
  schema: {
    name: CreateTabTool.shape.name.value,
    description: CreateTabTool.shape.description.value,
    inputSchema: zodToJsonSchema(CreateTabTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { url } = CreateTabTool.shape.arguments.parse(params);
    const result = await context.sendSocketMessage("browser_create_tab", { url });
    return {
      content: [
        {
          type: "text",
          text: `Created new tab with ID ${result.tabId} at ${url}`,
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
  handle: async (context, _params) => {
    const result = await context.sendSocketMessage("browser_list_tabs", {});
    const tabsList = (result as any).tabs
      .map((tab: any) => 
        `- Tab ${tab.id}: ${tab.title} (${tab.url})${tab.connected ? ' [AGENT CONNECTED]' : ''}${tab.active ? ' [ACTIVE]' : ''}`
      )
      .join('\n');
    
    return {
      content: [
        {
          type: "text",
          text: `Open tabs:\n${tabsList}`,
        },
      ],
    };
  },
};

export const labelElements: Tool = {
  schema: {
    name: LabelElementsTool.shape.name.value,
    description: LabelElementsTool.shape.description.value,
    inputSchema: zodToJsonSchema(LabelElementsTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { show } = LabelElementsTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_label_elements", { show });
    return {
      content: [
        {
          type: "text",
          text: show ? "Element labels shown" : "Element labels hidden",
        },
      ],
    };
  },
};

import { z } from "zod";

// Tab management tools
export const SpawnTabTool = z.object({
  name: z.literal("browser_spawn_tab"),
  description: z.literal("Spawn a new browser tab under agent control"),
  arguments: z.object({
    url: z.string().optional().describe("Optional URL to open in the new tab"),
  }),
});

export const SwitchTabTool = z.object({
  name: z.literal("browser_switch_tab"),
  description: z.literal("Switch to a specific controlled tab"),
  arguments: z.object({
    tabId: z.number().describe("The ID of the tab to switch to"),
  }),
});

export const ListTabsTool = z.object({
  name: z.literal("browser_list_tabs"),
  description: z.literal("List all controlled browser tabs"),
  arguments: z.object({}),
});

export const CloseTabTool = z.object({
  name: z.literal("browser_close_tab"),
  description: z.literal("Close a controlled browser tab"),
  arguments: z.object({
    tabId: z.number().describe("The ID of the tab to close"),
  }),
});

// Visual overlay tools
export const ShowKeybindingsTool = z.object({
  name: z.literal("browser_show_keybindings"),
  description: z.literal(
    "Show Vimium-style keybinding overlays on interactive elements for visual selection"
  ),
  arguments: z.object({}),
});

export const HideKeybindingsTool = z.object({
  name: z.literal("browser_hide_keybindings"),
  description: z.literal("Hide the keybinding overlays"),
  arguments: z.object({}),
});

export const ScreenshotWithOverlayTool = z.object({
  name: z.literal("browser_screenshot_with_overlay"),
  description: z.literal(
    "Take a screenshot with Vimium-style keybinding overlays for element selection"
  ),
  arguments: z.object({
    fullPage: z
      .boolean()
      .optional()
      .describe("Capture full page or just viewport"),
  }),
});

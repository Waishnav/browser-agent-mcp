import { z } from "zod";

// Navigation tools
export const NavigateTool = z.object({
  name: z.literal("browser_navigate"),
  description: z.literal("Navigate to a URL"),
  arguments: z.object({
    url: z.string().describe("The URL to navigate to"),
  }),
});

export const GoBackTool = z.object({
  name: z.literal("browser_navigate_back"),
  description: z.literal("Navigate back to the previous page"),
  arguments: z.object({}),
});

export const GoForwardTool = z.object({
  name: z.literal("browser_navigate_forward"),
  description: z.literal("Navigate forward to the next page"),
  arguments: z.object({}),
});

// Interaction tools
export const ClickTool = z.object({
  name: z.literal("browser_click"),
  description: z.literal("Click on an element"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Element reference from snapshot"),
  }),
});

export const HoverTool = z.object({
  name: z.literal("browser_hover"),
  description: z.literal("Hover over an element"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Element reference from snapshot"),
  }),
});

export const TypeTool = z.object({
  name: z.literal("browser_type"),
  description: z.literal("Type text into an element"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Element reference from snapshot"),
    text: z.string().describe("Text to type"),
  }),
});

export const SelectOptionTool = z.object({
  name: z.literal("browser_select_option"),
  description: z.literal("Select an option in a dropdown"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Element reference from snapshot"),
    values: z.array(z.string()).describe("Values to select"),
  }),
});

export const DragTool = z.object({
  name: z.literal("browser_drag"),
  description: z.literal("Drag an element to another element"),
  arguments: z.object({
    startElement: z.string().describe("Source element description"),
    startRef: z.string().describe("Source element reference"),
    endElement: z.string().describe("Target element description"),
    endRef: z.string().describe("Target element reference"),
  }),
});

// Utility tools
export const PressKeyTool = z.object({
  name: z.literal("browser_press_key"),
  description: z.literal("Press a keyboard key"),
  arguments: z.object({
    key: z.string().describe("Key to press"),
  }),
});

export const WaitTool = z.object({
  name: z.literal("browser_wait"),
  description: z.literal("Wait for a specified time"),
  arguments: z.object({
    time: z.number().describe("Time to wait in seconds"),
  }),
});

// Snapshot tools
export const SnapshotTool = z.object({
  name: z.literal("browser_snapshot"),
  description: z.literal("Capture accessibility snapshot of the page"),
  arguments: z.object({}),
});

export const ScreenshotTool = z.object({
  name: z.literal("browser_screenshot"),
  description: z.literal("Take a screenshot of the current page"),
  arguments: z.object({}),
});

export const GetConsoleLogsTool = z.object({
  name: z.literal("browser_get_console_logs"),
  description: z.literal("Get console logs from the page"),
  arguments: z.object({}),
});

import { z } from "zod";

// Tool definitions for MCP
export const SnapshotTool = z.object({
  name: z.literal("browser_snapshot"),
  description: z.literal("Capture accessibility snapshot of the current page"),
  arguments: z.object({}),
});

export const ClickTool = z.object({
  name: z.literal("browser_click"),
  description: z.literal("Perform click on a web page element"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Exact target element reference from the page snapshot"),
    button: z.enum(["left", "right", "middle"]).optional().describe("Button to click, defaults to left"),
    doubleClick: z.boolean().optional().describe("Whether to perform a double click"),
    modifiers: z.array(z.enum(["Alt", "Control", "ControlOrMeta", "Meta", "Shift"])).optional(),
  }),
});

export const HoverTool = z.object({
  name: z.literal("browser_hover"),
  description: z.literal("Hover over element on page"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Exact target element reference from the page snapshot"),
  }),
});

export const TypeTool = z.object({
  name: z.literal("browser_type"),
  description: z.literal("Type text into editable element"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Exact target element reference from the page snapshot"),
    text: z.string().describe("Text to type into the element"),
    slowly: z.boolean().optional().describe("Whether to type one character at a time"),
    submit: z.boolean().optional().describe("Whether to submit entered text (press Enter after)"),
  }),
});

export const SelectOptionTool = z.object({
  name: z.literal("browser_select_option"),
  description: z.literal("Select an option in a dropdown"),
  arguments: z.object({
    element: z.string().describe("Human-readable element description"),
    ref: z.string().describe("Exact target element reference from the page snapshot"),
    values: z.array(z.string()).describe("Array of values to select in the dropdown"),
  }),
});

export const DragTool = z.object({
  name: z.literal("browser_drag"),
  description: z.literal("Perform drag and drop between two elements"),
  arguments: z.object({
    startElement: z.string().describe("Human-readable source element description"),
    startRef: z.string().describe("Exact source element reference from the page snapshot"),
    endElement: z.string().describe("Human-readable target element description"),
    endRef: z.string().describe("Exact target element reference from the page snapshot"),
  }),
});

export const NavigateTool = z.object({
  name: z.literal("browser_navigate"),
  description: z.literal("Navigate to a URL"),
  arguments: z.object({
    url: z.string().describe("The URL to navigate to"),
  }),
});

export const GoBackTool = z.object({
  name: z.literal("browser_navigate_back"),
  description: z.literal("Go back to the previous page"),
  arguments: z.object({}),
});

export const GoForwardTool = z.object({
  name: z.literal("browser_navigate_forward"),
  description: z.literal("Go forward to the next page"),
  arguments: z.object({}),
});

export const WaitTool = z.object({
  name: z.literal("browser_wait_for"),
  description: z.literal("Wait for a specified time to pass"),
  arguments: z.object({
    time: z.number().describe("The time to wait in seconds"),
  }),
});

export const PressKeyTool = z.object({
  name: z.literal("browser_press_key"),
  description: z.literal("Press a key on the keyboard"),
  arguments: z.object({
    key: z.string().describe("Name of the key to press or a character to generate, such as `ArrowLeft` or `a`"),
  }),
});

export const GetConsoleLogsTool = z.object({
  name: z.literal("browser_console_messages"),
  description: z.literal("Returns all console messages"),
  arguments: z.object({}),
});

export const ScreenshotTool = z.object({
  name: z.literal("browser_take_screenshot"),
  description: z.literal("Take a screenshot of the current page"),
  arguments: z.object({
    element: z.string().optional().describe("Human-readable element description to screenshot"),
    ref: z.string().optional().describe("Exact target element reference from the page snapshot"),
    fullPage: z.boolean().optional().describe("Whether to capture the full scrollable page"),
  }),
});

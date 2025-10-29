# API Reference - Browser Agent MCP

This document provides a comprehensive reference for all MCP tools available in Browser Agent MCP.

## Navigation Tools

### browser_navigate

Navigate to a URL.

**Arguments:**
- `url` (string, required): The URL to navigate to

**Example:**
```json
{
  "url": "https://github.com"
}
```

**Returns:**
- Page snapshot with URL, title, and accessibility tree

---

### browser_navigate_back

Go back to the previous page in history.

**Arguments:** None

**Returns:**
- Page snapshot after navigation

---

### browser_navigate_forward

Go forward to the next page in history.

**Arguments:** None

**Returns:**
- Page snapshot after navigation

---

## Interaction Tools

### browser_click

Click on an element.

**Arguments:**
- `element` (string, required): Human-readable element description
- `ref` (string, required): CSS selector or XPath to the element
- `button` (string, optional): "left" (default), "right", or "middle"
- `doubleClick` (boolean, optional): Perform double-click
- `modifiers` (array, optional): Modifier keys ["Alt", "Control", "ControlOrMeta", "Meta", "Shift"]

**Example:**
```json
{
  "element": "Submit button",
  "ref": "button[type='submit']",
  "button": "left"
}
```

**Returns:**
- Success message
- Page snapshot after click

---

### browser_hover

Hover over an element.

**Arguments:**
- `element` (string, required): Human-readable element description
- `ref` (string, required): CSS selector or XPath to the element

**Example:**
```json
{
  "element": "User menu",
  "ref": "#user-menu"
}
```

**Returns:**
- Success message
- Page snapshot

---

### browser_type

Type text into an input element.

**Arguments:**
- `element` (string, required): Human-readable element description
- `ref` (string, required): CSS selector or XPath to the element
- `text` (string, required): Text to type
- `slowly` (boolean, optional): Type character by character (default: false)
- `submit` (boolean, optional): Press Enter after typing (default: false)

**Example:**
```json
{
  "element": "Search box",
  "ref": "input[name='q']",
  "text": "browser automation",
  "submit": true
}
```

**Returns:**
- Success message
- Page snapshot after typing

---

### browser_select_option

Select option(s) in a dropdown.

**Arguments:**
- `element` (string, required): Human-readable element description
- `ref` (string, required): CSS selector or XPath to the select element
- `values` (array of strings, required): Values to select

**Example:**
```json
{
  "element": "Country dropdown",
  "ref": "select[name='country']",
  "values": ["US"]
}
```

**Returns:**
- Success message
- Page snapshot

---

### browser_press_key

Press a keyboard key.

**Arguments:**
- `key` (string, required): Key name (e.g., "Enter", "Tab", "ArrowDown", "a")

**Example:**
```json
{
  "key": "Enter"
}
```

**Returns:**
- Success message

---

## Tab Management Tools

### browser_create_tab

Create a new browser tab.

**Arguments:**
- `url` (string, required): URL to open in the new tab

**Example:**
```json
{
  "url": "https://news.ycombinator.com"
}
```

**Returns:**
- New tab ID
- Success message

---

### browser_close_tab

Close a browser tab.

**Arguments:**
- `tabId` (number, required): ID of the tab to close

**Example:**
```json
{
  "tabId": 123
}
```

**Returns:**
- Success message

---

### browser_switch_tab

Switch to a different tab.

**Arguments:**
- `tabId` (number, required): ID of the tab to switch to

**Example:**
```json
{
  "tabId": 124
}
```

**Returns:**
- Success message

---

### browser_list_tabs

List all open browser tabs.

**Arguments:** None

**Returns:**
- List of tabs with:
  - Tab ID
  - Title
  - URL
  - Active status
  - Agent connection status

**Example output:**
```
Open tabs:
- Tab 123: GitHub [AGENT CONNECTED] [ACTIVE]
- Tab 124: Hacker News
- Tab 125: Google
```

---

## Visual Aid Tools

### browser_label_elements

Show or hide Vimium-style labels on actionable elements.

**Arguments:**
- `show` (boolean, required): true to show labels, false to hide

**Example:**
```json
{
  "show": true
}
```

**Returns:**
- Success message

**Notes:**
- Labels appear as yellow badges with letters (a, b, c, etc.)
- Only visible elements with actions are labeled
- Makes element selection more precise

---

### browser_take_screenshot

Capture a screenshot of the page.

**Arguments:**
- `element` (string, optional): Element to screenshot
- `ref` (string, optional): CSS selector for element
- `fullPage` (boolean, optional): Capture full scrollable page

**Example:**
```json
{
  "fullPage": true
}
```

**Returns:**
- Base64-encoded PNG image

---

### browser_snapshot

Capture an accessibility tree snapshot of the page.

**Arguments:** None

**Returns:**
- Page URL
- Page title
- YAML-formatted accessibility tree showing:
  - Element roles
  - Element labels
  - Hierarchical structure

**Example output:**
```yaml
- Page URL: https://github.com
- Page Title: GitHub
- Page Snapshot
```yaml
- navigation
  - link: "GitHub"
  - textbox: "Search"
  - button: "Sign in"
- main
  - heading: "Welcome to GitHub"
  - button: "Sign up"
```
```

---

## Utility Tools

### browser_wait_for

Wait for a specified amount of time.

**Arguments:**
- `time` (number, required): Time to wait in seconds

**Example:**
```json
{
  "time": 2.5
}
```

**Returns:**
- Success message

---

### browser_console_messages

Get all console log messages from the page.

**Arguments:** None

**Returns:**
- Array of console log messages (JSON)

**Notes:**
- Captures console.log, console.error, console.warn, etc.
- Useful for debugging

---

## Message Types

All communication between the MCP server and browser extension uses WebSocket messages with this structure:

```typescript
{
  id: number,           // Unique message ID
  type: string,         // Command type (e.g., "browser_click")
  payload: object       // Command-specific data
}
```

Response format:

```typescript
{
  id: number,           // Matches request ID
  result?: any,         // Command result
  error?: string        // Error message if failed
}
```

## Element Selectors

Elements can be referenced using:

1. **CSS Selectors**:
   - `#user-menu` - ID selector
   - `.btn-primary` - Class selector
   - `button[type='submit']` - Attribute selector
   - `nav > a:first-child` - Complex selector

2. **XPath**:
   - `//button[text()='Submit']` - By text content
   - `//input[@name='email']` - By attribute
   - `(//a)[1]` - By position

3. **Element Labels** (when shown):
   - After calling `browser_label_elements`, elements get labels like "a", "b", "c"
   - Reference by label for precision

## Visual Feedback

All interactions provide visual feedback:

1. **Agent Status Bar** (top of page):
   - Shows agent connection status
   - Displays current action
   - Can be closed with × button

2. **Agent Cursor** (🎯):
   - Appears before element interactions
   - Moves to target element
   - Pulses during action

3. **Element Labels** (when enabled):
   - Yellow badges with letters
   - Visible on all actionable elements
   - Can be toggled on/off

## Error Handling

Common errors and solutions:

### "Element not found"
- Element doesn't exist or selector is incorrect
- Try: Take a snapshot to verify page state
- Try: Use `browser_label_elements` to see all interactive elements

### "No connected tab"
- No browser tab is connected to the agent
- Solution: Click extension icon and "Connect This Tab"

### "MCP Server disconnected"
- WebSocket connection lost
- Solution: Restart MCP server
- Check: Ensure port 9222 is available

### "Timeout waiting for response"
- Command took too long (>30s)
- Try: Increase timeout in code
- Check: Page is fully loaded

## Configuration

### WebSocket Port

Default: `9222`

To change, edit `src/config/mcp.config.ts`:

```typescript
export const mcpConfig = {
  defaultWsPort: 9223,  // Your custom port
  errors: {
    noConnectedTab: "No connected tab",
  },
};
```

### Timeouts

Default timeout for commands: 30 seconds

To customize per command:

```typescript
await context.sendSocketMessage(
  "browser_click",
  { element: "button", ref: "button" },
  { timeoutMs: 60000 }  // 60 seconds
);
```

## Best Practices

1. **Use specific selectors**: More specific = more reliable
2. **Enable labels for complex pages**: Makes selection easier
3. **Take snapshots between actions**: Understand current state
4. **Handle dynamic content**: Use `browser_wait_for` when needed
5. **Close unused tabs**: Better performance
6. **Check console for errors**: Use `browser_console_messages`

## Extension API

The Chrome extension also provides internal APIs:

### Background Worker

- Manages WebSocket connection
- Handles tab orchestration
- Routes messages between MCP server and content scripts

### Content Script

- Executes DOM manipulation
- Shows visual overlays
- Captures screenshots and snapshots

### Popup UI

- User interface for connection management
- Shows connection status
- Lists all tabs with agent status

## Security Considerations

1. **Permissions**: Extension requires broad permissions but only acts on connected tabs
2. **Local-only**: All communication happens over local WebSocket
3. **User control**: Users must explicitly connect tabs
4. **No remote data**: Nothing is sent to external servers

## Extending the API

To add new tools:

1. Define tool schema in `src/types/mcp-tools.ts`
2. Add message type to `src/types/messages.ts`
3. Implement handler in appropriate file under `src/tools/`
4. Add to tool list in `src/index.ts`
5. Handle message in `extension/scripts/content.js`

Example:

```typescript
// In src/types/mcp-tools.ts
export const MyNewTool = z.object({
  name: z.literal("browser_my_action"),
  description: z.literal("Description of my action"),
  arguments: z.object({
    param: z.string().describe("Parameter description"),
  }),
});

// In src/tools/custom.ts
export const myAction: Tool = {
  schema: {
    name: MyNewTool.shape.name.value,
    description: MyNewTool.shape.description.value,
    inputSchema: zodToJsonSchema(MyNewTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { param } = MyNewTool.shape.arguments.parse(params);
    await context.sendSocketMessage("browser_my_action", { param });
    return {
      content: [{ type: "text", text: "Action completed" }],
    };
  },
};
```

## Support

For issues or questions:
- Check the [Usage Examples](USAGE_EXAMPLES.md)
- Review the [Installation Guide](INSTALLATION.md)
- Open an issue on GitHub

# Browser Agent MCP - Usage Examples

This guide demonstrates how to use the Browser Agent MCP extension with AI applications.

## Basic Setup

### 1. Start the MCP Server

```bash
# From the repository root
npm install
npm run build
node dist/index.js
```

The server will start on WebSocket port 9001 by default.

### 2. Load the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` directory from this repository

### 3. Connect Extension to Server

1. Click the Browser Agent MCP extension icon in the Chrome toolbar
2. The side panel will open
3. Verify the server URL is `ws://localhost:9001`
4. Click "Connect"
5. You should see a green "Connected" status

## MCP Configuration

### For Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "node",
      "args": ["/path/to/browser-agent-mcp/dist/index.js"]
    }
  }
}
```

### For Cursor/VS Code

Add to your MCP settings:

```json
{
  "mcp.servers": {
    "browser-agent": {
      "command": "node",
      "args": ["/path/to/browser-agent-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

## Example Use Cases

### Example 1: Basic Navigation and Interaction

**Prompt to AI:**
```
Please navigate to https://example.com and click on the "More information" link.
```

**What happens:**
1. AI calls `browser_spawn_tab` (if needed)
2. AI calls `browser_navigate` with URL
3. AI calls `browser_snapshot` to see the page
4. AI calls `browser_click` with the element reference
5. Visual overlay shows each action in real-time

### Example 2: Form Filling with Visual Feedback

**Prompt to AI:**
```
Go to https://example.com/contact and fill out the contact form:
- Name: John Doe
- Email: john@example.com
- Message: Hello, I'm interested in your services.
Then submit the form.
```

**What happens:**
1. AI navigates to the page
2. AI takes a snapshot to identify form fields
3. AI types into each field using `browser_type`
4. Visual overlays show typing actions
5. AI clicks submit button
6. You see the agent cursor moving and highlighting elements

### Example 3: Screenshot-Based Interaction (Vimium Style)

**Prompt to AI:**
```
Take a screenshot with keybinding overlays and tell me what interactive elements are available.
```

**What happens:**
1. AI calls `browser_screenshot_with_overlay`
2. Vimium-style labels appear on all clickable elements (a, b, c, aa, ab, etc.)
3. Screenshot is captured with overlays
4. AI can see and reference elements by their keybindings
5. AI can instruct: "Click element 'c'" using the keybinding reference

### Example 4: Multi-Tab Workflow

**Prompt to AI:**
```
Open three tabs:
1. Google.com and search for "web automation"
2. GitHub.com and search for "browser-mcp"
3. Reddit.com

Then give me a summary of what you see in each tab.
```

**What happens:**
1. AI spawns three tabs using `browser_spawn_tab`
2. AI switches between tabs using `browser_switch_tab`
3. AI performs actions in each tab
4. Side panel shows all controlled tabs
5. AI provides summary by switching between tabs

### Example 5: Data Extraction

**Prompt to AI:**
```
Go to https://news.ycombinator.com and extract the titles of the top 5 stories.
```

**What happens:**
1. AI navigates to the page
2. AI takes a snapshot to see the structure
3. AI identifies the story titles from the accessibility tree
4. AI returns the extracted data
5. Visual indicators show which elements were examined

## Available MCP Tools

### Navigation Tools
- `browser_navigate` - Navigate to URL
- `browser_navigate_back` - Go back
- `browser_navigate_forward` - Go forward

### Interaction Tools
- `browser_click` - Click element
- `browser_hover` - Hover over element
- `browser_type` - Type text
- `browser_select_option` - Select dropdown option
- `browser_press_key` - Press keyboard key
- `browser_wait` - Wait for time

### Tab Management Tools
- `browser_spawn_tab` - Create new controlled tab
- `browser_switch_tab` - Switch to specific tab
- `browser_list_tabs` - List all controlled tabs
- `browser_close_tab` - Close a tab

### Visual Tools
- `browser_show_keybindings` - Show Vimium-style overlays
- `browser_hide_keybindings` - Hide overlays
- `browser_screenshot_with_overlay` - Screenshot with keybindings

### Information Tools
- `browser_snapshot` - Get ARIA accessibility snapshot
- `browser_screenshot` - Capture screenshot
- `browser_get_console_logs` - Get console logs

## Visual Features Explained

### 1. Active Indicator Bar
A blue pulsing bar at the top of controlled tabs indicates the agent is active.

### 2. Status Badge
A badge in the top-right corner shows "Agent Active" when connected.

### 3. Custom Cursor
A blue cursor overlay shows where the agent is "looking" or about to interact.

### 4. Action Display
A tooltip at the bottom center shows the current action being performed.

### 5. Element Highlighting
When the agent interacts with an element, it gets highlighted with a blue outline and label.

### 6. Vimium Keybindings
Yellow labels (a, b, c, aa, ab, etc.) appear on interactive elements when requested, making it easy for the agent to reference specific elements.

## Tips for Best Results

1. **Use Screenshot with Overlay for Complex Pages**: When a page has many interactive elements, use `browser_screenshot_with_overlay` to help the AI identify elements visually.

2. **Wait After Navigation**: Always call `browser_wait` for 1-2 seconds after navigation to ensure the page has loaded.

3. **Check Snapshots**: Call `browser_snapshot` to verify the page structure before attempting interactions.

4. **Multi-Tab Organization**: Use `browser_list_tabs` to track which tabs are open and what they contain.

5. **Visual Verification**: The overlay system provides real-time feedback - watch the browser to see what the agent is doing.

6. **Element References**: When using snapshots, note the `[ref]` values to interact with specific elements.

## Troubleshooting

### Extension Not Connecting
- Verify the MCP server is running (`node dist/index.js`)
- Check the WebSocket URL in the side panel
- Look for errors in the browser console (F12)

### Actions Not Working
- Ensure the tab is under agent control (check side panel)
- Verify element references are correct
- Check if the page has loaded completely

### Visual Overlays Not Appearing
- Refresh the page after connecting
- Check if the content script injected properly
- Verify CSS is loaded (check Elements tab in DevTools)

### Performance Issues
- Close unnecessary controlled tabs
- Use `browser_screenshot_with_overlay` sparingly on very large pages
- Consider the viewport-only option for screenshots

## Security Notes

- Only connect to trusted MCP servers
- Review actions before the agent performs them
- Use in a dedicated browser profile for sensitive operations
- The extension has broad permissions - use responsibly

## Advanced Usage

### Custom Element Selection
You can use CSS selectors directly for element references:
```
Click on element with ref "#submit-button"
Type into element with ref "input[name='email']"
```

### Combining Tools
Chain multiple actions together:
```
1. Navigate to page
2. Show keybindings
3. Take screenshot
4. Hide keybindings
5. Click on element 'b' (from keybinding)
```

### Debugging
Enable verbose logging in the background script:
1. Open `chrome://extensions/`
2. Click "Service worker" under Browser Agent MCP
3. View console logs for debugging

## Contributing

If you find issues or have improvements, please open an issue or PR in the repository.

# Local Testing Guide for Browser Agent MCP

This guide walks you through testing this pull request locally, including both the MCP server and Chrome extension.

## Prerequisites

Before you begin, make sure you have:
- **Node.js** version 18 or higher installed
- **npm** package manager
- **Google Chrome** browser
- **Git** (to clone the repository)

## Step 1: Clone and Setup the Repository

```bash
# Clone the repository
git clone https://github.com/Waishnav/browser-agent-mcp.git
cd browser-agent-mcp

# Checkout this PR branch
git checkout copilot/build-chrome-extension-agent

# Install dependencies
npm install
```

This will install all required dependencies for the MCP server.

## Step 2: Build the MCP Server

```bash
# Build the TypeScript code
npm run build
```

You should see output like:
```
CLI Building entry: src/index.ts
ESM Build start
ESM dist/index.js 23.93 KB
ESM ⚡️ Build success in 24ms
```

The built server will be in the `dist/` directory.

## Step 3: Start the MCP Server

Open a terminal window and run:

```bash
node dist/index.js
```

The server will start and listen on WebSocket port **9001** by default.

**Expected output:**
The server runs silently in the background. You won't see much output unless there's an error or a connection is made.

**Tips:**
- Keep this terminal window open while testing
- If you see errors about port 9001 being in use, another process may be using it
- You can verify the server is running by checking if the process is active

## Step 4: Load the Chrome Extension

### 4.1 Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** using the toggle in the top-right corner

### 4.2 Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to your cloned repository directory
3. Select the `extension` folder (important: select the folder itself, not a file inside it)
4. Click **"Select"** or **"Open"**

### 4.3 Verify Extension is Loaded

You should see:
- **Browser Agent MCP** extension card appears
- Extension ID (a long string of letters)
- Status shows as **"Enabled"**
- Extension icon appears in Chrome toolbar (top-right, may be in extensions menu)

**Note:** If you don't see icon images, that's normal - PNG icons need to be generated from the SVG source. The extension will still work.

## Step 5: Connect Extension to MCP Server

### 5.1 Open the Side Panel

1. Click the **Browser Agent MCP** extension icon in Chrome toolbar
2. The side panel will open on the right side of the browser

### 5.2 Connect to Server

In the side panel:
1. Verify the **"MCP Server URL"** field shows: `ws://localhost:9001`
2. Click the **"Connect"** button

### 5.3 Verify Connection

You should see:
- Status indicator turns **green**
- Status text changes to **"Connected"**
- Button text changes to **"Disconnect"**
- Activity log shows: `[timestamp] Connected: Successfully connected to ws://localhost:9001`

**Troubleshooting:**
- If connection fails, ensure the MCP server is running (Step 3)
- Check for any errors in the browser console (F12 → Console tab)
- Verify WebSocket port 9001 is not blocked by firewall

## Step 6: Test Basic Functionality

### 6.1 Spawn a Controlled Tab

In the side panel:
1. Click **"Spawn New Tab"** button
2. A new browser tab should open
3. The new tab should appear in the **"Controlled Tabs"** list in the side panel
4. Activity log shows: `[timestamp] Tab Spawned: Created new tab: [tab_id]`

### 6.2 Verify Visual Overlays

In the newly spawned tab, you should see:
1. **Blue pulsing bar** at the very top of the page
2. **Status badge** in the top-right corner showing "Agent Active"
3. These indicate the tab is under agent control

### 6.3 Test Tab Management

In the side panel, under "Controlled Tabs":
1. Click **"Focus"** button → Should switch to that tab
2. Navigate to a website (e.g., `https://example.com`)
3. Return to side panel and see the URL updated

## Step 7: Development Mode - Auto-Rebuild on Changes

If you want to make changes and test them:

### 7.1 For MCP Server Changes

Open a new terminal and run:

```bash
# Watch mode - rebuilds on file changes
npm run build -- --watch
```

Keep this running. Any changes to `src/` files will automatically rebuild.

**After changes:**
1. Stop the server (Ctrl+C in the server terminal)
2. Restart: `node dist/index.js`
3. Reconnect extension from side panel

### 7.2 For Extension Changes

After modifying files in `extension/` directory:

1. Go to `chrome://extensions/`
2. Find **Browser Agent MCP** extension
3. Click the **refresh/reload icon** (circular arrow)
4. Refresh any tabs that have the extension active

## Step 8: Testing with AI Applications (Optional)

To test with Claude Desktop or other AI applications:

### For Claude Desktop

1. Locate your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add this configuration (replace `/full/path/to/` with your actual path):
   ```json
   {
     "mcpServers": {
       "browser-agent": {
         "command": "node",
         "args": ["/full/path/to/browser-agent-mcp/dist/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

4. In Claude, you can now use commands like:
   - "Use browser-agent to navigate to google.com"
   - "Take a screenshot of the current page"
   - "Show me keybinding overlays on the page"

## Debugging Tips

### Check MCP Server Logs

The server doesn't output much by default. For debugging:
- Add `console.log()` statements in `src/` files
- Rebuild: `npm run build`
- Restart the server

### Check Extension Logs

#### Background Script Logs
1. Go to `chrome://extensions/`
2. Find Browser Agent MCP
3. Click **"service worker"** link
4. A DevTools window opens showing background script logs

#### Content Script Logs
1. Open the tab with the extension active
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for logs from content-script.js

#### Side Panel Logs
1. Open the side panel
2. Right-click in the side panel
3. Select **"Inspect"**
4. Console tab shows side panel logs

### Common Issues

**"No connection to browser extension" error:**
- Extension not loaded or disabled
- Check extension is active in `chrome://extensions/`

**"Failed to connect to server" error:**
- MCP server not running
- Check server is running: `ps aux | grep node`
- Restart server: `node dist/index.js`

**Visual overlays not appearing:**
- Refresh the page after connecting
- Check content script is injected (F12 → Elements → look for overlay elements)

**Port 9001 already in use:**
- Another process is using the port
- Kill the process or change the port in `src/config/mcp.config.ts` (requires rebuild)

## Testing the Visual Features

### Test Visual Overlays

1. Spawn a controlled tab
2. Navigate to any website: `https://example.com`
3. You should see:
   - Blue pulsing indicator bar at top
   - "Agent Active" badge in top-right

### Test Vimium Keybindings

1. Open DevTools Console (F12)
2. Send a message to show keybindings:
   ```javascript
   chrome.runtime.sendMessage({
     type: 'EXECUTE_ACTION',
     action: 'browser_show_keybindings',
     payload: {}
   });
   ```
3. Yellow keybinding labels (a, b, c, etc.) should appear on clickable elements

### Test Screenshot

If testing with an AI application:
- Ask: "Take a screenshot with overlay showing keybindings"
- The `browser_screenshot_with_overlay` tool will be called

## Performance Testing

1. **Spawn multiple tabs** (5-10 tabs)
2. Check side panel lists them all
3. Switch between tabs using Focus buttons
4. Close tabs using Disconnect buttons
5. Verify memory usage doesn't grow excessively

## Next Steps

Once basic testing works:
1. Try the example workflows in `USAGE_GUIDE.md`
2. Test with different websites
3. Try form filling, clicking, typing actions
4. Test multi-tab workflows
5. Report any issues or bugs you find

## Stopping the Test

When you're done testing:

1. **Stop MCP Server**: Press Ctrl+C in the terminal running the server
2. **Disconnect Extension**: Click "Disconnect" in side panel
3. **Remove Extension** (optional):
   - Go to `chrome://extensions/`
   - Click "Remove" on Browser Agent MCP extension

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in browser DevTools and server terminal
3. Ensure all prerequisites are met
4. Try the steps again from the beginning
5. Open an issue on GitHub with:
   - Steps to reproduce
   - Error messages
   - Screenshots
   - Browser and Node.js versions

---

**Happy Testing! 🎉**

For more detailed usage examples, see `USAGE_GUIDE.md`.
For development guidelines, see `CONTRIBUTING.md`.

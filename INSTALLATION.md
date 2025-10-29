# Installation Guide - Browser Agent MCP

This guide will help you install and set up the Browser Agent MCP Chrome extension and MCP server.

## Prerequisites

- **Chrome Browser** (or Chromium-based browser like Edge, Brave)
- **Node.js** (v18 or higher)
- **npm** or **pnpm**

## Installation Steps

### Step 1: Install the MCP Server

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Waishnav/browser-agent-mcp.git
   cd browser-agent-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. The MCP server is now ready. You can start it with:
   ```bash
   node dist/index.js
   ```

   Or use it via MCP clients by configuring them to run: `node /path/to/browser-agent-mcp/dist/index.js`

### Step 2: Install the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **Load unpacked**

4. Select the `extension` folder from this repository:
   ```
   /path/to/browser-agent-mcp/extension
   ```

5. The Browser Agent MCP extension should now appear in your extensions list

6. Pin the extension to your toolbar for easy access (click the puzzle icon in the toolbar, then click the pin icon next to Browser Agent MCP)

### Step 3: Configure Your MCP Client

Configure your MCP client (e.g., Claude Desktop, VS Code, Cursor) to use the Browser Agent MCP server.

#### For Claude Desktop

Edit your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following configuration:

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "node",
      "args": ["/absolute/path/to/browser-agent-mcp/dist/index.js"]
    }
  }
}
```

#### For VS Code / Cursor

Install the MCP extension and configure it to use the Browser Agent MCP server.

## Usage

### 1. Start the MCP Server

The MCP server runs automatically when your MCP client starts. It will:
- Listen on WebSocket port 9222 (default)
- Wait for browser extension connections

### 2. Connect a Browser Tab

1. Open a webpage you want to control
2. Click the Browser Agent MCP extension icon in your toolbar
3. Click **"Connect This Tab"**
4. You should see "Agent Active" status with a purple bar at the top of the page

### 3. Use with Your AI Assistant

Now you can ask your AI assistant to control the browser! For example:

- "Navigate to google.com and search for 'weather'"
- "Take a screenshot of this page"
- "Click the 'Sign In' button"
- "Open a new tab and go to github.com"
- "List all open tabs"

## Troubleshooting

### Extension Not Connecting

1. **Check that the MCP server is running**
   - The server should be started by your MCP client
   - Default WebSocket port is 9222

2. **Verify the extension is loaded**
   - Go to `chrome://extensions/`
   - Ensure Browser Agent MCP is enabled

3. **Check the browser console**
   - Open DevTools (F12)
   - Look for any connection errors

### MCP Server Not Starting

1. **Verify Node.js version**
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Rebuild the project**
   ```bash
   npm run build
   ```

3. **Check the MCP client logs**
   - Look for error messages from the browser-agent MCP server

### Port Already In Use

If port 9222 is already in use, you can change it by modifying `src/config/mcp.config.ts`:

```typescript
export const mcpConfig = {
  defaultWsPort: 9223,  // Change to a different port
  // ...
};
```

Then rebuild the project with `npm run build`.

## Configuration

### WebSocket Port

Default: `9222`

To change, edit `src/config/mcp.config.ts` and rebuild.

### Extension Settings

Currently, the extension has minimal configuration. Future updates will add:
- Custom server URL configuration
- Visual overlay preferences
- Keyboard shortcuts

## Security Notes

- The extension can only control tabs that you explicitly connect
- All communication happens locally over WebSocket
- No data is sent to external servers
- The extension requires broad permissions to interact with web pages, but only acts when you connect a tab

## Next Steps

- Read the [Usage Examples](USAGE_EXAMPLES.md) to learn what you can do
- Check out the [API Documentation](API.md) for advanced usage
- Explore the visual overlay and element labeling features

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the extension console logs (DevTools)
3. Open an issue on GitHub with details about your setup and the problem

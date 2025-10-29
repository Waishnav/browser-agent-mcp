<a href="https://browsermcp.io">
  <img src="./.github/images/banner.png" alt="Browser MCP banner">
</a>

<h3 align="center">Browser MCP</h3>

<p align="center">
  Automate your browser with AI.
  <br />
  <a href="https://browsermcp.io"><strong>Website</strong></a> 
  •
  <a href="https://docs.browsermcp.io"><strong>Docs</strong></a>
</p>

## About

Browser Agent MCP is a Chrome extension-based browser automation system that uses the Model Context Protocol (MCP). It allows AI applications like Claude, Cursor, and VS Code to control your browser through visual feedback and multi-tab orchestration.

This forked implementation focuses on:
- **Visual Overlays**: Real-time visual feedback showing agent operation status, cursor, and actions
- **Multi-Tab Control**: Spawn and manage multiple browser tabs simultaneously
- **Enhanced Performance**: Screenshot-based approach with Vimium-style keybindings for improved agent efficiency

## Features

- ⚡ **Fast**: Local automation with WebSocket communication eliminates network latency
- 🔒 **Private**: All automation happens locally; browser activity stays on your device
- 👤 **Logged In**: Uses your existing browser profile with all logged-in sessions
- 🥷🏼 **Stealth**: Avoids bot detection using your real browser fingerprint
- 👁️ **Visual Feedback**: Overlay system shows agent cursor, actions, and status in real-time
- 📑 **Multi-Tab**: Control multiple tabs simultaneously with easy orchestration
- 🎯 **Visual Selection**: Vimium-style keybindings for efficient element selection

## Architecture

The system consists of three main components:

1. **MCP Server** (Node.js): Exposes browser automation tools via MCP protocol
2. **Chrome Extension**: Manages browser tabs and executes automation commands
3. **AI Application**: Uses MCP tools to control the browser (Claude, Cursor, etc.)

```
AI App ←→ MCP Server ←→ Chrome Extension ←→ Browser Tabs
```

## Installation & Usage

See the [Extension README](./extension/README.md) for detailed installation and usage instructions.

**Quick Start:**

1. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

2. Load the Chrome extension from the `extension` directory

3. Start the MCP server:
   ```bash
   node dist/index.js
   ```

4. Connect via the extension's side panel and start automating!

## Development Status

This is a forked implementation with significant enhancements:

✅ **Completed**:
- Standalone project (removed monorepo dependencies)
- Chrome extension manifest and structure
- Visual overlay system with agent cursor and status
- Multi-tab orchestration support
- Vimium-style keybinding system
- Screenshot-based visual feedback

🚧 **In Progress**:
- Integration testing with AI applications
- Performance optimization
- Documentation improvements

## Project Structure

```
browser-agent-mcp/
├── src/                    # MCP server source code
│   ├── config/            # Configuration files
│   ├── messaging/         # WebSocket messaging
│   ├── tools/             # MCP tool implementations
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── extension/             # Chrome extension
│   ├── background/        # Service worker
│   ├── content/           # Content scripts & overlays
│   ├── sidepanel/         # Side panel UI
│   └── manifest.json      # Extension manifest
└── dist/                  # Built MCP server
```

## Credits

Browser MCP was adapted from the [Playwright MCP server](https://github.com/microsoft/playwright-mcp) in order to automate the user's browser rather than creating new browser instances. This allows using the user's existing browser profile to use logged-in sessions and avoid bot detection mechanisms that commonly block automated browser use.

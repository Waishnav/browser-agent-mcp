<a href="https://browsermcp.io">
  <img src="./.github/images/banner.png" alt="Browser MCP banner">
</a>

<h3 align="center">Browser Agent MCP</h3>

<p align="center">
  Automate your browser with AI using Chrome Extension + MCP.
  <br />
  <a href="#features"><strong>Features</strong></a> 
  •
  <a href="INSTALLATION.md"><strong>Installation</strong></a>
  •
  <a href="USAGE_EXAMPLES.md"><strong>Examples</strong></a>
</p>

## About

Browser Agent MCP is a standalone Chrome extension + MCP server that enables AI assistants to control your browser with visual feedback and multi-tab orchestration. Unlike traditional browser automation, this provides:

- **Visual Overlay System**: Real-time visual feedback showing what the agent is doing
- **Vimium-style Element Labels**: Easy element identification and interaction
- **Multi-Tab Orchestration**: Control multiple tabs simultaneously
- **Local Operation**: All automation happens on your machine - fast and private

## Features

- ⚡ **Fast**: Automation happens locally on your machine, resulting in better performance without network latency
- 🔒 **Private**: Since automation happens locally, your browser activity stays on your device and isn't sent to remote servers
- 👤 **Logged In**: Uses your existing browser profile, keeping you logged into all your services
- 🥷🏼 **Stealth**: Avoids basic bot detection and CAPTCHAs by using your real browser fingerprint
- 🎯 **Visual Feedback**: See exactly what the agent is doing with visual overlays and cursor animations
- 🏷️ **Element Labels**: Vimium-style labels make element selection clear and precise
- 📑 **Multi-Tab Support**: Create, switch, and manage multiple browser tabs
- 📸 **Screenshot Integration**: Capture screenshots with visual overlays for agent feedback loops

## Quick Start

### Installation

1. **Install dependencies and build**:
   ```bash
   npm install
   npm run build
   ```

2. **Load the Chrome extension**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Configure your MCP client** (e.g., Claude Desktop):
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

4. **Connect a tab**:
   - Click the extension icon
   - Click "Connect This Tab"

See [INSTALLATION.md](INSTALLATION.md) for detailed setup instructions.

## Usage

Once connected, your AI assistant can control the browser:

```
Navigate to github.com and search for "browser automation"
```

```
Open 3 new tabs with different news sites and summarize the top headlines
```

```
Fill out the contact form with my details and submit it
```

See [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for more examples.

## Architecture

### Components

1. **MCP Server** (`src/`): WebSocket server that receives commands from AI assistants
2. **Chrome Extension** (`extension/`): 
   - Background worker: Manages WebSocket connection and tab orchestration
   - Content script: Performs DOM manipulation and shows visual overlays
   - Popup UI: User interface for connecting/disconnecting tabs

### Visual Features

- **Agent Status Bar**: Purple bar at top showing agent is active
- **Action Display**: Shows current action being performed
- **Agent Cursor**: Visual cursor (🎯) that moves to elements before interaction
- **Element Labels**: Vimium-style labels (a, b, c...) for easy element reference

### Communication Flow

```
AI Assistant (Claude, etc.)
    ↓ MCP Protocol
MCP Server (Node.js)
    ↓ WebSocket (port 9222)
Background Worker (Chrome Extension)
    ↓ Chrome Messages
Content Script (Web Page)
    ↓ DOM Manipulation
Web Page
```

## Available Tools

### Navigation
- `browser_navigate` - Navigate to a URL
- `browser_navigate_back` - Go back
- `browser_navigate_forward` - Go forward

### Interaction
- `browser_click` - Click elements
- `browser_hover` - Hover over elements
- `browser_type` - Type text
- `browser_select_option` - Select dropdown options
- `browser_press_key` - Press keyboard keys

### Tab Management
- `browser_create_tab` - Open new tabs
- `browser_close_tab` - Close tabs
- `browser_switch_tab` - Switch between tabs
- `browser_list_tabs` - List all open tabs

### Visual Aids
- `browser_label_elements` - Show/hide Vimium-style element labels
- `browser_take_screenshot` - Capture screenshots
- `browser_snapshot` - Get accessibility tree snapshot

### Utilities
- `browser_wait_for` - Wait for specified time
- `browser_console_messages` - Get console logs

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Watch Mode

```bash
npm run watch
```

## Project Structure

```
browser-agent-mcp/
├── src/                    # MCP Server source
│   ├── config/            # Configuration files
│   ├── messaging/         # WebSocket message handling
│   ├── tools/             # MCP tool implementations
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── extension/             # Chrome Extension
│   ├── scripts/           # Background & content scripts
│   ├── popup/             # Extension popup UI
│   ├── styles/            # CSS for visual overlays
│   └── manifest.json      # Extension manifest
└── dist/                  # Built MCP server
```

## Standalone Repository

This repository is a standalone fork that has been refactored from a monorepo structure. All workspace dependencies have been inlined, making it fully buildable and runnable on its own.

### Changes from Original

- ✅ Inlined all `@repo/*` and `@r2r/*` workspace dependencies
- ✅ Added Chrome extension infrastructure
- ✅ Implemented visual overlay system
- ✅ Added multi-tab orchestration
- ✅ Enhanced with Vimium-style element labels
- ✅ Improved screenshot capabilities

## Contributing

Contributions are welcome! This project accepts:

- Bug fixes
- New features
- Documentation improvements
- Example use cases

## Credits

Browser MCP was originally adapted from the [Playwright MCP server](https://github.com/microsoft/playwright-mcp). This fork extends it with:
- Chrome extension integration
- Visual feedback system
- Multi-tab orchestration
- Enhanced element interaction

## License

See [LICENSE](LICENSE) file for details.

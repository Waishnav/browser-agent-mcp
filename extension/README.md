# Browser Agent MCP - Chrome Extension

A Chrome extension that enables AI-controlled browser automation through the Model Context Protocol (MCP).

## Features

### ✨ Visual Overlay System
- **Active Indicator**: Visual bar at the top of controlled tabs
- **Status Badge**: Shows agent connection status
- **Custom Cursor**: AI agent cursor overlay
- **Action Display**: Real-time display of agent actions
- **Element Highlighting**: Visual feedback for interacted elements

### 📑 Multi-Tab Orchestration
- Spawn and control multiple browser tabs
- Switch between controlled tabs
- Monitor all active agent-controlled tabs
- Automatic cleanup on tab close

### 🎯 Screenshot-Based Visual Approach (Vimium-style)
- Vimium-like keybinding overlays for clickable elements
- Screenshot capture with visual overlays
- Structured action format for agent interaction
- Visual feedback for all operations

## Installation

1. **Build the MCP Server**:
   ```bash
   npm install
   npm run build
   ```

2. **Load the Extension**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `extension` directory from this repository

3. **Start the MCP Server**:
   ```bash
   node dist/index.js
   ```
   
   The server will start on WebSocket port 9001 by default.

## Usage

1. **Open Side Panel**:
   - Click the Browser Agent MCP extension icon in the Chrome toolbar
   - The side panel will open

2. **Connect to Server**:
   - Enter the MCP server URL (default: `ws://localhost:9001`)
   - Click "Connect"

3. **Control Tabs**:
   - Click "Spawn New Tab" to create a new agent-controlled tab
   - Use your AI application (Claude, Cursor, etc.) with MCP to control the browser

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   AI Application│◄────────┤   MCP Server     │
│ (Claude/Cursor) │  MCP    │   (Node.js)      │
└─────────────────┘         └──────────────────┘
                                      │
                                      │ WebSocket
                                      ▼
                            ┌──────────────────┐
                            │ Chrome Extension │
                            │  - Background    │
                            │  - Side Panel    │
                            │  - Content Script│
                            └──────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │  Browser Tabs    │
                            │  (DOM Control)   │
                            └──────────────────┘
```

## Available MCP Tools

### Navigation
- `browser_navigate` - Navigate to URL
- `browser_navigate_back` - Go back
- `browser_navigate_forward` - Go forward

### Interaction
- `browser_click` - Click on element
- `browser_hover` - Hover over element
- `browser_type` - Type text into element
- `browser_select_option` - Select dropdown option
- `browser_press_key` - Press keyboard key
- `browser_wait` - Wait for specified time

### Information
- `browser_snapshot` - Get ARIA accessibility snapshot
- `browser_screenshot` - Capture screenshot
- `browser_get_console_logs` - Get console logs

## Development

### Extension Structure
```
extension/
├── manifest.json              # Extension manifest
├── background/
│   └── service-worker.js     # Background service worker
├── content/
│   ├── content-script.js     # Content script with agent logic
│   └── overlay.css           # Visual overlay styles
├── sidepanel/
│   ├── sidepanel.html        # Side panel UI
│   ├── sidepanel.css         # Side panel styles
│   └── sidepanel.js          # Side panel logic
└── icons/
    └── *.png                 # Extension icons
```

### Message Flow

1. **MCP Server → Background Script**: WebSocket messages
2. **Background Script → Content Script**: Chrome extension messages
3. **Content Script → DOM**: Direct DOM manipulation
4. **Content Script → Background Script**: Action results
5. **Background Script → MCP Server**: Response via WebSocket

## Security Considerations

- The extension requires broad permissions to control browser tabs
- Only connect to trusted MCP servers
- Review actions performed by AI agents
- Consider using this in a dedicated browser profile

## Contributing

Contributions are welcome! Please read the main repository README for contribution guidelines.

## License

See LICENSE file in the root directory.

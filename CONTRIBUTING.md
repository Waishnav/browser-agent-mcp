# Contributing to Browser Agent MCP

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Chrome browser (for testing the extension)
- Git

### Getting Started

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/browser-agent-mcp.git
   cd browser-agent-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Load Extension in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` directory

5. **Start Development Server**
   ```bash
   npm run watch  # Auto-rebuilds on changes
   ```

## Project Structure

```
browser-agent-mcp/
├── src/                          # MCP server source
│   ├── config/                   # Configuration files
│   ├── messaging/                # WebSocket messaging
│   ├── tools/                    # MCP tool implementations
│   │   ├── common.ts            # Navigation, keyboard tools
│   │   ├── custom.ts            # Screenshot, console logs
│   │   ├── snapshot.ts          # ARIA snapshot tools
│   │   ├── tabs.ts              # Tab management tools
│   │   └── tool.ts              # Tool type definitions
│   ├── types/                    # TypeScript type definitions
│   │   ├── mcp-tool.ts          # MCP tool schemas
│   │   ├── messages.ts          # Message type definitions
│   │   └── tab-tools.ts         # Tab tool schemas
│   ├── utils/                    # Utility functions
│   ├── context.ts               # Server context
│   ├── index.ts                 # Main entry point
│   ├── server.ts                # MCP server setup
│   └── ws.ts                    # WebSocket server
├── extension/                    # Chrome extension
│   ├── background/              # Service worker
│   ├── content/                 # Content scripts
│   ├── sidepanel/               # Side panel UI
│   ├── icons/                   # Extension icons
│   └── manifest.json            # Extension manifest
├── dist/                        # Built server code
└── package.json                 # Dependencies and scripts
```

## Development Workflow

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update types as needed

3. **Test Your Changes**
   - Test the MCP server: `npm run build && node dist/index.js`
   - Test the extension: Reload in `chrome://extensions/`
   - Test integration with an AI application

4. **Run Type Checking**
   ```bash
   npm run typecheck
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

### Commit Message Convention

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add element drag and drop support
fix: resolve screenshot timeout issue
docs: update installation instructions
refactor: simplify message handling logic
```

## Code Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any` when possible
- Use Zod schemas for validation
- Follow existing patterns for consistency

### Chrome Extension

- Use modern JavaScript (ES2022+)
- Keep background script lightweight
- Minimize content script impact on page performance
- Handle errors gracefully with try-catch blocks

### MCP Tools

When adding new tools:

1. **Define the schema** in `src/types/` using Zod
2. **Implement the tool** in appropriate file under `src/tools/`
3. **Add to tool list** in `src/index.ts`
4. **Update message types** in `src/types/messages.ts` if needed
5. **Document the tool** in README and USAGE_GUIDE

Example:
```typescript
// 1. Define schema in src/types/mcp-tool.ts
export const MyNewTool = z.object({
  name: z.literal("browser_my_action"),
  description: z.literal("Description of what it does"),
  arguments: z.object({
    param: z.string().describe("Parameter description"),
  }),
});

// 2. Implement in src/tools/custom.ts
export const myNewTool: Tool = {
  schema: {
    name: MyNewTool.shape.name.value,
    description: MyNewTool.shape.description.value,
    inputSchema: zodToJsonSchema(MyNewTool.shape.arguments),
  },
  handle: async (context, params) => {
    const { param } = MyNewTool.shape.arguments.parse(params);
    const result = await context.sendSocketMessage("browser_my_action", { param });
    return {
      content: [{ type: "text", text: `Action completed: ${param}` }],
    };
  },
};

// 3. Add to index.ts
const customTools: Tool[] = [
  custom.getConsoleLogs,
  custom.screenshot,
  custom.myNewTool,  // Add here
];
```

### Extension Development

When modifying the extension:

1. **Background Script** (`extension/background/service-worker.js`)
   - Handle WebSocket connections
   - Manage tab lifecycle
   - Route messages between server and content scripts

2. **Content Script** (`extension/content/content-script.js`)
   - Execute browser automation actions
   - Manage visual overlays
   - Generate snapshots and screenshots

3. **Side Panel** (`extension/sidepanel/`)
   - Provide user interface
   - Display connection status
   - Show controlled tabs and activity log

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Server builds without errors: `npm run build`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Extension loads without errors
- [ ] WebSocket connection establishes
- [ ] Tab spawning and management works
- [ ] Visual overlays appear correctly
- [ ] All tools execute successfully
- [ ] Screenshots capture properly
- [ ] Vimium keybindings display correctly
- [ ] Multi-tab operations work
- [ ] Error handling works gracefully

### Integration Testing

Test with an AI application:

1. Configure Claude Desktop or Cursor
2. Start the MCP server
3. Connect the extension
4. Execute various commands through the AI
5. Verify results are correct

## Performance Considerations

- Keep content script lightweight
- Minimize DOM queries
- Use event delegation where possible
- Clean up event listeners and timers
- Avoid memory leaks in long-running tabs

## Security Considerations

- Validate all inputs from WebSocket
- Sanitize data before sending to content scripts
- Be cautious with eval() or similar constructs
- Handle sensitive data appropriately
- Follow Chrome extension security best practices

## Documentation

When adding features:

- Update README.md with new capabilities
- Add examples to USAGE_GUIDE.md
- Document new tools and their parameters
- Update architecture diagrams if needed
- Add JSDoc comments for complex functions

## Submitting a Pull Request

1. **Ensure your code works**
   - Test thoroughly
   - Fix any type errors
   - Update documentation

2. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Describe your changes clearly

4. **PR Description Should Include**
   - What changed and why
   - How to test the changes
   - Screenshots/videos for UI changes
   - Breaking changes (if any)
   - Related issues

5. **Respond to Feedback**
   - Address review comments
   - Make requested changes
   - Keep the PR focused and small

## Common Development Tasks

### Adding a New MCP Tool

See the "MCP Tools" section above for step-by-step instructions.

### Updating Visual Overlays

1. Modify CSS in `extension/content/overlay.css`
2. Update overlay logic in `extension/content/content-script.js`
3. Test in multiple scenarios
4. Ensure no visual conflicts with web pages

### Adding WebSocket Message Types

1. Define message type in `src/types/messages.ts`
2. Handle in background script if needed
3. Implement in content script
4. Update server-side handler

### Debugging

**Server Side:**
```bash
# Add console.log statements and run
node dist/index.js
```

**Extension Side:**
- Background: Chrome → Extensions → Service worker (inspect)
- Content: F12 on the page → Console
- Side Panel: F12 on the side panel → Console

## Questions or Issues?

- Check existing issues on GitHub
- Create a new issue if needed
- Ask in discussions for general questions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## Thank You!

Your contributions help make Browser Agent MCP better for everyone. We appreciate your effort and time! 🎉

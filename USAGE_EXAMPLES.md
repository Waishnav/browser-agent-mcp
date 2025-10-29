# Usage Examples - Browser Agent MCP

This guide provides practical examples of using the Browser Agent MCP to automate browser tasks.

## Basic Navigation

### Navigate to a URL

```
Navigate to https://github.com
```

The agent will:
1. Open the URL in the connected tab
2. Return a snapshot of the page

### Go Back/Forward

```
Go back to the previous page
```

```
Go forward to the next page
```

## Element Interaction

### Click Elements

```
Click the "Sign in" button
```

The agent will:
1. Find the Sign in button
2. Show a visual cursor moving to it
3. Click the button
4. Return a snapshot of the resulting page

### Type Text

```
Type "browser automation" into the search box
```

```
Type "hello@example.com" into the email field and submit
```

### Hover Over Elements

```
Hover over the user menu
```

### Select Options

```
Select "United States" from the country dropdown
```

## Tab Management

### Create New Tabs

```
Open a new tab and navigate to https://news.ycombinator.com
```

The agent will:
1. Create a new tab
2. Navigate to the URL
3. Return the new tab ID

### List All Tabs

```
List all open tabs
```

Returns:
```
Open tabs:
- Tab 123: GitHub - [AGENT CONNECTED] [ACTIVE]
- Tab 124: Hacker News
- Tab 125: Google
```

### Switch Between Tabs

```
Switch to tab 124
```

### Close Tabs

```
Close tab 125
```

## Visual Features

### Show Element Labels

```
Show element labels on the page
```

This will display Vimium-style labels (a, b, c, etc.) on all clickable elements, making it easier for the agent to reference them.

### Take Screenshots

```
Take a screenshot of the current page
```

```
Take a full-page screenshot
```

The agent will return a PNG image of the page.

## Advanced Examples

### Multi-Step Workflow

```
1. Navigate to github.com
2. Click the search button
3. Type "browser automation" and press Enter
4. Click the first repository result
5. Take a screenshot
```

The agent will:
- Execute each step in sequence
- Show visual feedback for each action
- Return the final state

### Form Filling

```
Fill out the contact form:
- Type "John Doe" in the name field
- Type "john@example.com" in the email field
- Type "Hello, I'm interested in your product" in the message field
- Click the submit button
```

### Web Scraping

```
Navigate to a product page, then extract:
- Product title
- Price
- Availability
- Customer rating
```

### Testing Workflows

```
Test the login flow:
1. Navigate to the login page
2. Type "testuser@example.com" in the email field
3. Type "password123" in the password field
4. Click the login button
5. Verify that the dashboard is displayed
6. Take a screenshot
```

## Working with Multiple Tabs

### Research Workflow

```
I need to research the top 5 JavaScript frameworks:
1. Create a new tab for React
2. Create a new tab for Vue
3. Create a new tab for Angular
4. Create a new tab for Svelte
5. Create a new tab for Next.js
6. For each tab, navigate to the official website and take a screenshot
```

### Comparison Shopping

```
Compare prices for "wireless headphones" on:
1. Amazon (tab 1)
2. Best Buy (tab 2)
3. Walmart (tab 3)

For each site:
- Search for the product
- Click the first result
- Extract the price
- Take a screenshot
```

## Visual Overlay Features

The agent provides visual feedback for all actions:

### Agent Status Bar
- Shows at the top of the page when a tab is connected
- Displays current action being performed
- Can be closed by clicking the × button

### Agent Cursor
- Appears when the agent is interacting with elements
- Moves to show where the agent will click/hover
- Pulses to indicate action

### Element Labels
- Vimium-style letter labels on actionable elements
- Shows when requested via the `browser_label_elements` tool
- Makes it easier to reference specific elements

## Console Logs

### Get Console Messages

```
Get all console messages from the page
```

This is useful for debugging or monitoring JavaScript errors.

## Best Practices

### 1. Use Snapshots Between Actions

Taking snapshots helps the agent understand the current state:
```
Take a snapshot of the page
```

### 2. Be Specific with Element Descriptions

Instead of:
```
Click the button
```

Use:
```
Click the "Submit" button in the login form
```

### 3. Wait for Dynamic Content

If content loads dynamically:
```
Wait for 2 seconds
```

### 4. Label Elements for Complex Pages

On pages with many interactive elements:
```
Show element labels
```

Then reference elements by their labels.

### 5. Use Multiple Tabs for Parallel Tasks

```
Open 3 tabs and navigate each to a different news site, then compare headlines
```

## Error Handling

If an element isn't found:
```
The agent will report: "Element not found: Submit button"
```

Try:
1. Taking a snapshot to see the current state
2. Showing element labels
3. Using a more specific description

## Performance Tips

1. **Minimize full-page screenshots** - They take longer to capture
2. **Use element screenshots** when you only need a specific part
3. **Batch related actions** instead of taking snapshots after each small step
4. **Close unused tabs** to reduce memory usage

## Integration with AI Assistants

### Claude Desktop

```
You: "Research the top 3 news stories on Hacker News and summarize them"

Claude will:
1. Navigate to news.ycombinator.com
2. Click on the first 3 story links (opening in new tabs)
3. Read and summarize each article
4. Close the tabs when done
```

### VS Code / Cursor

Use the agent to automate testing or data collection while coding:

```
You: "Test the login flow on localhost:3000 and let me know if there are any errors"
```

## Next Steps

- Explore the [API Documentation](API.md) for all available tools
- Learn about [Installation](INSTALLATION.md) for setup details
- Check the [README](README.md) for project overview

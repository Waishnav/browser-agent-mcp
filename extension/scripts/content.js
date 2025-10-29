// Content script for Browser Agent MCP
// Handles DOM manipulation, agent overlay, and element interaction

let agentActive = false;
let agentOverlay = null;
let agentCursor = null;
let elementLabels = new Map(); // element -> label info
let labelCounter = 0;

// Initialize content script
console.log('Browser Agent MCP content script loaded');

// Notify background script that we're ready
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'AGENT_CONNECTED':
      activateAgent();
      sendResponse({ success: true });
      break;
      
    case 'AGENT_DISCONNECTED':
    case 'MCP_DISCONNECTED':
      deactivateAgent();
      sendResponse({ success: true });
      break;
      
    case 'MCP_COMMAND':
      handleMCPCommand(message.command, message.payload)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true; // Keep channel open for async response
      
    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Activate agent overlay
function activateAgent() {
  if (agentActive) return;
  
  agentActive = true;
  createAgentOverlay();
  createAgentCursor();
  updateAgentStatus('Agent Active');
  
  console.log('Agent activated');
}

// Deactivate agent overlay
function deactivateAgent() {
  if (!agentActive) return;
  
  agentActive = false;
  removeAgentOverlay();
  removeAgentCursor();
  clearElementLabels();
  
  console.log('Agent deactivated');
}

// Create agent overlay showing status
function createAgentOverlay() {
  if (agentOverlay) return;
  
  agentOverlay = document.createElement('div');
  agentOverlay.id = 'browser-agent-overlay';
  agentOverlay.innerHTML = `
    <div class="agent-status-bar">
      <span class="agent-icon">🤖</span>
      <span class="agent-status-text">Agent Active</span>
      <button class="agent-close-btn" title="Disconnect Agent">×</button>
    </div>
    <div class="agent-action-display"></div>
  `;
  
  document.body.appendChild(agentOverlay);
  
  // Add click handler for close button
  agentOverlay.querySelector('.agent-close-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'DISCONNECT_TAB' });
  });
}

// Remove agent overlay
function removeAgentOverlay() {
  if (agentOverlay) {
    agentOverlay.remove();
    agentOverlay = null;
  }
}

// Create visual cursor for agent actions
function createAgentCursor() {
  if (agentCursor) return;
  
  agentCursor = document.createElement('div');
  agentCursor.id = 'browser-agent-cursor';
  agentCursor.innerHTML = '🎯';
  agentCursor.style.display = 'none';
  
  document.body.appendChild(agentCursor);
}

// Remove agent cursor
function removeAgentCursor() {
  if (agentCursor) {
    agentCursor.remove();
    agentCursor = null;
  }
}

// Update agent status text
function updateAgentStatus(text) {
  if (!agentOverlay) return;
  
  const statusText = agentOverlay.querySelector('.agent-status-text');
  if (statusText) {
    statusText.textContent = text;
  }
}

// Show agent action
function showAgentAction(action) {
  if (!agentOverlay) return;
  
  const actionDisplay = agentOverlay.querySelector('.agent-action-display');
  if (actionDisplay) {
    actionDisplay.textContent = action;
    actionDisplay.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      actionDisplay.style.display = 'none';
    }, 3000);
  }
}

// Move cursor to element
function moveCursorToElement(element) {
  if (!agentCursor || !element) return;
  
  const rect = element.getBoundingClientRect();
  agentCursor.style.left = `${rect.left + rect.width / 2}px`;
  agentCursor.style.top = `${rect.top + rect.height / 2}px`;
  agentCursor.style.display = 'block';
  
  // Pulse animation
  agentCursor.classList.add('pulsing');
  setTimeout(() => {
    agentCursor.classList.remove('pulsing');
  }, 1000);
}

// Hide cursor
function hideCursor() {
  if (agentCursor) {
    agentCursor.style.display = 'none';
  }
}

// Handle MCP commands
async function handleMCPCommand(command, payload) {
  console.log('Handling MCP command:', command, payload);
  
  switch (command) {
    case 'browser_navigate':
      window.location.href = payload.url;
      return { success: true };
      
    case 'browser_go_back':
      window.history.back();
      return { success: true };
      
    case 'browser_go_forward':
      window.history.forward();
      return { success: true };
      
    case 'browser_snapshot':
      return await captureSnapshot();
      
    case 'browser_click':
      return await performClick(payload);
      
    case 'browser_hover':
      return await performHover(payload);
      
    case 'browser_type':
      return await performType(payload);
      
    case 'browser_select_option':
      return await performSelectOption(payload);
      
    case 'browser_drag':
      return await performDrag(payload);
      
    case 'browser_wait':
      await new Promise(resolve => setTimeout(resolve, payload.time * 1000));
      return { success: true };
      
    case 'browser_press_key':
      return await performPressKey(payload);
      
    case 'getUrl':
      return window.location.href;
      
    case 'getTitle':
      return document.title;
      
    case 'browser_get_console_logs':
      return getConsoleLogs();
      
    case 'browser_screenshot':
      return await captureScreenshot();
    
    case 'browser_create_tab':
      return await chrome.runtime.sendMessage({ type: 'CREATE_TAB', url: payload.url });
      
    case 'browser_close_tab':
      return await chrome.runtime.sendMessage({ type: 'CLOSE_TAB', tabId: payload.tabId });
      
    case 'browser_switch_tab':
      return await chrome.runtime.sendMessage({ type: 'SWITCH_TAB', tabId: payload.tabId });
      
    case 'browser_list_tabs':
      return await chrome.runtime.sendMessage({ type: 'LIST_TABS' });
      
    case 'browser_label_elements':
      if (payload.show) {
        labelActionableElements();
      } else {
        clearElementLabels();
      }
      return { success: true };
      
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Find element by ref (selector)
function findElementByRef(ref) {
  try {
    // Try as CSS selector first
    const element = document.querySelector(ref);
    if (element) return element;
    
    // Try as XPath
    const xpathResult = document.evaluate(
      ref,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return xpathResult.singleNodeValue;
  } catch (error) {
    console.error('Error finding element:', error);
    return null;
  }
}

// Perform click action
async function performClick(payload) {
  showAgentAction(`Clicking: ${payload.element}`);
  
  const element = findElementByRef(payload.ref);
  if (!element) {
    throw new Error(`Element not found: ${payload.element}`);
  }
  
  moveCursorToElement(element);
  await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause for visual feedback
  
  const clickEvent = new MouseEvent(payload.doubleClick ? 'dblclick' : 'click', {
    bubbles: true,
    cancelable: true,
    view: window,
    button: payload.button === 'right' ? 2 : payload.button === 'middle' ? 1 : 0
  });
  
  element.dispatchEvent(clickEvent);
  element.click(); // Also trigger native click
  
  setTimeout(() => hideCursor(), 500);
  
  return { success: true };
}

// Perform hover action
async function performHover(payload) {
  showAgentAction(`Hovering: ${payload.element}`);
  
  const element = findElementByRef(payload.ref);
  if (!element) {
    throw new Error(`Element not found: ${payload.element}`);
  }
  
  moveCursorToElement(element);
  
  const hoverEvent = new MouseEvent('mouseover', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  element.dispatchEvent(hoverEvent);
  
  return { success: true };
}

// Perform type action
async function performType(payload) {
  showAgentAction(`Typing into: ${payload.element}`);
  
  const element = findElementByRef(payload.ref);
  if (!element) {
    throw new Error(`Element not found: ${payload.element}`);
  }
  
  moveCursorToElement(element);
  
  // Focus the element
  element.focus();
  
  if (payload.slowly) {
    // Type character by character
    for (const char of payload.text) {
      element.value = (element.value || '') + char;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } else {
    element.value = payload.text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  if (payload.submit) {
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true
    });
    element.dispatchEvent(enterEvent);
  }
  
  setTimeout(() => hideCursor(), 500);
  
  return { success: true };
}

// Perform select option action
async function performSelectOption(payload) {
  showAgentAction(`Selecting option in: ${payload.element}`);
  
  const element = findElementByRef(payload.ref);
  if (!element || element.tagName !== 'SELECT') {
    throw new Error(`Select element not found: ${payload.element}`);
  }
  
  moveCursorToElement(element);
  
  for (const value of payload.values) {
    const option = Array.from(element.options).find(
      opt => opt.value === value || opt.text === value
    );
    if (option) {
      option.selected = true;
    }
  }
  
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  setTimeout(() => hideCursor(), 500);
  
  return { success: true };
}

// Perform drag action
async function performDrag(payload) {
  showAgentAction(`Dragging: ${payload.startElement} to ${payload.endElement}`);
  
  const startElement = findElementByRef(payload.startRef);
  const endElement = findElementByRef(payload.endRef);
  
  if (!startElement || !endElement) {
    throw new Error('Drag elements not found');
  }
  
  // Visual feedback
  moveCursorToElement(startElement);
  await new Promise(resolve => setTimeout(resolve, 300));
  moveCursorToElement(endElement);
  
  // Simulate drag and drop
  const dragStartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true });
  startElement.dispatchEvent(dragStartEvent);
  
  const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true });
  endElement.dispatchEvent(dropEvent);
  
  const dragEndEvent = new DragEvent('dragend', { bubbles: true, cancelable: true });
  startElement.dispatchEvent(dragEndEvent);
  
  setTimeout(() => hideCursor(), 500);
  
  return { success: true };
}

// Perform press key action
async function performPressKey(payload) {
  showAgentAction(`Pressing key: ${payload.key}`);
  
  const keyEvent = new KeyboardEvent('keydown', {
    key: payload.key,
    code: payload.key,
    bubbles: true
  });
  
  document.activeElement.dispatchEvent(keyEvent);
  
  return { success: true };
}

// Capture ARIA snapshot
async function captureSnapshot() {
  // Generate accessibility tree snapshot
  const snapshot = generateAriaSnapshot(document.body);
  return snapshot;
}

// Generate ARIA snapshot (simplified)
function generateAriaSnapshot(element, depth = 0) {
  if (depth > 10) return ''; // Limit depth
  
  const indent = '  '.repeat(depth);
  let snapshot = '';
  
  const role = element.getAttribute('role') || getImplicitRole(element);
  const name = element.getAttribute('aria-label') || element.textContent?.trim().substring(0, 50);
  
  if (role && (element.offsetWidth > 0 || element.offsetHeight > 0)) {
    snapshot += `${indent}- ${role}${name ? `: "${name}"` : ''}\n`;
    
    // Add children
    for (const child of element.children) {
      snapshot += generateAriaSnapshot(child, depth + 1);
    }
  }
  
  return snapshot;
}

// Get implicit ARIA role
function getImplicitRole(element) {
  const tag = element.tagName.toLowerCase();
  const roleMap = {
    'button': 'button',
    'a': 'link',
    'input': element.type === 'text' ? 'textbox' : element.type,
    'textarea': 'textbox',
    'select': 'combobox',
    'h1': 'heading',
    'h2': 'heading',
    'h3': 'heading',
    'h4': 'heading',
    'h5': 'heading',
    'h6': 'heading',
    'img': 'image',
    'nav': 'navigation',
    'main': 'main',
    'header': 'banner',
    'footer': 'contentinfo',
  };
  return roleMap[tag] || '';
}

// Get console logs (stubbed - would need to intercept console)
function getConsoleLogs() {
  // In a real implementation, we'd intercept console methods
  return [];
}

// Capture screenshot
async function captureScreenshot() {
  // Use html2canvas or similar library, or request from background
  // For now, return a placeholder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

// Label actionable elements with Vimium-style hints
function labelActionableElements() {
  clearElementLabels();
  labelCounter = 0;
  
  const actionableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [role="button"], [role="link"], [onclick]'
  );
  
  actionableElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    
    // Only label visible elements
    if (rect.width > 0 && rect.height > 0 && isElementVisible(element)) {
      const label = generateLabel(labelCounter++);
      createElementLabel(element, label);
      elementLabels.set(element, label);
    }
  });
}

// Generate label (like Vimium: a, b, c, ... z, aa, ab, ...)
function generateLabel(index) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let label = '';
  let num = index;
  
  do {
    label = chars[num % 26] + label;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  
  return label;
}

// Create visual label for element
function createElementLabel(element, label) {
  const labelElement = document.createElement('div');
  labelElement.className = 'agent-element-label';
  labelElement.textContent = label;
  labelElement.setAttribute('data-agent-label', label);
  
  const rect = element.getBoundingClientRect();
  labelElement.style.left = `${rect.left + window.scrollX}px`;
  labelElement.style.top = `${rect.top + window.scrollY}px`;
  
  document.body.appendChild(labelElement);
}

// Clear element labels
function clearElementLabels() {
  document.querySelectorAll('.agent-element-label').forEach(el => el.remove());
  elementLabels.clear();
}

// Check if element is visible
function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

// Content script for Browser Agent MCP
// Handles visual overlays and executes browser automation actions

class BrowserAgentClient {
  constructor() {
    this.overlayElements = {};
    this.isActive = false;
    this.currentAction = '';
    this.vimiumBindings = new Map(); // keybinding -> element mapping
    this.init();
  }

  init() {
    this.createOverlay();
    this.setupMessageListener();
    this.notifyReady();
  }

  createOverlay() {
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'browser-agent-overlay';
    
    // Create indicator bar
    const indicator = document.createElement('div');
    indicator.id = 'browser-agent-indicator';
    indicator.className = 'browser-agent-overlay-hidden';
    
    // Create status badge
    const status = document.createElement('div');
    status.id = 'browser-agent-status';
    status.className = 'browser-agent-overlay-hidden';
    status.textContent = 'Agent Active';
    
    // Create custom cursor
    const cursor = document.createElement('div');
    cursor.id = 'browser-agent-cursor';
    cursor.className = 'browser-agent-overlay-hidden';
    cursor.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L10.5 20.5L13.5 13.5L20.5 10.5L3 3Z" fill="#007bff" stroke="white" stroke-width="2"/>
      </svg>
    `;
    
    // Create action display
    const action = document.createElement('div');
    action.id = 'browser-agent-action';
    action.className = 'browser-agent-overlay-hidden';
    
    overlay.appendChild(cursor);
    document.body.appendChild(overlay);
    document.body.appendChild(indicator);
    document.body.appendChild(status);
    document.body.appendChild(action);
    
    this.overlayElements = { overlay, indicator, status, cursor, action };
    
    // Track mouse movement for cursor
    document.addEventListener('mousemove', (e) => {
      if (this.isActive) {
        cursor.style.left = e.pageX + 'px';
        cursor.style.top = e.pageY + 'px';
      }
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message)
        .then(sendResponse)
        .catch(error => {
          console.error('Error handling message:', error);
          sendResponse({ error: error.message });
        });
      return true; // Will respond asynchronously
    });
  }

  notifyReady() {
    chrome.runtime.sendMessage({ type: 'CONTENT_READY' });
  }

  async handleMessage(message) {
    switch (message.type) {
      case 'INIT':
        return this.activate(message.config);
      
      case 'DISCONNECT':
        return this.deactivate();
      
      case 'EXECUTE_ACTION':
        return await this.executeAction(message.action, message.payload);
      
      case 'SHOW_KEYBINDINGS':
        return this.showVimiumKeybindings();
      
      case 'HIDE_KEYBINDINGS':
        return this.hideVimiumKeybindings();
      
      default:
        return { error: 'Unknown message type' };
    }
  }

  activate(config) {
    this.isActive = true;
    if (config.showOverlay) {
      this.showOverlay();
    }
    return { success: true };
  }

  deactivate() {
    this.isActive = false;
    this.hideOverlay();
    this.clearHighlights();
    return { success: true };
  }

  showOverlay() {
    this.overlayElements.indicator.classList.remove('browser-agent-overlay-hidden');
    this.overlayElements.status.classList.remove('browser-agent-overlay-hidden');
    this.overlayElements.cursor.classList.remove('browser-agent-overlay-hidden');
  }

  hideOverlay() {
    this.overlayElements.indicator.classList.add('browser-agent-overlay-hidden');
    this.overlayElements.status.classList.add('browser-agent-overlay-hidden');
    this.overlayElements.cursor.classList.add('browser-agent-overlay-hidden');
    this.overlayElements.action.classList.add('browser-agent-overlay-hidden');
  }

  showAction(actionText) {
    this.currentAction = actionText;
    this.overlayElements.action.textContent = actionText;
    this.overlayElements.action.classList.remove('browser-agent-overlay-hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.overlayElements.action.classList.add('browser-agent-overlay-hidden');
    }, 3000);
  }

  async executeAction(action, payload) {
    this.showAction(`Executing: ${action}`);
    
    try {
      let result;
      
      switch (action) {
        case 'browser_navigate':
          result = await this.navigate(payload.url);
          break;
        
        case 'browser_go_back':
          result = await this.goBack();
          break;
        
        case 'browser_go_forward':
          result = await this.goForward();
          break;
        
        case 'browser_click':
          result = await this.click(payload);
          break;
        
        case 'browser_hover':
          result = await this.hover(payload);
          break;
        
        case 'browser_type':
          result = await this.type(payload);
          break;
        
        case 'browser_select_option':
          result = await this.selectOption(payload);
          break;
        
        case 'browser_press_key':
          result = await this.pressKey(payload);
          break;
        
        case 'browser_wait':
          result = await this.wait(payload);
          break;
        
        case 'browser_snapshot':
          result = await this.getSnapshot();
          break;
        
        case 'browser_screenshot':
          result = await this.takeScreenshot();
          break;
        
        case 'browser_get_console_logs':
          result = await this.getConsoleLogs();
          break;
        
        case 'getUrl':
          result = window.location.href;
          break;
        
        case 'getTitle':
          result = document.title;
          break;
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async navigate(url) {
    window.location.href = url;
    return { navigated: true };
  }

  async goBack() {
    window.history.back();
    return { navigated: true };
  }

  async goForward() {
    window.history.forward();
    return { navigated: true };
  }

  async click(payload) {
    const element = this.findElement(payload.ref);
    if (!element) {
      throw new Error(`Element not found: ${payload.ref}`);
    }
    
    this.highlightElement(element);
    element.click();
    
    return { clicked: true };
  }

  async hover(payload) {
    const element = this.findElement(payload.ref);
    if (!element) {
      throw new Error(`Element not found: ${payload.ref}`);
    }
    
    this.highlightElement(element);
    
    const event = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
    
    return { hovered: true };
  }

  async type(payload) {
    const element = this.findElement(payload.ref);
    if (!element) {
      throw new Error(`Element not found: ${payload.ref}`);
    }
    
    this.highlightElement(element);
    element.focus();
    
    // Set value
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = payload.text;
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      element.textContent = payload.text;
    }
    
    return { typed: true };
  }

  async selectOption(payload) {
    const element = this.findElement(payload.ref);
    if (!element || element.tagName !== 'SELECT') {
      throw new Error(`Select element not found: ${payload.ref}`);
    }
    
    this.highlightElement(element);
    
    for (const value of payload.values) {
      const option = Array.from(element.options).find(
        opt => opt.value === value || opt.text === value
      );
      if (option) {
        option.selected = true;
      }
    }
    
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    return { selected: true };
  }

  async pressKey(payload) {
    const event = new KeyboardEvent('keydown', {
      key: payload.key,
      bubbles: true,
      cancelable: true
    });
    document.activeElement.dispatchEvent(event);
    
    return { pressed: true };
  }

  async wait(payload) {
    await new Promise(resolve => setTimeout(resolve, payload.time * 1000));
    return { waited: true };
  }

  async getSnapshot() {
    // Generate accessibility snapshot (ARIA tree)
    return this.generateAriaSnapshot(document.body);
  }

  generateAriaSnapshot(element, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return '';
    
    let snapshot = '';
    const indent = '  '.repeat(depth);
    
    // Get element info
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    const label = this.getAccessibleName(element);
    const ref = this.generateRef(element);
    
    if (role && this.isInteractive(element)) {
      snapshot += `${indent}- ${role}`;
      if (label) snapshot += ` "${label}"`;
      if (ref) snapshot += ` [${ref}]`;
      snapshot += '\n';
    }
    
    // Process children
    for (const child of element.children) {
      snapshot += this.generateAriaSnapshot(child, depth + 1, maxDepth);
    }
    
    return snapshot;
  }

  getImplicitRole(element) {
    const tagRoles = {
      'A': 'link',
      'BUTTON': 'button',
      'INPUT': 'textbox',
      'TEXTAREA': 'textbox',
      'SELECT': 'combobox',
      'IMG': 'img',
      'NAV': 'navigation',
      'HEADER': 'banner',
      'FOOTER': 'contentinfo',
      'MAIN': 'main',
      'ASIDE': 'complementary'
    };
    return tagRoles[element.tagName];
  }

  getAccessibleName(element) {
    return element.getAttribute('aria-label') ||
           element.getAttribute('title') ||
           element.textContent?.trim().substring(0, 50) ||
           element.getAttribute('placeholder') ||
           '';
  }

  isInteractive(element) {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return interactiveTags.includes(element.tagName) ||
           element.getAttribute('role') === 'button' ||
           element.hasAttribute('onclick');
  }

  generateRef(element) {
    // Generate a unique reference for the element
    if (element.id) return `#${element.id}`;
    
    // Create a stable reference based on position
    let ref = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(e => e.tagName === element.tagName);
      const index = siblings.indexOf(element);
      if (siblings.length > 1) {
        ref += `[${index}]`;
      }
    }
    
    return ref;
  }

  async takeScreenshot() {
    // Request screenshot from background script
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, response => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.screenshot);
        }
      });
    });
  }

  async getConsoleLogs() {
    // This would need to be captured earlier
    // For now return empty array
    return [];
  }

  findElement(ref) {
    // Try to find element by reference
    if (ref.startsWith('#')) {
      return document.getElementById(ref.substring(1));
    }
    
    // Try CSS selector
    try {
      return document.querySelector(ref);
    } catch (e) {
      return null;
    }
  }

  highlightElement(element) {
    this.clearHighlights();
    element.classList.add('browser-agent-highlight');
    element.setAttribute('data-agent-ref', this.generateRef(element));
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      element.classList.remove('browser-agent-highlight');
      element.removeAttribute('data-agent-ref');
    }, 2000);
  }

  clearHighlights() {
    document.querySelectorAll('.browser-agent-highlight').forEach(el => {
      el.classList.remove('browser-agent-highlight');
      el.removeAttribute('data-agent-ref');
    });
  }

  showVimiumKeybindings() {
    this.clearVimiumKeybindings();
    
    // Get all interactive elements
    const elements = this.getInteractiveElements();
    const keybindings = this.generateKeybindings(elements.length);
    
    elements.forEach((element, index) => {
      const key = keybindings[index];
      this.vimiumBindings.set(key, element);
      
      const rect = element.getBoundingClientRect();
      const badge = document.createElement('div');
      badge.className = 'browser-agent-keybinding';
      badge.textContent = key;
      badge.style.left = (rect.left + window.scrollX) + 'px';
      badge.style.top = (rect.top + window.scrollY) + 'px';
      badge.setAttribute('data-keybinding', key);
      
      document.body.appendChild(badge);
    });
    
    return { bindings: Array.from(this.vimiumBindings.keys()) };
  }

  hideVimiumKeybindings() {
    this.clearVimiumKeybindings();
    return { success: true };
  }

  clearVimiumKeybindings() {
    document.querySelectorAll('.browser-agent-keybinding').forEach(el => el.remove());
    this.vimiumBindings.clear();
  }

  getInteractiveElements() {
    const selector = 'a, button, input, select, textarea, [role="button"], [onclick]';
    return Array.from(document.querySelectorAll(selector))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0; // Visible elements only
      });
  }

  generateKeybindings(count) {
    const keys = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    
    // Single character bindings
    for (let i = 0; i < Math.min(count, 26); i++) {
      keys.push(chars[i]);
    }
    
    // Two character bindings
    if (count > 26) {
      for (let i = 0; i < chars.length && keys.length < count; i++) {
        for (let j = 0; j < chars.length && keys.length < count; j++) {
          keys.push(chars[i] + chars[j]);
        }
      }
    }
    
    return keys;
  }
}

// Initialize the agent
const browserAgent = new BrowserAgentClient();

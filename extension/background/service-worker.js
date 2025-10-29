// Background service worker for Browser Agent MCP

let wsConnection = null;
let controlledTabs = new Map(); // tabId -> { connection info, state }
let messageHandlers = new Map(); // messageId -> { resolve, reject, timeout }

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Browser Agent MCP extension installed');
});

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch((error) => {
    console.error('Error handling message:', error);
    sendResponse({ error: error.message });
  });
  return true; // Will respond asynchronously
});

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'CONNECT_TO_SERVER':
      return await connectToServer(message.serverUrl);
    
    case 'DISCONNECT_FROM_SERVER':
      return disconnectFromServer();
    
    case 'SPAWN_TAB':
      return await spawnTab();
    
    case 'CONNECT_TAB':
      return await connectTab(sender.tab.id);
    
    case 'DISCONNECT_TAB':
      return await disconnectTab(message.tabId);
    
    case 'TAB_ACTION_RESULT':
      return handleTabActionResult(message);
    
    case 'SERVER_MESSAGE':
      return await forwardToServer(message.message);
    
    case 'CONTENT_READY':
      return handleContentReady(sender.tab.id);
    
    default:
      console.warn('Unknown message type:', message.type);
      return { error: 'Unknown message type' };
  }
}

async function connectToServer(serverUrl) {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    return { success: true, message: 'Already connected' };
  }

  return new Promise((resolve, reject) => {
    try {
      wsConnection = new WebSocket(serverUrl);

      wsConnection.onopen = () => {
        console.log('Connected to MCP server');
        notifySidePanel({ type: 'CONNECTION_STATUS', connected: true });
        resolve({ success: true });
      };

      wsConnection.onclose = () => {
        console.log('Disconnected from MCP server');
        wsConnection = null;
        notifySidePanel({ type: 'CONNECTION_STATUS', connected: false });
      };

      wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('Failed to connect to server'));
      };

      wsConnection.onmessage = (event) => {
        handleServerMessage(event.data);
      };

    } catch (error) {
      reject(error);
    }
  });
}

function disconnectFromServer() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  return { success: true };
}

async function spawnTab() {
  const tab = await chrome.tabs.create({ url: 'about:blank' });
  await connectTab(tab.id);
  return { success: true, tabId: tab.id };
}

async function connectTab(tabId) {
  if (!controlledTabs.has(tabId)) {
    controlledTabs.set(tabId, {
      id: tabId,
      connected: true,
      activeOverlay: false
    });
    
    // Inject content script if not already injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/content-script.js']
      });
      
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content/overlay.css']
      });
    } catch (error) {
      console.log('Content script already injected or error:', error);
    }
    
    notifySidePanel({ type: 'TAB_CONNECTED', tabId });
  }
  return { success: true };
}

async function disconnectTab(tabId) {
  if (controlledTabs.has(tabId)) {
    // Send message to content script to clean up
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'DISCONNECT' });
    } catch (error) {
      console.log('Error disconnecting tab:', error);
    }
    
    controlledTabs.delete(tabId);
    notifySidePanel({ type: 'TAB_DISCONNECTED', tabId });
  }
  return { success: true };
}

async function handleContentReady(tabId) {
  if (controlledTabs.has(tabId)) {
    // Content script is ready, send initialization
    await chrome.tabs.sendMessage(tabId, { 
      type: 'INIT',
      config: { showOverlay: true }
    });
  }
  return { success: true };
}

async function handleServerMessage(data) {
  try {
    const message = JSON.parse(data);
    console.log('Received from server:', message);

    // Check if this is a response to a previous message
    if (message.id && messageHandlers.has(message.id)) {
      const handler = messageHandlers.get(message.id);
      clearTimeout(handler.timeout);
      messageHandlers.delete(message.id);
      
      if (message.error) {
        handler.reject(new Error(message.error));
      } else {
        handler.resolve(message.response);
      }
      return;
    }

    // Handle new commands from server
    if (message.type) {
      const result = await executeServerCommand(message);
      
      // Send response back to server
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          id: message.id,
          response: result
        }));
      }
    }
  } catch (error) {
    console.error('Error handling server message:', error);
  }
}

async function executeServerCommand(message) {
  const { type, payload } = message;
  
  // Get the active controlled tab (or first controlled tab)
  const activeTab = await getActiveControlledTab();
  
  if (!activeTab) {
    throw new Error('No controlled tab available');
  }

  // Forward command to content script
  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'EXECUTE_ACTION',
      action: type,
      payload: payload
    });
    
    // Log activity
    notifySidePanel({
      type: 'ACTION_PERFORMED',
      action: type,
      details: JSON.stringify(payload)
    });
    
    return response;
  } catch (error) {
    throw new Error(`Failed to execute command: ${error.message}`);
  }
}

async function getActiveControlledTab() {
  // Try to get the currently active tab if it's controlled
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab && controlledTabs.has(activeTab.id)) {
    return controlledTabs.get(activeTab.id);
  }
  
  // Otherwise return the first controlled tab
  const firstTab = controlledTabs.values().next().value;
  return firstTab || null;
}

async function forwardToServer(message) {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    throw new Error('Not connected to server');
  }

  const messageId = Math.random().toString(36).substring(7);
  const fullMessage = {
    id: messageId,
    ...message
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      messageHandlers.delete(messageId);
      reject(new Error('Server response timeout'));
    }, 30000);

    messageHandlers.set(messageId, { resolve, reject, timeout });
    wsConnection.send(JSON.stringify(fullMessage));
  });
}

function handleTabActionResult(message) {
  // Forward result to server if needed
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(message));
  }
  return { success: true };
}

function notifySidePanel(message) {
  // Send message to side panel if it's open
  chrome.runtime.sendMessage(message).catch(() => {
    // Side panel might not be open, ignore error
  });
}

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (controlledTabs.has(tabId)) {
    disconnectTab(tabId);
  }
});

// Update tab info when URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (controlledTabs.has(tabId) && changeInfo.url) {
    const tabInfo = controlledTabs.get(tabId);
    tabInfo.url = changeInfo.url;
    notifySidePanel({
      type: 'TAB_UPDATED',
      tabId: tabId,
      url: changeInfo.url
    });
  }
});

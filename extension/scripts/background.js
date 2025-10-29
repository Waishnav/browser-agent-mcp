// Background service worker for Browser Agent MCP
// Manages WebSocket connection to MCP server and tab orchestration

let wsConnection = null;
let connectedTabs = new Map(); // tabId -> connection info
const MCP_SERVER_URL = 'ws://localhost:9222';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Browser Agent MCP extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  
  switch (message.type) {
    case 'CONTENT_SCRIPT_READY':
      console.log(`Content script ready in tab ${tabId}`);
      sendResponse({ success: true });
      break;
      
    case 'CONNECT_TAB':
      connectTab(tabId, message.url)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response
      
    case 'DISCONNECT_TAB':
      disconnectTab(tabId);
      sendResponse({ success: true });
      break;
      
    case 'GET_CONNECTION_STATUS':
      sendResponse({ 
        connected: connectedTabs.has(tabId),
        wsConnected: wsConnection?.readyState === WebSocket.OPEN
      });
      break;
      
    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Connect to MCP server
async function connectToMCPServer() {
  if (wsConnection?.readyState === WebSocket.OPEN) {
    return wsConnection;
  }
  
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(MCP_SERVER_URL);
      
      ws.onopen = () => {
        console.log('Connected to MCP server');
        wsConnection = ws;
        resolve(ws);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(new Error('Failed to connect to MCP server'));
      };
      
      ws.onclose = () => {
        console.log('Disconnected from MCP server');
        wsConnection = null;
        // Notify all connected tabs
        connectedTabs.forEach((_, tabId) => {
          notifyTabDisconnected(tabId);
        });
        connectedTabs.clear();
      };
      
      ws.onmessage = async (event) => {
        await handleMCPMessage(JSON.parse(event.data));
      };
      
    } catch (error) {
      reject(error);
    }
  });
}

// Handle messages from MCP server
async function handleMCPMessage(message) {
  const { id, type, payload } = message;
  
  // Find the active connected tab
  const activeTab = await getActiveConnectedTab();
  if (!activeTab) {
    sendMCPResponse(id, null, 'No connected tab');
    return;
  }
  
  try {
    // Forward message to content script
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'MCP_COMMAND',
      command: type,
      payload
    });
    
    sendMCPResponse(id, response);
  } catch (error) {
    sendMCPResponse(id, null, error.message);
  }
}

// Send response back to MCP server
function sendMCPResponse(id, result, error = null) {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    console.error('Cannot send response: not connected to MCP server');
    return;
  }
  
  wsConnection.send(JSON.stringify({
    id,
    result: error ? undefined : result,
    error
  }));
}

// Connect a tab to the agent system
async function connectTab(tabId, url) {
  // Ensure MCP server connection
  await connectToMCPServer();
  
  // Mark tab as connected
  connectedTabs.set(tabId, {
    url,
    connectedAt: Date.now()
  });
  
  // Notify content script
  await chrome.tabs.sendMessage(tabId, {
    type: 'AGENT_CONNECTED'
  });
  
  console.log(`Tab ${tabId} connected`);
}

// Disconnect a tab
function disconnectTab(tabId) {
  connectedTabs.delete(tabId);
  
  // Notify content script
  chrome.tabs.sendMessage(tabId, {
    type: 'AGENT_DISCONNECTED'
  }).catch(() => {
    // Tab might be closed, ignore error
  });
  
  console.log(`Tab ${tabId} disconnected`);
}

// Notify tab that MCP server disconnected
function notifyTabDisconnected(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'MCP_DISCONNECTED'
  }).catch(() => {
    // Tab might be closed, ignore error
  });
}

// Get the currently active connected tab
async function getActiveConnectedTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  
  if (activeTab && connectedTabs.has(activeTab.id)) {
    return activeTab;
  }
  
  // Fallback to any connected tab
  if (connectedTabs.size > 0) {
    const [tabId] = connectedTabs.keys();
    return await chrome.tabs.get(tabId);
  }
  
  return null;
}

// Tab management tools
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CREATE_TAB':
      chrome.tabs.create({ url: message.url }, (tab) => {
        sendResponse({ tabId: tab.id });
      });
      return true;
      
    case 'CLOSE_TAB':
      chrome.tabs.remove(message.tabId, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'SWITCH_TAB':
      chrome.tabs.update(message.tabId, { active: true }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'LIST_TABS':
      chrome.tabs.query({}, (tabs) => {
        sendResponse({ 
          tabs: tabs.map(t => ({
            id: t.id,
            title: t.title,
            url: t.url,
            active: t.active,
            connected: connectedTabs.has(t.id)
          }))
        });
      });
      return true;
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (connectedTabs.has(tabId)) {
    disconnectTab(tabId);
  }
});

// Side panel functionality for Browser Agent MCP

let wsConnection = null;
let connectedTabs = new Map();

// DOM elements
const connectBtn = document.getElementById('connectBtn');
const serverUrlInput = document.getElementById('serverUrl');
const statusIndicator = document.getElementById('connectionStatus');
const statusText = document.getElementById('statusText');
const tabsList = document.getElementById('tabsList');
const spawnTabBtn = document.getElementById('spawnTabBtn');
const activityLog = document.getElementById('activityLog');
const clearLogBtn = document.getElementById('clearLogBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  updateTabsList();
});

function setupEventListeners() {
  connectBtn.addEventListener('click', toggleConnection);
  spawnTabBtn.addEventListener('click', spawnNewTab);
  clearLogBtn.addEventListener('click', clearActivityLog);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TAB_CONNECTED') {
      handleTabConnected(message.tabId);
    } else if (message.type === 'TAB_DISCONNECTED') {
      handleTabDisconnected(message.tabId);
    } else if (message.type === 'ACTION_PERFORMED') {
      logActivity(message.action, message.details);
    }
  });
}

async function toggleConnection() {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    disconnect();
  } else {
    connect();
  }
}

function connect() {
  const serverUrl = serverUrlInput.value.trim();
  
  if (!serverUrl) {
    alert('Please enter a server URL');
    return;
  }

  try {
    logActivity('Connecting', `Attempting to connect to ${serverUrl}`);
    wsConnection = new WebSocket(serverUrl);

    wsConnection.onopen = () => {
      updateConnectionStatus(true);
      logActivity('Connected', `Successfully connected to ${serverUrl}`);
      saveSettings();
    };

    wsConnection.onclose = () => {
      updateConnectionStatus(false);
      logActivity('Disconnected', 'Connection closed');
      wsConnection = null;
    };

    wsConnection.onerror = (error) => {
      logActivity('Error', `Connection error: ${error.message || 'Unknown error'}`);
      updateConnectionStatus(false);
    };

    wsConnection.onmessage = (event) => {
      handleServerMessage(event.data);
    };

  } catch (error) {
    logActivity('Error', `Failed to connect: ${error.message}`);
    updateConnectionStatus(false);
  }
}

function disconnect() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  updateConnectionStatus(false);
}

function updateConnectionStatus(connected) {
  if (connected) {
    statusIndicator.classList.add('connected');
    statusText.textContent = 'Connected';
    connectBtn.textContent = 'Disconnect';
    connectBtn.classList.remove('btn-primary');
    connectBtn.classList.add('btn-secondary');
  } else {
    statusIndicator.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    connectBtn.textContent = 'Connect';
    connectBtn.classList.remove('btn-secondary');
    connectBtn.classList.add('btn-primary');
  }
}

async function spawnNewTab() {
  try {
    const tab = await chrome.tabs.create({ url: 'about:blank' });
    logActivity('Tab Spawned', `Created new tab: ${tab.id}`);
    
    // Notify background script about the new tab
    chrome.runtime.sendMessage({
      type: 'SPAWN_TAB',
      tabId: tab.id
    });
  } catch (error) {
    logActivity('Error', `Failed to spawn tab: ${error.message}`);
  }
}

function handleTabConnected(tabId) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Error getting tab:', chrome.runtime.lastError);
      return;
    }
    
    connectedTabs.set(tabId, {
      id: tabId,
      title: tab.title,
      url: tab.url
    });
    
    updateTabsList();
    logActivity('Tab Connected', `Tab ${tabId}: ${tab.title || 'Untitled'}`);
  });
}

function handleTabDisconnected(tabId) {
  connectedTabs.delete(tabId);
  updateTabsList();
  logActivity('Tab Disconnected', `Tab ${tabId}`);
}

function updateTabsList() {
  if (connectedTabs.size === 0) {
    tabsList.innerHTML = '<p class="empty-state">No tabs connected</p>';
    return;
  }

  tabsList.innerHTML = '';
  connectedTabs.forEach((tab, tabId) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.innerHTML = `
      <div class="tab-info">
        <div class="tab-title">${escapeHtml(tab.title || 'Untitled')}</div>
        <div class="tab-url">${escapeHtml(tab.url || '')}</div>
      </div>
      <div class="tab-actions">
        <button class="btn btn-primary" data-tab-id="${tabId}">Focus</button>
        <button class="btn btn-secondary" data-tab-id="${tabId}">Disconnect</button>
      </div>
    `;
    
    // Add event listeners
    const focusBtn = tabItem.querySelector('.btn-primary');
    const disconnectBtn = tabItem.querySelector('.btn-secondary');
    
    focusBtn.addEventListener('click', () => focusTab(tabId));
    disconnectBtn.addEventListener('click', () => disconnectTab(tabId));
    
    tabsList.appendChild(tabItem);
  });
}

async function focusTab(tabId) {
  try {
    await chrome.tabs.update(tabId, { active: true });
    const tab = await chrome.tabs.get(tabId);
    await chrome.windows.update(tab.windowId, { focused: true });
    logActivity('Tab Focused', `Switched to tab ${tabId}`);
  } catch (error) {
    logActivity('Error', `Failed to focus tab: ${error.message}`);
  }
}

function disconnectTab(tabId) {
  chrome.runtime.sendMessage({
    type: 'DISCONNECT_TAB',
    tabId: tabId
  });
  connectedTabs.delete(tabId);
  updateTabsList();
}

function handleServerMessage(data) {
  try {
    const message = JSON.parse(data);
    logActivity('Server Message', JSON.stringify(message));
    
    // Forward to background script
    chrome.runtime.sendMessage({
      type: 'SERVER_MESSAGE',
      message: message
    });
  } catch (error) {
    console.error('Error parsing server message:', error);
  }
}

function logActivity(action, details) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.innerHTML = `
    <span class="log-timestamp">[${timestamp}]</span>
    <span class="log-action">${escapeHtml(action)}:</span>
    <span class="log-details">${escapeHtml(details)}</span>
  `;
  
  if (activityLog.querySelector('.empty-state')) {
    activityLog.innerHTML = '';
  }
  
  activityLog.appendChild(logEntry);
  activityLog.scrollTop = activityLog.scrollHeight;
}

function clearActivityLog() {
  activityLog.innerHTML = '<p class="empty-state">No activity yet</p>';
}

function saveSettings() {
  chrome.storage.local.set({
    serverUrl: serverUrlInput.value
  });
}

function loadSettings() {
  chrome.storage.local.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
      serverUrlInput.value = result.serverUrl;
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Popup script for Browser Agent MCP
let currentTab = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await updateStatus();
  
  // Set up event listeners
  document.getElementById('connect-btn').addEventListener('click', connectTab);
  document.getElementById('disconnect-btn').addEventListener('click', disconnectTab);
  
  // Update status every 2 seconds
  setInterval(updateStatus, 2000);
});

// Update connection status
async function updateStatus() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];
  
  if (!currentTab) return;
  
  // Update tab ID
  document.getElementById('tab-id').textContent = currentTab.id;
  
  // Get connection status from background
  const response = await chrome.runtime.sendMessage({
    type: 'GET_CONNECTION_STATUS'
  });
  
  const statusDiv = document.getElementById('status');
  const statusText = document.getElementById('status-text');
  const connectBtn = document.getElementById('connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');
  const serverStatus = document.getElementById('server-status');
  const wsStatus = document.getElementById('ws-status');
  
  if (response.connected && response.wsConnected) {
    // Fully connected
    statusDiv.className = 'status connected';
    statusDiv.querySelector('.status-icon').className = 'status-icon green';
    statusText.textContent = 'Agent Active';
    connectBtn.style.display = 'none';
    disconnectBtn.style.display = 'block';
    serverStatus.textContent = 'localhost:9222';
    wsStatus.textContent = 'Connected';
  } else if (response.connected && !response.wsConnected) {
    // Tab connected but MCP server not connected
    statusDiv.className = 'status partial';
    statusDiv.querySelector('.status-icon').className = 'status-icon yellow';
    statusText.textContent = 'MCP Server Disconnected';
    connectBtn.style.display = 'block';
    connectBtn.textContent = 'Reconnect to MCP Server';
    disconnectBtn.style.display = 'block';
    serverStatus.textContent = 'localhost:9222';
    wsStatus.textContent = 'Disconnected';
  } else {
    // Not connected
    statusDiv.className = 'status disconnected';
    statusDiv.querySelector('.status-icon').className = 'status-icon red';
    statusText.textContent = 'Not Connected';
    connectBtn.style.display = 'block';
    connectBtn.textContent = 'Connect This Tab';
    disconnectBtn.style.display = 'none';
    serverStatus.textContent = '—';
    wsStatus.textContent = '—';
  }
  
  // Load and display all tabs
  await updateTabList();
}

// Connect current tab
async function connectTab() {
  if (!currentTab) return;
  
  const connectBtn = document.getElementById('connect-btn');
  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CONNECT_TAB',
      url: currentTab.url
    });
    
    if (response.success) {
      await updateStatus();
    } else {
      alert(`Failed to connect: ${response.error}`);
    }
  } catch (error) {
    alert(`Error connecting: ${error.message}`);
  } finally {
    connectBtn.disabled = false;
  }
}

// Disconnect current tab
async function disconnectTab() {
  if (!currentTab) return;
  
  const response = await chrome.runtime.sendMessage({
    type: 'DISCONNECT_TAB'
  });
  
  if (response.success) {
    await updateStatus();
  }
}

// Update tab list
async function updateTabList() {
  const response = await chrome.runtime.sendMessage({
    type: 'LIST_TABS'
  });
  
  if (!response.tabs || response.tabs.length === 0) return;
  
  const tabList = document.getElementById('tab-list');
  const tabsContainer = document.getElementById('tabs-container');
  
  tabList.style.display = 'block';
  tabsContainer.innerHTML = '';
  
  response.tabs.forEach(tab => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    
    if (tab.active) {
      tabItem.classList.add('active');
    }
    
    if (tab.connected) {
      tabItem.classList.add('connected');
    }
    
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title || tab.url;
    title.title = tab.url;
    
    tabItem.appendChild(title);
    
    if (tab.connected) {
      const badge = document.createElement('span');
      badge.textContent = '🤖';
      badge.title = 'Agent connected';
      tabItem.appendChild(badge);
    }
    
    tabItem.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({
        type: 'SWITCH_TAB',
        tabId: tab.id
      });
      window.close();
    });
    
    tabsContainer.appendChild(tabItem);
  });
}

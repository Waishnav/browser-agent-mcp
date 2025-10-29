// WebSocket message types for browser communication

export type SocketMessageMap = {
  // Navigation
  browser_navigate: { url: string };
  browser_go_back: Record<string, never>;
  browser_go_forward: Record<string, never>;
  
  // Interactions
  browser_click: {
    element: string;
    ref: string;
    button?: "left" | "right" | "middle";
    doubleClick?: boolean;
    modifiers?: Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift">;
  };
  browser_hover: {
    element: string;
    ref: string;
  };
  browser_type: {
    element: string;
    ref: string;
    text: string;
    slowly?: boolean;
    submit?: boolean;
  };
  browser_select_option: {
    element: string;
    ref: string;
    values: string[];
  };
  browser_drag: {
    startElement: string;
    startRef: string;
    endElement: string;
    endRef: string;
  };
  
  // State
  browser_snapshot: Record<string, never>;
  browser_wait: { time: number };
  browser_press_key: { key: string };
  
  // Info
  getUrl: undefined;
  getTitle: undefined;
  browser_get_console_logs: Record<string, never>;
  browser_screenshot: Record<string, never>;
  
  // Tab management
  browser_create_tab: { url: string };
  browser_close_tab: { tabId: number };
  browser_switch_tab: { tabId: number };
  browser_list_tabs: Record<string, never>;
  
  // Visual aids
  browser_label_elements: { show: boolean };
};

export type MessageType<T> = keyof T;
export type MessagePayload<T, K extends MessageType<T>> = T[K];

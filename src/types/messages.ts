export type MessageType<T> = keyof T;
export type MessagePayload<T, K extends keyof T> = T[K] extends {
  payload: infer P;
}
  ? P
  : never;

// Socket message map defining all messages between server and extension
export type SocketMessageMap = {
  browser_navigate: { payload: { url: string }; response: void };
  browser_go_back: { payload: Record<string, never>; response: void };
  browser_go_forward: { payload: Record<string, never>; response: void };
  browser_click: {
    payload: { element: string; ref: string };
    response: void;
  };
  browser_hover: {
    payload: { element: string; ref: string };
    response: void;
  };
  browser_type: {
    payload: { element: string; ref: string; text: string };
    response: void;
  };
  browser_select_option: {
    payload: { element: string; ref: string; values: string[] };
    response: void;
  };
  browser_drag: {
    payload: {
      startElement: string;
      startRef: string;
      endElement: string;
      endRef: string;
    };
    response: void;
  };
  browser_press_key: { payload: { key: string }; response: void };
  browser_wait: { payload: { time: number }; response: void };
  browser_snapshot: { payload: Record<string, never>; response: string };
  browser_screenshot: { payload: Record<string, never>; response: string };
  browser_get_console_logs: {
    payload: Record<string, never>;
    response: any[];
  };
  browser_spawn_tab: { payload: { url: string }; response: { tabId: number } };
  browser_switch_tab: { payload: { tabId: number }; response: void };
  browser_list_tabs: {
    payload: Record<string, never>;
    response: Array<{ id: number; title: string; url: string }>;
  };
  browser_close_tab: { payload: { tabId: number }; response: void };
  browser_show_keybindings: {
    payload: Record<string, never>;
    response: { bindings: string[] };
  };
  browser_hide_keybindings: { payload: Record<string, never>; response: void };
  getUrl: { payload: undefined; response: string };
  getTitle: { payload: undefined; response: string };
};

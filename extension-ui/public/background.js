import { CONFIG } from './config.js';

chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL('index.html#/home');
  void chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((message, _) => {
  if (message.type === 'EXCHANGE_MAL_TOKEN') {
    void exchangeMalToken(message.payload.code, message.payload.state);
  }
});

async function exchangeMalToken(code, state) {
  const response = await fetch(`${CONFIG.backendUrl}/api/oauth/mal/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      state,
    }),
    credentials: 'include',
  });
  const token = await response.json();

  // noinspection JSUnresolvedVariable
  void chrome.storage.local.set({
    malToken: token.accessToken,
    malRefreshToken: token.refreshToken,
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'REFRESH_MAL_TOKEN') {
    return refreshMalToken();
  }
});

async function refreshMalToken() {
  const { malRefreshToken } = await chrome.storage.local.get(['malRefreshToken']);

  const response = await fetch(`${CONFIG.backendUrl}/api/oauth/mal/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refreshToken: malRefreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const token = await response.json();
  await chrome.storage.local.set({
    malToken: token.accessToken,
    malRefreshToken: token.refreshToken,
  });

  return {
    success: true,
    accessToken: token.accessToken,
  };
}

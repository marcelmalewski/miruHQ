chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL('index.html#/home');
  void chrome.tabs.create({ url });
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'EXCHANGE_MAL_TOKEN') {
    void exchangeMalToken(message.payload.code, message.payload.state);
  }
});

async function exchangeMalToken(code, state) {
  const response = await fetch('http://localhost:8080/api/oauth/mal/exchange', {
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
    malRefresh: token.refreshToken,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REFRESH_MAL_TOKEN') {
    refreshMalToken().then(sendResponse);
    return true; // 🔥 keep channel open
  }
});

async function refreshMalToken() {
  const { malRefresh } = await chrome.storage.local.get(['malRefresh']);

  try {
    const response = await fetch('http://localhost:8080/api/oauth/mal/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refreshToken: malRefresh,
      }),
    });

    const token = await response.json();

    await chrome.storage.local.set({
      malToken: token.accessToken,
      malRefresh: token.refreshToken,
    });

    return {
      success: true,
      accessToken: token.accessToken,
    };
  } catch (e) {
    return { success: false };
  }
}

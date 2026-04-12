// TODO przetestować kasowanie content_security_policy

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

  void chrome.storage.local.set({
    malToken: token.accessToken,
    malRefresh: token.refreshToken,
  });
}

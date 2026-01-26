chrome.action.onClicked.addListener(() => {
  const url = chrome.runtime.getURL('index.html#/home');
  void  chrome.tabs.create({ url });
});

// TODO przetestować kasowanie content_security_policy

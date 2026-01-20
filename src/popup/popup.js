document.getElementById('open-fullscreen-btn').addEventListener('click', () => {
  void chrome.tabs.create({
    url: chrome.runtime.getURL('index.html'),
  });
});

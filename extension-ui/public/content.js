window.postMessage({ type: 'CONTENT_READY' }, '*');

window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === 'EXCHANGE_MAL_TOKEN') {
    void chrome.runtime.sendMessage({ type: 'EXCHANGE_MAL_TOKEN', payload: event.data.payload });
  }
});

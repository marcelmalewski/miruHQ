window.postMessage({ type: 'CONTENT_READY' }, '*');

window.addEventListener('message', (event) => {
  console.log('📩 content got message:', event.data);

  if (event.source !== window) return;

  if (event.data?.type === 'EXCHANGE_MAL_TOKEN') {
    void chrome.runtime.sendMessage({ type: 'EXCHANGE_MAL_TOKEN', payload: event.data.payload });
  }
});

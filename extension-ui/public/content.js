const currentWindow = /** @type {Window} */ (globalThis);
const origin = globalThis.location.origin;

globalThis.postMessage({ type: 'CONTENT_READY' }, origin);

globalThis.addEventListener('message', (event) => {
  if (event.origin !== origin) {
    return;
  }

  if (event.source !== currentWindow) {
    return;
  }

  if (event.data?.type === 'EXCHANGE_MAL_TOKEN') {
    void chrome.runtime.sendMessage({
      type: 'EXCHANGE_MAL_TOKEN',
      payload: event.data.payload,
    });
  }
});

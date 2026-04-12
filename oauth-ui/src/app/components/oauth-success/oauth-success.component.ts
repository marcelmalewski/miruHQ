import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ouath-success',
  templateUrl: './oauth-success.component.html',
})
export class OauthSuccessComponent implements OnInit {
  ngOnInit() {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const code = hash.get('code');
    const state = hash.get('state');
    history.replaceState(null, '', window.location.pathname);

    if (!code || !state) {
      console.error('Missing code/state'); // TODO make notification
      return;
    }

    window.addEventListener('message', (event) => {
      if (event.source !== window) return;

      if (event.data?.type === 'CONTENT_READY') {
        window.postMessage({ type: 'EXCHANGE_MAL_TOKEN', payload: { code, state } }, '*');
      }
    });
  }
}

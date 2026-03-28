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
      console.error('Missing code/state');
      return;
    }

    fetch('http://localhost:8080/api/oauth/mal/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        state,
      }),
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Exchange failed');
        }
        return res.json();
      })
      .then((token) => {
        console.log('TOKEN RECEIVED', token);
        window.postMessage(
          {
            type: 'MAL_OAUTH_SUCCESS',
            payload: token,
          },
          '*',
        );
      })
      .catch((err) => {
        console.error('OAuth exchange failed', err);
      });
  }
}

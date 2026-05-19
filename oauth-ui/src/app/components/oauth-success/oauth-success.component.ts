import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, take } from 'rxjs';

@Component({
  selector: 'oauth-success',
  templateUrl: './oauth-success.component.html',
})
export class OauthSuccessComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const hash = new URLSearchParams(globalThis.location.hash.substring(1));
    const code = hash.get('code');
    const state = hash.get('state');
    history.replaceState(null, '', globalThis.location.pathname);

    if (!code || !state) {
      console.error('Missing OAuth code/state');
      return;
    }

    fromEvent<MessageEvent>(globalThis, 'message')
      .pipe(
        filter((event) => event.source === (globalThis as unknown as Window)),
        filter((event) => event.data?.type === 'CONTENT_READY'),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        globalThis.postMessage(
          {
            type: 'EXCHANGE_MAL_TOKEN',
            payload: { code, state },
          },
          globalThis.location.origin,
        );
      });
  }
}

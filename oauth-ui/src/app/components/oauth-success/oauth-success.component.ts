import { Component } from '@angular/core';

@Component({
  selector: 'ouath-success',
  templateUrl: './oauth-success.component.html',
})
export class OauthSuccessComponent {
  closePage(): void {
    window.close();
  }
}

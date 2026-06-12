import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly loginUrl = `${environment.backendUrl}/api/oauth/mal/login`;
}

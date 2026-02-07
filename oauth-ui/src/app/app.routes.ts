import { Routes } from '@angular/router';
import { OauthSuccessComponent } from './components/oauth-success/oauth-success.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '/oauth-success', component: OauthSuccessComponent },
];

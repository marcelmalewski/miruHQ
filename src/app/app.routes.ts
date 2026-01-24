import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { OtherComponent } from './views/other/other.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'other', component: OtherComponent }
];

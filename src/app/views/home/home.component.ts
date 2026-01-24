import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly lastRefreshed = signal(this.formatDate(new Date()));

  refresh() {
    this.lastRefreshed.set(this.formatDate(new Date()));
  }

  private formatDate(date: Date): string {
    return date.toLocaleString();
  }
}

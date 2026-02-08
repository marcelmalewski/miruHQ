import { Component, inject, Signal } from '@angular/core';
import { MalService } from '../../services/mal.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, UserInfo } from '../../spec/mal.info';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent {
  private readonly malService = inject(MalService);

  readonly userInfo: Signal<UserInfo | null> = toSignal(this.malService.getUserInfo(), {
    initialValue: null,
  });

  readonly animeList: Signal<Anime[]> = toSignal(
    this.malService.getAnime({ ids: ['59978', '61211', '60395'] }),
    { initialValue: [] },
  );

  // TODO zweryfikować algorytm
  calculateEstimatedEndDateWithDays(start: string, episodesNumber: string): string {
    const startDate = new Date(start);
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const end = new Date(startDate.getTime() + Number(episodesNumber) * oneWeek);
    const diffDays = Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${end.toISOString().split('T')[0]} (${diffDays} days)`;
  }

  prepareDetailsUrl(anime: Anime): string {
    return `https://myanimelist.net/anime/${anime.id}`;
  }

  truncate(text: string): string {
    const maxLength = 30;
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  onAuthenticate() {
    window.open('http://localhost:4200', '_blank');
  }
}

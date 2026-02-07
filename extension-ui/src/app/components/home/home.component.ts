import { Component, inject, Signal } from '@angular/core';
import { Anime, AnimeService } from '../../services/anime.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent {
  private readonly animeService = inject(AnimeService);

  readonly animeList: Signal<Anime[]> = toSignal(
    this.animeService.get({
      ids: ['59978', '61211', '60395'],
    }),
    {
      initialValue: [],
    },
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

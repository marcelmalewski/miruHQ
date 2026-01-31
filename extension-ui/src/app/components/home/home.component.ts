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
    this.animeService.get({ ids: ['59978', '61211'] }),
    {
      initialValue: [],
    },
  );

  getEstimatedEndDate(startDate: string, numEpisodes: string): string {
    const start = new Date(startDate);
    const episodes = Number(numEpisodes);
    // assuming 1 episode per week
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 * episodes);
    return end.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

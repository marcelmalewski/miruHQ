import { Component, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { MalService } from '../../services/mal.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, UserInfo } from '../../spec/mal.info';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent implements OnInit {
  private readonly malService = inject(MalService);

  limit = 10;
  currentPage = 1;

  userInfo: Signal<UserInfo | null> = toSignal(this.malService.getUserInfo(), {
    initialValue: null,
  });

  // animeList: WritableSignal<Anime[]> = toSignal(this.malService.findUserAnimeList(), {
  //   initialValue: [],
  // });
  animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.currentPage = page;
    const offset = (page - 1) * this.limit;

    this.malService
      .findUserAnimeList(this.limit, offset)
      .subscribe((data) => this.animeList.set(data));
  }

  // TODO zweryfikować algorytm
  calculateEstimatedEndDateWithDays(start: string, episodesNumber: string): string {
    const startDate = new Date(start);
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const end = new Date(startDate.getTime() + Number(episodesNumber) * oneWeek);
    const diffDays = Math.ceil((end.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${end.toISOString().split('T')[0]} (${diffDays} days)`;
  }

  prepareUserInfoDetailsUrl(userInfo: UserInfo) {
    return `https://myanimelist.net/profile/${userInfo.name}`;
  }

  prepareAnimeDetailsUrl(anime: Anime): string {
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

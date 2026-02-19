import { Component, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { MalService } from '../../services/mal.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, UserInfo } from '../../spec/mal-spec';
import {
  PrettyStatus,
  PrettyStatuses,
  PrettyStatusToStatus,
  SearchAllAnimeRequest,
  SearchAnimeRequest,
  SearchMode,
  SearchUserAnimeRequest,
  Statuses,
} from '../../spec/search-anime-spec';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent implements OnInit {
  private readonly malService = inject(MalService);

  prettyStatuses: PrettyStatus[] = Object.values(PrettyStatuses);
  pageSizeOptions = [10, 25, 50];
  currentMode = SearchMode.USER_ANIME;

  searchAnimeRequest: SearchAnimeRequest = {
    status: Statuses.PLAN_TO_WATCH,
    page: 1,
    pageSize: this.pageSizeOptions[0],
  };

  hasNextPage: WritableSignal<boolean> = signal(true);

  userInfo: Signal<UserInfo | null> = toSignal(this.malService.getUserInfo(), {
    initialValue: null,
  });

  animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  ngOnInit(): void {
    this.loadPage();
  }

  onPageChange(page: number) {
    this.searchAnimeRequest.page = page;
    this.loadPage();
  }

  onPageSizeChange(newLimit: number) {
    this.searchAnimeRequest.pageSize = newLimit;
    this.searchAnimeRequest.page = 1;
    this.loadPage();
  }

  onStatusChange(status: PrettyStatus) {
    this.searchAnimeRequest.status = PrettyStatusToStatus[status];
    this.loadPage();
  }

  loadPage() {
    const offset = (this.searchAnimeRequest.page - 1) * this.searchAnimeRequest.pageSize;

    if (this.currentMode === SearchMode.USER_ANIME) {
      this.loadUserAnimeList(this.searchAnimeRequest as SearchUserAnimeRequest, offset);
    } else {
      this.loadAllAnimeList(this.searchAnimeRequest as SearchAllAnimeRequest, offset);
    }
  }

  loadUserAnimeList(searchAnimeRequest: SearchUserAnimeRequest, offset: number) {
    this.malService
      .findUserAnimeList(searchAnimeRequest.pageSize, offset, searchAnimeRequest.status)
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  loadAllAnimeList(searchAnimeRequest: SearchAllAnimeRequest, offset: number) {
    console.log(searchAnimeRequest);
  }

  onAuthenticate() {
    window.open('http://localhost:4200', '_blank');
  }

  // TODO idzie na backend
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
}

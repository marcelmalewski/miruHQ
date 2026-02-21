import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { MalService } from '../../services/mal.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, UserInfo } from '../../spec/mal-spec';
import {
  AnimeSortFields,
  AnimeStatuses,
  PrettyAnimeSortField,
  PrettyAnimeSortFields,
  PrettyAnimeSortFieldToSortField,
  PrettyAnimeStatus,
  PrettyAnimeStatuses,
  PrettyAnimeStatusToStatus,
  SearchAllAnimeRequest,
  SearchAnimeRequest,
  SearchMode,
  SearchUserAnimeRequest,
} from '../../spec/search-anime-spec';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent implements OnInit {
  private readonly malService = inject(MalService);
  private readonly destroyRef = inject(DestroyRef);

  prettyStatuses: PrettyAnimeStatus[] = Object.values(PrettyAnimeStatuses);
  prettySortFields: PrettyAnimeSortField[] = Object.values(PrettyAnimeSortFields);
  pageSizeOptions = [10, 25, 50];

  currentMode: string = SearchMode.USER_ANIME;
  searchAnimeRequest: SearchAnimeRequest = {
    status: AnimeStatuses.PLAN_TO_WATCH,
    sortField: AnimeSortFields.ANIME_START_DATE,
    page: 1,
    pageSize: this.pageSizeOptions[0],
  };

  private readonly searchTitleInput$ = new Subject<string>();

  protected readonly SearchMode = SearchMode;

  hasNextPage: WritableSignal<boolean> = signal(true);

  userInfo: Signal<UserInfo | null> = toSignal(this.malService.getUserInfo(), {
    initialValue: null,
  });

  animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  ngOnInit(): void {
    this.loadPage();
    this.searchTitleInput$
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300), distinctUntilChanged())
      .subscribe((titleInput) => {
        this.searchByTitle(titleInput);
      });
  }

  onTitleInputChange(titleInput: string) {
    this.searchTitleInput$.next(titleInput);
  }

  private searchByTitle(titleInput: string) {
    if (titleInput.length < 3) {
      this.animeList.set([]);
      this.hasNextPage.set(false);
      return;
    }
    this.searchAnimeRequest.title = titleInput;
    this.loadPage();
  }

  onModeKeyDown(event: KeyboardEvent, mode: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.switchMode(mode);
    }
  }

  switchMode(mode: string) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    if (this.currentMode === SearchMode.USER_ANIME) {
      this.searchAnimeRequest = {
        status: AnimeStatuses.PLAN_TO_WATCH,
        sortField: AnimeSortFields.ANIME_START_DATE,
        page: 1,
        pageSize: this.pageSizeOptions[0],
      };
      this.loadPage();
    } else {
      this.searchAnimeRequest = {
        title: '',
        page: 1,
        pageSize: this.pageSizeOptions[0],
      };
      this.animeList.set([]);
      this.hasNextPage.set(false);
    }
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

  onStatusChange(prettyStatus: PrettyAnimeStatus) {
    this.searchAnimeRequest.status = PrettyAnimeStatusToStatus[prettyStatus];
    this.loadPage();
  }

  onSortFieldChange(prettySortField: PrettyAnimeSortField) {
    this.searchAnimeRequest.sortField = PrettyAnimeSortFieldToSortField[prettySortField];
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
      .findUserAnimeList(
        searchAnimeRequest.pageSize,
        offset,
        searchAnimeRequest.status,
        searchAnimeRequest.sortField,
      )
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  loadAllAnimeList(searchAnimeRequest: SearchAllAnimeRequest, offset: number) {
    this.malService
      .findAnime(searchAnimeRequest.pageSize, offset, searchAnimeRequest.title)
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
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

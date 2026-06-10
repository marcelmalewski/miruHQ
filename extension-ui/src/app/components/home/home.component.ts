import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MalService } from '../../services/mal.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, PrincipalInfo } from '../../spec/mal-spec';
import {
  AnimeSortFields,
  AnimeStatuses,
  AnimeStatusToPrettyStatus,
  PrettyAnimeSortField,
  PrettyAnimeSortFields,
  PrettyAnimeSortFieldToSortField,
  PrettyAnimeStatus,
  PrettyAnimeStatuses,
  PrettyAnimeStatusToStatus,
  SearchAllAnimeRequest,
  SearchAnimeRequest,
  SearchMode,
  SearchModes,
  SearchPrincipalAnimeListRequest,
} from '../../spec/search-anime-spec';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage],
})
export class HomeComponent implements OnInit {
  private readonly malService = inject(MalService);
  private readonly destroyRef = inject(DestroyRef);

  protected prettyStatuses: PrettyAnimeStatus[] = Object.values(PrettyAnimeStatuses);
  protected prettySortFields: PrettyAnimeSortField[] = Object.values(PrettyAnimeSortFields);
  protected pageSizeOptions = [10, 25, 50];

  private readonly initialSearchAnimeRequestForPrincipalAnimeSearchMode: SearchAnimeRequest = {
    status: AnimeStatuses.PLAN_TO_WATCH,
    sortField: AnimeSortFields.ANIME_START_DATE,
    page: 1,
    pageSize: this.pageSizeOptions[0],
  };
  private readonly initialSearchAnimeRequestForMissingTitlesSearchMode: SearchAnimeRequest = {
    status: AnimeStatuses.COMPLETED,
    sortField: AnimeSortFields.ANIME_START_DATE,
    page: 1,
    pageSize: this.pageSizeOptions[0],
  };
  protected searchAnimeRequest = this.initialSearchAnimeRequestForPrincipalAnimeSearchMode;

  private readonly searchTitleInput$ = new Subject<string>();

  protected readonly SearchMode = SearchModes;

  protected readonly selectedStatus: WritableSignal<PrettyAnimeStatus> = signal(
    PrettyAnimeStatuses.PLAN_TO_WATCH,
  );

  protected readonly hasNextPage = signal(true);

  protected readonly principalMode = signal(false);

  protected readonly currentSearchMode: WritableSignal<SearchMode | null> = signal(null);

  protected readonly principalInfo = toSignal(
    toObservable(this.principalMode).pipe(
      switchMap((loggedIn) => (loggedIn ? this.malService.getPrincipalInfo() : of(null))),
    ),
    { initialValue: null },
  );

  protected readonly animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  protected readonly titleInputTooShort: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly showHelp: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    chrome.storage.local.get(['malToken'], (result) => {
      this.principalMode.set(!!result['malToken']);
      this.initSetup();
    });
  }

  private initSetup() {
    this.currentSearchMode.set(
      this.principalMode() ? SearchModes.PRINCIPAL_ANIME : SearchModes.ALL_ANIME,
    );

    this.initialLoadPage();
    this.searchTitleInput$
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300), distinctUntilChanged())
      .subscribe((titleInput) => {
        this.searchByTitle(titleInput);
      });
  }

  private initialLoadPage() {
    if (this.currentSearchMode() === SearchModes.ALL_ANIME) {
      this.handleTitleInputTooShort();
      return;
    }
    this.loadPage();
  }

  private searchByTitle(titleInput: string) {
    if (titleInput.length < 3) {
      this.handleTitleInputTooShort();
      return;
    }
    this.titleInputTooShort.set(false);
    this.searchAnimeRequest.title = titleInput;
    this.loadPage();
  }

  private handleTitleInputTooShort() {
    this.animeList.set([]);
    this.hasNextPage.set(false);
    this.titleInputTooShort.set(true);
  }

  protected onTitleInputChange(titleInput: string) {
    this.searchTitleInput$.next(titleInput);
  }

  protected onModeKeyDown(event: KeyboardEvent, mode: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.switchMode(mode);
    }
  }

  protected switchMode(mode: string) {
    if (this.currentSearchMode() === mode) return;

    this.currentSearchMode.set(mode as SearchMode);

    if (this.currentSearchMode() === SearchModes.PRINCIPAL_ANIME) {
      this.titleInputTooShort.set(false);
      this.selectedStatus.set(AnimeStatusToPrettyStatus[AnimeStatuses.PLAN_TO_WATCH]);
      this.searchAnimeRequest = this.initialSearchAnimeRequestForPrincipalAnimeSearchMode;
      this.loadPage();
    } else if (this.currentSearchMode() === SearchModes.ALL_ANIME) {
      this.handleTitleInputTooShort();
      this.searchAnimeRequest = {
        title: '',
        page: 1,
        pageSize: this.pageSizeOptions[0],
      };
    } else {
      this.titleInputTooShort.set(false);
      this.selectedStatus.set(AnimeStatusToPrettyStatus[AnimeStatuses.COMPLETED]);
      this.searchAnimeRequest = this.initialSearchAnimeRequestForMissingTitlesSearchMode;
      this.loadPage();
    }
  }

  protected onPageChange(page: number) {
    this.searchAnimeRequest.page = page;
    this.loadPage();
  }

  protected onPageSizeChange(newLimit: number) {
    this.searchAnimeRequest.pageSize = newLimit;
    this.searchAnimeRequest.page = 1;
    this.loadPage();
  }

  protected onStatusChange(prettyStatus: PrettyAnimeStatus) {
    this.searchAnimeRequest.status = PrettyAnimeStatusToStatus[prettyStatus];
    this.loadPage();
  }

  protected onSortFieldChange(prettySortField: PrettyAnimeSortField) {
    this.searchAnimeRequest.sortField = PrettyAnimeSortFieldToSortField[prettySortField];
    this.loadPage();
  }

  private loadPage() {
    const offset = (this.searchAnimeRequest.page - 1) * this.searchAnimeRequest.pageSize;

    if (this.currentSearchMode() === SearchModes.PRINCIPAL_ANIME) {
      this.loadPrincipalAnimeList(
        this.searchAnimeRequest as SearchPrincipalAnimeListRequest,
        offset,
      );
    } else if (this.currentSearchMode() === SearchModes.ALL_ANIME) {
      this.loadAllAnimeList(this.searchAnimeRequest as SearchAllAnimeRequest, offset);
    } else {
      this.loadPrincipalMissingTitles(
        this.searchAnimeRequest as SearchPrincipalAnimeListRequest,
        offset,
      );
    }
  }

  private loadPrincipalAnimeList(
    searchAnimeRequest: SearchPrincipalAnimeListRequest,
    offset: number,
  ) {
    this.malService
      .findPrincipalAnimeList(
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

  private loadPrincipalMissingTitles(
    searchAnimeRequest: SearchPrincipalAnimeListRequest,
    offset: number,
  ) {
    this.malService
      .findPrincipalMissingTitles(
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

  private loadAllAnimeList(searchAnimeRequest: SearchAllAnimeRequest, offset: number) {
    this.malService
      .findAnime(searchAnimeRequest.pageSize, offset, searchAnimeRequest.title)
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  protected calculateEstimatedEndDateWithDays(startDateStr: string, numEpisodes: number): string {
    const startDateParts = startDateStr.split('-');
    if (startDateParts.length < 3 || numEpisodes === 0) {
      return 'Unknown';
    }

    const startDate = new Date(`${startDateStr}T00:00:00Z`);
    const endDate = new Date(startDate);
    const totalDays = (numEpisodes - 1) * 7;
    endDate.setUTCDate(endDate.getUTCDate() + totalDays);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const diffMs = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) - 1;
    const endDateStr = endDate.toISOString().slice(0, 10);

    return diffDays < 0 ? `Finished` : `${endDateStr} (${diffDays} days remaining)`;
  }

  protected preparePrincipalInfoDetailsUrl(principalInfo: PrincipalInfo) {
    return `https://myanimelist.net/profile/${principalInfo.name}`;
  }

  protected prepareAnimeDetailsUrl(id: number): string {
    return `https://myanimelist.net/anime/${id}`;
  }

  protected truncate(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  protected onAuthenticate(): void {
    // window.open('https://www.miruhq.org/oauth');
    window.open('http://localhost:4200/oauth');
  }

  protected onLogout(): void {
    this.malService.logout();
  }

  protected onRefreshPrincipalAnime(): void {}

  protected onRefreshMalAnimeRelations(): void {}
}

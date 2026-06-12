import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MalService } from '../../services/mal.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { Anime, PrincipalInfo } from '../../spec/mal-spec';
import {
  AnimeRelationType,
  AnimeRelationTypes,
  AnimeRelationTypeToPrettyRelationType,
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
  SearchPrincipalMissingTitles,
} from '../../spec/search-anime-spec';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap } from 'rxjs';
import { AnimeTileService } from '../../services/anime-tile.service';
import { MissingTitleComponent } from '../missing-title/missing-title.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  imports: [NgOptimizedImage, MissingTitleComponent, ClickOutsideDirective],
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
    relationTypes: [AnimeRelationTypes.SEQUEL],
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

  protected readonly selectedRelationTypesDisplayText = computed(() => {
    const maxLength = 18;
    const selectedRelationType = this.selectedRelationTypes().map(
      (relationType) => AnimeRelationTypeToPrettyRelationType[relationType],
    );

    if (selectedRelationType.length === Object.values(AnimeRelationTypes).length) {
      return 'All relation types';
    }

    let displayText = '';
    for (const relationType of selectedRelationType) {
      const newDisplayText = displayText ? `${displayText}, ${relationType}` : relationType;

      if (newDisplayText.length > maxLength) {
        return `${newDisplayText.slice(0, maxLength - 3)}...`;
      }

      displayText = newDisplayText;
    }

    return displayText;
  });

  protected readonly showRelationFilter = signal(false);

  protected readonly selectedRelationTypes = signal<AnimeRelationType[]>([
    AnimeRelationTypes.SEQUEL,
  ]);

  protected readonly animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  protected readonly titleInputTooShort: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly showHelp: WritableSignal<boolean> = signal<boolean>(false);

  protected readonly loading = signal(false);

  ngOnInit(): void {
    chrome.storage.local.get(['malToken'], (result) => {
      this.principalMode.set(!!result['malToken']);
      this.initSetup();
    });
  }

  private initSetup(): void {
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

  private initialLoadPage(): void {
    if (this.currentSearchMode() === SearchModes.ALL_ANIME) {
      this.handleTitleInputTooShort();
      return;
    }
    this.loadPage();
  }

  private searchByTitle(titleInput: string): void {
    if (titleInput.length < 3) {
      this.handleTitleInputTooShort();
      return;
    }
    this.titleInputTooShort.set(false);
    this.searchAnimeRequest.title = titleInput;
    this.loadPage();
  }

  private handleTitleInputTooShort(): void {
    this.animeList.set([]);
    this.hasNextPage.set(false);
    this.titleInputTooShort.set(true);
  }

  protected onTitleInputChange(titleInput: string): void {
    this.searchTitleInput$.next(titleInput);
  }

  protected onModeKeyDown(event: KeyboardEvent, mode: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.switchMode(mode);
    }
  }

  protected switchMode(mode: string): void {
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
      this.selectedRelationTypes.set(['sequel']);
      this.searchAnimeRequest = this.initialSearchAnimeRequestForMissingTitlesSearchMode;
      this.loadPage();
    }
  }

  protected onPageChange(page: number): void {
    this.searchAnimeRequest.page = page;
    this.loadPage();
  }

  protected onPageSizeChange(newLimit: number): void {
    this.searchAnimeRequest.pageSize = newLimit;
    this.searchAnimeRequest.page = 1;
    this.loadPage();
  }

  protected onStatusChange(prettyStatus: PrettyAnimeStatus): void {
    this.searchAnimeRequest.status = PrettyAnimeStatusToStatus[prettyStatus];
    this.searchAnimeRequest.page = 1;
    this.loadPage();
  }

  protected onSortFieldChange(prettySortField: PrettyAnimeSortField): void {
    this.searchAnimeRequest.sortField = PrettyAnimeSortFieldToSortField[prettySortField];
    this.searchAnimeRequest.page = 1;
    this.loadPage();
  }

  protected onRelationTypesChange(newRelationType: AnimeRelationType): void {
    this.selectedRelationTypes.update((selectedRelationTypes) =>
      selectedRelationTypes.includes(newRelationType)
        ? selectedRelationTypes.filter((relationType) => relationType !== newRelationType)
        : [...selectedRelationTypes, newRelationType],
    );

    this.searchAnimeRequest.page = 1;
    this.searchAnimeRequest.relationTypes = this.selectedRelationTypes();
    this.loadPage();
  }

  private loadPage(): void {
    const offset = (this.searchAnimeRequest.page - 1) * this.searchAnimeRequest.pageSize;

    this.loading.set(true);
    this.animeList.set([]);

    if (this.currentSearchMode() === SearchModes.PRINCIPAL_ANIME) {
      this.loadPrincipalAnimeList(
        this.searchAnimeRequest as SearchPrincipalAnimeListRequest,
        offset,
      );
    } else if (this.currentSearchMode() === SearchModes.ALL_ANIME) {
      this.loadAllAnimeList(this.searchAnimeRequest as SearchAllAnimeRequest, offset);
    } else {
      this.loadPrincipalMissingTitles(
        this.searchAnimeRequest as SearchPrincipalMissingTitles,
        offset,
      );
    }
  }

  private loadPrincipalAnimeList(
    searchAnimeRequest: SearchPrincipalAnimeListRequest,
    offset: number,
  ): void {
    this.malService
      .findPrincipalAnimeList(
        searchAnimeRequest.pageSize,
        offset,
        searchAnimeRequest.status,
        searchAnimeRequest.sortField,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  private loadPrincipalMissingTitles(
    searchRequest: SearchPrincipalMissingTitles,
    offset: number,
  ): void {
    this.malService
      .findPrincipalMissingTitles(
        searchRequest.pageSize,
        offset,
        searchRequest.status,
        searchRequest.sortField,
        false,
        false,
        searchRequest.relationTypes,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  private loadAllAnimeList(searchAnimeRequest: SearchAllAnimeRequest, offset: number): void {
    this.malService
      .findAnime(searchAnimeRequest.pageSize, offset, searchAnimeRequest.title)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => {
        this.animeList.set(data);
        this.hasNextPage.set(data.length === this.searchAnimeRequest.pageSize);
      });
  }

  protected calculateEstimatedEndDateWithDays(startDateStr: string, numEpisodes: number): string {
    if (!startDateStr) {
      return 'Unknown';
    }

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

  protected preparePrincipalInfoDetailsUrl(principalInfo: PrincipalInfo): string {
    return `https://myanimelist.net/profile/${principalInfo.name}`;
  }

  protected onAuthenticate(): void {
    window.open(`${environment.backendUrl}/oauth`);
  }

  protected onLogout(): void {
    this.malService.logout();
  }

  protected onRefreshPrincipalAnime(): void {
    this.refresh(true, false);
  }

  protected onRefreshMalAnimeRelations(): void {
    this.refresh(false, true);
  }

  private refresh(refreshPrincipalAnime: boolean, refreshAnimeRelations: boolean): void {
    const request = this.searchAnimeRequest as SearchPrincipalMissingTitles;

    this.malService
      .findPrincipalMissingTitles(
        request.pageSize,
        0,
        request.status,
        request.sortField,
        refreshPrincipalAnime,
        refreshAnimeRelations,
        request.relationTypes,
      )
      .subscribe((data) => {
        request.page = 1;

        this.animeList.set(data);
        this.hasNextPage.set(data.length === request.pageSize);
      });
  }

  protected readonly AnimeTileService = AnimeTileService;
  protected readonly Object = Object;
  protected readonly AnimeRelationTypes = AnimeRelationTypes;
  protected readonly AnimeRelationTypeToPrettyRelationType = AnimeRelationTypeToPrettyRelationType;
}

import {
  Component,
  computed,
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
import { Anime, PrincipalInfo } from '../../spec/mal-spec';
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
  SearchPrincipalAnimeListRequest,
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

  currentMode: string = SearchMode.PRINCIPAL_ANIME;
  searchAnimeRequest: SearchAnimeRequest = {
    status: AnimeStatuses.PLAN_TO_WATCH,
    sortField: AnimeSortFields.ANIME_START_DATE,
    page: 1,
    pageSize: this.pageSizeOptions[0],
  };

  private readonly searchTitleInput$ = new Subject<string>();

  protected readonly SearchMode = SearchMode;

  hasNextPage: WritableSignal<boolean> = signal(true);

  principalInfo: Signal<PrincipalInfo | null> = toSignal(this.malService.getPrincipalInfo(), {
    initialValue: null,
  });

  animeList: WritableSignal<Anime[]> = signal<Anime[]>([]);

  titleInputTooShort: WritableSignal<boolean> = signal<boolean>(false);

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
      this.titleInputTooShort.set(true);
      return;
    }
    this.titleInputTooShort.set(false);
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
    if (this.currentMode === SearchMode.PRINCIPAL_ANIME) {
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

    if (this.currentMode === SearchMode.PRINCIPAL_ANIME) {
      this.loadPrincipalAnimeList(
        this.searchAnimeRequest as SearchPrincipalAnimeListRequest,
        offset,
      );
    } else {
      this.loadAllAnimeList(this.searchAnimeRequest as SearchAllAnimeRequest, offset);
    }
  }

  loadPrincipalAnimeList(searchAnimeRequest: SearchPrincipalAnimeListRequest, offset: number) {
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

  calculateEstimatedEndDateWithDays(startDate: string, numEpisodes: number): string {
    const startDateElements = startDate.split('-');
    if (startDateElements.length < 3 || numEpisodes === 0) {
      return 'Unknown';
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime())) {
      return 'Invalid date';
    }

    const totalDays = numEpisodes * 7;
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + totalDays);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const diffMs = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const endDateStr = end.toISOString().slice(0, 10);

    if (diffDays < 0) {
      return `${endDateStr} (ended ${Math.abs(diffDays)} days ago)`;
    }

    return `${endDateStr} (${diffDays} days remaining)`;
  }

  preparePrincipalInfoDetailsUrl(principalInfo: PrincipalInfo) {
    return `https://myanimelist.net/profile/${principalInfo.name}`;
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

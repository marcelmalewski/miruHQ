export interface SearchUserAnimeRequest extends PaginatedRequest {
  status: AnimeStatus;
  sortField: AnimeSortField;
}

export interface SearchAllAnimeRequest extends PaginatedRequest {
  title: string;
}

export interface SearchAnimeRequest extends PaginatedRequest {
  title?: string;
  status?: AnimeStatus;
  sortField?: AnimeSortField;
}

export const SearchMode = {
  USER_ANIME: 'USER_ANIME',
  ALL_ANIME: 'ALL_ANIME',
} as const;

export const AnimeStatuses = {
  PLAN_TO_WATCH: 'plan_to_watch',
  WATCHING: 'watching',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  DROPPED: 'dropped',
} as const;
type AnimeStatusKeys = keyof typeof AnimeStatuses;
export type AnimeStatus = (typeof AnimeStatuses)[AnimeStatusKeys];

export const PrettyAnimeStatuses = {
  PLAN_TO_WATCH: 'Plan to watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  ON_HOLD: 'On hold',
  DROPPED: 'Dropped',
} as const;
type PrettyAnimeStatusKeys = keyof typeof PrettyAnimeStatuses;
export type PrettyAnimeStatus = (typeof PrettyAnimeStatuses)[PrettyAnimeStatusKeys];

export const PrettyAnimeStatusToStatus: Record<PrettyAnimeStatus, AnimeStatus> = {
  'Plan to watch': AnimeStatuses.PLAN_TO_WATCH,
  Watching: AnimeStatuses.WATCHING,
  Completed: AnimeStatuses.COMPLETED,
  'On hold': AnimeStatuses.ON_HOLD,
  Dropped: AnimeStatuses.DROPPED,
};

export const AnimeSortFields = {
  LIST_SCORE: 'list_score',
  LIST_UPDATED_AT: 'list_updated_at',
  ANIME_TITLE: 'anime_title',
  ANIME_START_DATE: 'anime_start_date',
} as const;
type AnimeSortFieldKeys = keyof typeof AnimeSortFields;
export type AnimeSortField = (typeof AnimeSortFields)[AnimeSortFieldKeys];

export const PrettyAnimeSortFields = {
  ANIME_START_DATE: 'Start date',
  LIST_UPDATED_AT: 'Last updated',
  ANIME_TITLE: 'Title',
  LIST_SCORE: 'Score',
} as const;
type PrettyAnimeSortFieldKeys = keyof typeof PrettyAnimeSortFields;
export type PrettyAnimeSortField = (typeof PrettyAnimeSortFields)[PrettyAnimeSortFieldKeys];

export const PrettyAnimeSortFieldToSortField: Record<PrettyAnimeSortField, AnimeSortField> = {
  Score: AnimeSortFields.LIST_SCORE,
  'Last updated': AnimeSortFields.LIST_UPDATED_AT,
  Title: AnimeSortFields.ANIME_TITLE,
  'Start date': AnimeSortFields.ANIME_START_DATE,
};

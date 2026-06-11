export interface SearchPrincipalAnimeListRequest extends PaginatedRequest {
  status: AnimeStatus;
  sortField: AnimeSortField;
}

export interface SearchPrincipalMissingTitles extends PaginatedRequest {
  status: AnimeStatus;
  sortField: AnimeSortField;
  relationTypes: AnimeRelationType[];
}

export interface SearchAllAnimeRequest extends PaginatedRequest {
  title: string;
}

export interface SearchAnimeRequest extends PaginatedRequest {
  title?: string;
  status?: AnimeStatus;
  sortField?: AnimeSortField;
  relationTypes?: AnimeRelationType[];
}

export const SearchModes = {
  PRINCIPAL_ANIME: 'PRINCIPAL_ANIME',
  ALL_ANIME: 'ALL_ANIME',
  MISSING_TITLES: 'MISSING_TITLES',
} as const;
type SearchModesKeys = keyof typeof SearchModes;
export type SearchMode = (typeof SearchModes)[SearchModesKeys];

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

export const AnimeStatusToPrettyStatus: Record<AnimeStatus, PrettyAnimeStatus> = {
  plan_to_watch: PrettyAnimeStatuses.PLAN_TO_WATCH,
  watching: PrettyAnimeStatuses.WATCHING,
  completed: PrettyAnimeStatuses.COMPLETED,
  on_hold: PrettyAnimeStatuses.ON_HOLD,
  dropped: PrettyAnimeStatuses.DROPPED,
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

export const AnimeRelationTypes = {
  SEQUEL: 'sequel',
  PREQUEL: 'prequel',
  ALTERNATIVE_SETTING: 'alternative_setting',
  ALTERNATIVE_VERSION: 'alternative_version',
  SIDE_STORY: 'side_story',
  PARENT_STORY: 'parent_story',
  SUMMARY: 'summary',
  FULL_STORY: 'full_story',
} as const;

type AnimeRelationTypeKeys = keyof typeof AnimeRelationTypes;

export type AnimeRelationType = (typeof AnimeRelationTypes)[AnimeRelationTypeKeys];

export const PrettyAnimeRelationTypes = {
  SEQUEL: 'Sequel',
  PREQUEL: 'Prequel',
  ALTERNATIVE_SETTING: 'Alternative Setting',
  ALTERNATIVE_VERSION: 'Alternative Version',
  SIDE_STORY: 'Side Story',
  PARENT_STORY: 'Parent Story',
  SUMMARY: 'Summary',
  FULL_STORY: 'Full Story',
} as const;

type PrettyAnimeRelationTypeKeys = keyof typeof PrettyAnimeRelationTypes;

export type PrettyAnimeRelationType =
  (typeof PrettyAnimeRelationTypes)[PrettyAnimeRelationTypeKeys];

export const AnimeRelationTypeToPrettyRelationType: Record<
  AnimeRelationType,
  PrettyAnimeRelationType
> = {
  sequel: PrettyAnimeRelationTypes.SEQUEL,
  prequel: PrettyAnimeRelationTypes.PREQUEL,
  alternative_setting: PrettyAnimeRelationTypes.ALTERNATIVE_SETTING,
  alternative_version: PrettyAnimeRelationTypes.ALTERNATIVE_VERSION,
  side_story: PrettyAnimeRelationTypes.SIDE_STORY,
  parent_story: PrettyAnimeRelationTypes.PARENT_STORY,
  summary: PrettyAnimeRelationTypes.SUMMARY,
  full_story: PrettyAnimeRelationTypes.FULL_STORY,
};

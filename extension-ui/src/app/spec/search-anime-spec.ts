interface PaginatedRequest {
  page: number;
  pageSize: number;
}

export interface SearchUserAnimeRequest extends PaginatedRequest {
  status: Status;
}

export interface SearchAllAnimeRequest extends PaginatedRequest {
  title: string;
}

export interface SearchAnimeRequest extends PaginatedRequest {
  title?: string;
  status?: Status;
}

export const SearchMode = {
  USER_ANIME: 'USER_ANIME',
  ALL_ANIME: 'ALL_ANIME',
} as const;

export const Statuses = {
  PLAN_TO_WATCH: 'plan_to_watch',
  WATCHING: 'watching',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  DROPPED: 'dropped',
} as const;
type StatusKeys = keyof typeof Statuses;
export type Status = (typeof Statuses)[StatusKeys];

export const PrettyStatuses = {
  PLAN_TO_WATCH: 'Plan to watch',
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  ON_HOLD: 'On hold',
  DROPPED: 'Dropped',
} as const;
type PrettyStatusKeys = keyof typeof PrettyStatuses;
export type PrettyStatus = (typeof PrettyStatuses)[PrettyStatusKeys];

export const PrettyStatusToStatus: Record<PrettyStatus, Status> = {
  'Plan to watch': Statuses.PLAN_TO_WATCH,
  Watching: Statuses.WATCHING,
  Completed: Statuses.COMPLETED,
  'On hold': Statuses.ON_HOLD,
  Dropped: Statuses.DROPPED,
};

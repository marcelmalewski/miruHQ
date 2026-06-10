export interface Anime {
  id: number;
  title: string;
  startDate: string;
  numEpisodes: number;
  mainPicture: MainPicture;
  missingTitles: RelatedAnimeDto[];
}

export interface MainPicture {
  medium: string;
  large: string;
}

export interface PrincipalInfo {
  id: string;
  name: string;
}

export interface RelatedAnimeDto {
  id: number;
  title: string;
  mainPicture: MainPicture;
  relationTypeFormatted: string;
}

export interface Anime {
  id: string;
  title: string;
  startDate: string;
  numEpisodes: string;
  mainPicture: MainPicture;
}

export interface MainPicture {
  medium: string;
  large: string;
}

export interface PrincipalInfo {
  id: string;
  name: string;
}

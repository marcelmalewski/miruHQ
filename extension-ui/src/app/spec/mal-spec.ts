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

export interface UserInfo {
  id: string;
  name: string;
}

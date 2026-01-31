import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface AnimeSearchRequest {
  ids: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api/anime';

  get(request: AnimeSearchRequest): Observable<Anime[]> {
    const url = `${this.baseUrl}/search`;
    return this.http.post<Anime[]>(url, request);
  }
}

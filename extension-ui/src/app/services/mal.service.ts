import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Anime, AnimeSearchRequest, UserInfo } from '../spec/mal.info';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api';

  searchAnime(request: AnimeSearchRequest): Observable<Anime[]> {
    const url = `${this.baseUrl}/anime/search`;
    return this.http.post<Anime[]>(url, request);
  }

  getUserInfo(): Observable<UserInfo> {
    const url = `${this.baseUrl}/users/@me`;
    return this.http.get<UserInfo>(url);
  }
}

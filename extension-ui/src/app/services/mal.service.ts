import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime, UserInfo } from '../spec/mal-spec';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api';

  findAnime(pageSize: number, offset: number, title: string): Observable<Anime[]> {
    const url = `${this.baseUrl}/anime?limit=${pageSize}&offset=${offset}&title=${title}`;
    return this.http.get<Anime[]>(url);
  }

  findUserAnimeList(
    pageSize: number,
    offset: number,
    statusOption: string,
    sortField: string,
  ): Observable<Anime[]> {
    const url = `${this.baseUrl}/users/@me/anime-list?limit=${pageSize}&offset=${offset}&status=${statusOption}&sortField=${sortField}`;
    return this.http.get<Anime[]>(url);
  }

  getUserInfo(): Observable<UserInfo> {
    const url = `${this.baseUrl}/users/@me`;
    return this.http.get<UserInfo>(url);
  }
}

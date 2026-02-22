import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime, PrincipalInfo } from '../spec/mal-spec';

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

  findPrincipalAnimeList(
    pageSize: number,
    offset: number,
    statusOption: string,
    sortField: string,
  ): Observable<Anime[]> {
    const url = `${this.baseUrl}/users/@me/anime-list?limit=${pageSize}&offset=${offset}&status=${statusOption}&sortField=${sortField}`;
    return this.http.get<Anime[]>(url);
  }

  getPrincipalInfo(): Observable<PrincipalInfo> {
    const url = `${this.baseUrl}/users/@me`;
    return this.http.get<PrincipalInfo>(url);
  }
}

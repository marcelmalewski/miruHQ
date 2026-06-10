import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, from, Observable, switchMap } from 'rxjs';
import { Anime, PrincipalInfo } from '../spec/mal-spec';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private readonly http = inject(HttpClient);
  // private readonly baseUrl = 'https://miruhq-api.onrender.com/api';
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
    return this.withAuthHeaders((headers) => this.http.get<Anime[]>(url, { headers }));
  }

  findPrincipalMissingTitles(
    pageSize: number,
    offset: number,
    statusOption: string,
    sortField: string,
    refreshPrincipalAnime: boolean,
    refreshAnimeRelations: boolean,
  ): Observable<Anime[]> {
    const params = new HttpParams()
      .set('limit', pageSize)
      .set('offset', offset)
      .set('status', statusOption)
      .set('sortField', sortField)
      .set('refreshPrincipalAnime', refreshPrincipalAnime)
      .set('refreshAnimeRelations', refreshAnimeRelations);

    return this.withAuthHeaders((headers) =>
      this.http.get<Anime[]>(`${this.baseUrl}/users/@me/missing-titles`, { headers, params }),
    );
  }

  getPrincipalInfo(): Observable<PrincipalInfo> {
    const url = `${this.baseUrl}/users/@me`;
    return this.withAuthHeaders((headers) => this.http.get<PrincipalInfo>(url, { headers }));
  }

  logout(): void {
    void chrome.storage.local
      .remove(['malToken', 'malRefreshToken'])
      .then(() => globalThis.location.reload());
  }

  private withAuthHeaders<T>(requestFn: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    return this.getToken$().pipe(
      switchMap((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return requestFn(headers).pipe(
          catchError((err) => {
            if (err.status === 401) {
              return this.refreshToken$().pipe(
                switchMap((newToken) => {
                  const newHeaders = new HttpHeaders({
                    Authorization: `Bearer ${newToken}`,
                  });
                  return requestFn(newHeaders);
                }),
              );
            }
            throw err;
          }),
        );
      }),
    );
  }

  private getToken$(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        chrome.storage.local.get(['malToken'], (result) => {
          const token = result['malToken'];

          if (typeof token === 'string' && token.length > 0) {
            resolve(token);
          } else {
            reject(new Error('No MAL token found'));
          }
        });
      }),
    );
  }

  private refreshToken$(): Observable<string> {
    return from(
      new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage({ type: 'REFRESH_MAL_TOKEN' }, (response) => {
          if (response?.success) {
            resolve(response.accessToken);
          } else {
            reject(new Error('Failed to refresh token'));
          }
        });
      }),
    );
  }
}

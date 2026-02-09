import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime, UserInfo } from '../spec/mal.info';

@Injectable({
  providedIn: 'root',
})
export class MalService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api';

  findUserAnimeList(): Observable<Anime[]> {
    const url = `${this.baseUrl}/users/@me/anime-list`;
    return this.http.get<Anime[]>(url);
  }

  getUserInfo(): Observable<UserInfo> {
    const url = `${this.baseUrl}/users/@me`;
    return this.http.get<UserInfo>(url);
  }
}

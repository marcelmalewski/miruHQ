import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../environment';

export interface Anime {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'https://api.myanimelist.net/v2/anime';
  private readonly fields = 'id,title,main_picture,start_date,status,my_list_status,num_episodes';

  get(animeId: string): Observable<Anime> {
    const url = `${this.baseUrl}/${encodeURIComponent(animeId)}`;
    const headers = new HttpHeaders({ 'X-MAL-CLIENT-ID': environment.malClientId });
    const params = new HttpParams().set('fields', this.fields);

    return this.http.get<Anime>(url, { headers, params });
  }
}

import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AnimeService {
  private readonly http = Inject(HttpClient);

  private readonly baseUrl = 'https://api.myanimelist.net/v2/anime';
  private readonly fields =
    'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics';

  getAnime(animeId: string, token: string): Observable<any> {
    return of(null);
    // const url = `${this.baseUrl}/${encodeURIComponent(animeId)}`;
    // const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // const params = new HttpParams().set('fields', this.fields);
    //
    // return this.http
    //   .get<any>(url, { headers, params })
    //   .pipe(catchError((err) => throwError(() => err)));
  }
}

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AnimeService } from '../../services/anime.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly animeService = inject(AnimeService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.animeService
      .get('59978')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        console.log(result);
      });
  }
}

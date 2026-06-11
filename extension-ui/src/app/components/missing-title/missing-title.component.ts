import { Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Anime } from '../../spec/mal-spec';
import { AnimeTileService } from '../../services/anime-tile.service';

@Component({
  selector: 'missing-title',
  templateUrl: './missing-title.component.html',
  imports: [NgOptimizedImage],
})
export class MissingTitleComponent {
  readonly anime = input.required<Anime>();

  readonly isAtBottom = signal(false);

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;

    this.isAtBottom.set(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
  }

  protected readonly AnimeTileService = AnimeTileService;
}

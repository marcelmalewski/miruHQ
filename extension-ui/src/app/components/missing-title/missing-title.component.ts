import { AfterViewInit, Component, ElementRef, ViewChild, input, signal } from '@angular/core';
import { Anime } from '../../spec/mal-spec';
import { AnimeTileService } from '../../services/anime-tile.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'missing-title',
  templateUrl: './missing-title.component.html',
  imports: [NgOptimizedImage],
})
export class MissingTitleComponent implements AfterViewInit {
  readonly anime = input.required<Anime>();
  readonly scrollIsAtBottom = signal(false);

  @ViewChild('scrollContainer')
  private readonly scrollContainer?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const element = this.scrollContainer?.nativeElement;
    if (element) {
      this.updateScrollState(element);
    }
  }

  onScroll(event: Event): void {
    this.updateScrollState(event.target as HTMLElement);
  }

  private updateScrollState(element: HTMLElement): void {
    this.scrollIsAtBottom.set(
      element.scrollHeight <= element.clientHeight ||
        element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
    );
  }

  protected readonly AnimeTileService = AnimeTileService;
}

import { Directive, ElementRef, HostListener, inject, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  readonly clickOutside = output<void>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}

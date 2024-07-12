import { Directive, HostListener, ElementRef } from '@angular/core';
import { isNumber } from 'lodash';

@Directive({
  selector: '[ZeroFallback]',
  standalone: true
})
export class ZeroFallbackDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const inputElement = this.el.nativeElement;
    const inputValue = inputElement.value;

    if (inputValue === '') {
      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement;
    if (event.key === 'Backspace' && inputElement.value === '0') {
      event.preventDefault();
    }
  }
}

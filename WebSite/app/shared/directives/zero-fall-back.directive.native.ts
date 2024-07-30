import { Directive, HostListener, ElementRef, input } from '@angular/core';
import { isNaN } from 'lodash';

@Directive({
  selector: '[zeroFallback]',
  standalone: true
})
export class ZeroFallbackDirective {

  constructor(private el: ElementRef<HTMLInputElement>) { }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const inputElement = this.el.nativeElement;
    const inputValue = inputElement.value;

    if (inputValue === '') {
      inputElement.value = '0';
      inputElement.dispatchEvent(new Event('input'));
    }

    if (inputElement.value.length > 1 && inputElement.value.startsWith('0')) {
      inputElement.value = (Number(inputElement.value)).toString();
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

import { Directive, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
    selector: '[ngModel][myFocus]',
    providers: [NgModel],
})
export class FocusDirective {
    constructor(
        private readonly el: ElementRef<HTMLInputElement>,
        private readonly model: NgModel) {
    }

    @HostListener('focus')
    public focus() {
        if (this.el.nativeElement.value.length > 0) {
            this.el.nativeElement.select();
        }
    }
}
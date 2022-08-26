import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[integerAndNone]'
})
export class IntegerAndNoneDirective {
    private noneCounter = 0;
    private readonly navigationKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'Home',
        'End',
        'ArrowLeft',
        'ArrowRight',
        'Clear',
        'Copy',
        'Paste'
    ];
    inputElement: HTMLElement;

    constructor(public el: ElementRef) {
        this.inputElement = el.nativeElement;
    }

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
        if (
            this.navigationKeys.indexOf(e.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
            this.isControlKey(e) ||
            this.isMetaKey(e) || this.isNoneKey(e)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if (e.key === ' '|| this.noneCounter > 0 || (isNaN(Number(e.key)) && e.key.toLowerCase() !== 'n')) {
            e.preventDefault();
        }
    }

    isControlKey(e: KeyboardEvent) {
        return (e.key === 'a' && e.ctrlKey === true) || // Allow: Ctrl+A
            (e.key === 'c' && e.ctrlKey === true) || // Allow: Ctrl+C
            (e.key === 'v' && e.ctrlKey === true) || // Allow: Ctrl+V
            (e.key === 'x' && e.ctrlKey === true); // Allow: Ctrl+X
    }

    isMetaKey(e: KeyboardEvent) {
        return (e.key === 'a' && e.metaKey === true) || // Allow: Cmd+A (Mac)
            (e.key === 'c' && e.metaKey === true) || // Allow: Cmd+C (Mac)
            (e.key === 'v' && e.metaKey === true) || // Allow: Cmd+V (Mac)
            (e.key === 'x' && e.metaKey === true); // Allow: Cmd+X (Mac)
    }

    isNoneKey(e: KeyboardEvent) {
        return e.key.toLowerCase() === 'n' && this.noneCounter < 1; // Allow: only one decimal point
    }

    @HostListener('keyup', ['$event']) onKeyUp(e: KeyboardEvent) {
        this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
        this.noneCounter = (this.el.nativeElement.value.match(/N/g) || []).length;
        if (this.el.nativeElement.value.lastIndexOf('N') !== 0) {
            this.el.nativeElement.value = this.el.nativeElement.value.replace(/N/g, '');
        }
    }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData.getData('text/plain');

        document.execCommand(
            'insertText',
            false,
            pastedInput.replace(/[^0-9]/g, '')
        );
    }

    @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
        event.preventDefault();
        const textData = event.dataTransfer.getData('text');
        this.inputElement.focus();

        document.execCommand(
            'insertText',
            false,
            textData.replace(/[^0-9]/g, '')
        );
    }
}
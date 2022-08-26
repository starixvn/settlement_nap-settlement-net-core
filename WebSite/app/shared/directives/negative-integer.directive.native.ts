import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[negativeInteger]'
})
export class NegativeDirective {
    private minusCounter = 0;
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
            this.isMetaKey(e) || this.isNegative(e)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if (e.key === ' ' || isNaN(Number(e.key))) {
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

    isNegative(e: KeyboardEvent) {
        return e.key === '-' && this.minusCounter < 1; // Allow: only one minus sign
    }

    @HostListener('keyup', ['$event']) onKeyUp(e: KeyboardEvent) {
        this.minusCounter = (this.el.nativeElement.value.match(/-/g) || []).length;
        if (this.el.nativeElement.value.lastIndexOf('-') !== 0) {
            this.el.nativeElement.value = this.el.nativeElement.value.replace(/-/g, '');
        }
    }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData.getData('text/plain');

        if(pastedInput.includes('-') && this.isValidNegative(pastedInput)) {
            document.execCommand(
                'insertText',
                false,
                pastedInput.replace(/[^0-9-]/g, '')
            );
        } else {
            document.execCommand(
                'insertText',
                false,
                pastedInput.replace(/[^0-9]/g, '')
            );
        }
    }

    @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
        event.preventDefault();
        const textData = event.dataTransfer.getData('text');
        this.inputElement.focus();

        if (textData.includes('-') && this.isValidNegative(textData)) {
            document.execCommand(
                'insertText',
                false,
                textData.replace(/[^0-9-]/g, '')
            );
        } else {
            document.execCommand(
                'insertText',
                false,
                textData.replace(/[^0-9]/g, '')
            );
        }
    }

    isValidNegative(input: string): boolean {
        return (input.match(/-/g) || []).length === 1 && input.indexOf('-') < input.search(/\d/);
    }
}
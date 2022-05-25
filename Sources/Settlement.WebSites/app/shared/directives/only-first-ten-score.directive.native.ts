import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[myOnlyFirstTenCombo]'
})
export class OnlyFirstTenScoreDirective {
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
    private readonly allowedCharacters = ['s', 'S', 'm', 'M', 'n', 'N'];
    @Input() decimal ? = false;
    inputElement: HTMLElement;

    constructor(public el: ElementRef) {
        this.inputElement = el.nativeElement;
    }

    @HostListener('keydown', ['$event']) onKeyDown(e: KeyboardEvent) {
        if (
            this.navigationKeys.indexOf(e.key) > -1 || // Allow: navigation keys: backspace, delete, arrows etc.
            this.isControlKey(e) ||
            this.isMetaKey(e)) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is a number and stop the keypress
        if (e.key === ' ' || !this.isAllowedKey(e)) {
            e.preventDefault();
        }

        if (this.isAllowedKey(e)) {
            e.preventDefault();
            document.execCommand('insertText', false, e.key.toUpperCase());
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

    isAllowedKey(e: KeyboardEvent) {
        return this.allowedCharacters.indexOf(e.key) >= 0;
    }

    getAllowedKeysOnly(input: string) {
        let result = '';
        for (let i = 0; i < input.length; i++) {
            if (this.allowedCharacters.indexOf(input.charAt(i)) >= 0 ) {
                result += input.charAt(i);
            }
        }

        return result.toUpperCase();
    }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData.getData('text/plain');
        document.execCommand(
            'insertText',
            false,
            this.getAllowedKeysOnly(pastedInput)
        );
    }

    @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
        event.preventDefault();
        const textData = event.dataTransfer.getData('text');
        this.inputElement.focus();
        document.execCommand(
            'insertText',
            false,
            this.getAllowedKeysOnly(textData)
        );
    }
}
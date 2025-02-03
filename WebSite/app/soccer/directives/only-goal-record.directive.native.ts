import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[myOnlyGoalRecord]',
    standalone: true
})
export class OnlyGoalRecordDirective {
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
    private readonly allowedCharacters = ['h', 'H', 'a', 'A', ';'];
    @Input() decimal ? = false;
    inputElement: HTMLInputElement;

    constructor(public el: ElementRef) {
        this.inputElement = el.nativeElement as HTMLInputElement;
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
            this.inputKey(e);
        }
    }

    inputKey(e: KeyboardEvent) {
        if (this.inputElement.value.includes(';') && e.key === ';') {
            e.preventDefault();
        } else {
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
        let semicolonAmount = 0;
        for (let i = 0; i < input.length; i++) {
            const item = input.charAt(i);
            if (this.allowedCharacters.indexOf(item) >= 0) {
                if (item === ';') {
                    result += semicolonAmount === 0 ? item : '';
                    semicolonAmount++;
                } else {
                    result += item;
                }
            }

        }

        return result.toUpperCase();
    }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
        event.preventDefault();
        let pastedInput: string = event.clipboardData.getData('text/plain');
        if (this.inputElement.value.includes(';')) {
            pastedInput = pastedInput.split(';').join();
        }

        document.execCommand(
            'insertText',
            false,
            this.getAllowedKeysOnly(pastedInput)
        );
    }

    @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
        event.preventDefault();
        let textData = event.dataTransfer.getData('text');
        if (this.inputElement.value.includes(';')) {
            textData = textData.split(';').join();
        }

        this.inputElement.focus();
        document.execCommand(
            'insertText',
            false,
            this.getAllowedKeysOnly(textData)
        );
    }
}
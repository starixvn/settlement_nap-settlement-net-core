import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-date-picker',
    templateUrl: './date-picker.component.html',
    standalone: true,
    host: {
        '(document:click)': 'onClick($event)',
    },
    imports: [NgbModule, FormsModule]
})
export class DatepickerComponent {
    @Input() public date: NgbDateStruct;
    @Input() public minDate: NgbDateStruct;
    @Input() public maxDate: NgbDateStruct;
    @Input() public disabled: boolean;
    @Output() private readonly change = new EventEmitter();
    private dynamicId;
    private readonly elementRef: ElementRef<HTMLElement>;
    constructor(elementRef: ElementRef<HTMLElement>) {
        this.elementRef = elementRef;
    }

    public onSelectDate(value: NgbDateStruct) {
        if (value != null) {
            this.change.emit(value);
        }
    }

    public openDatepicker(id) {
        this.dynamicId = id;

    }

    public onClick(event) {
        if (this.dynamicId !== undefined && !this.elementRef.nativeElement.contains(event.target)) {
            const timeOut = 10;
            setTimeout(() => {
                this.dynamicId.close();
            }, timeOut);
        }
    }
}
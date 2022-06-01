import { Component, ElementRef, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-date-picker',
    templateUrl: './date-picker.component.html',
    host: {
        '(document:click)': 'onClick($event)',
    },
})
export class DatepickerComponent {
    @Input() private readonly date: NgbDateStruct;
    @Output() private readonly change = new EventEmitter();
    private dynamicId;
    private readonly elementRef: ElementRef<HTMLElement>;
    private readonly ngbDateParserFormatter: NgbDateParserFormatter;
    constructor(elementRef: ElementRef<HTMLElement>, ngbDateParserFormatter: NgbDateParserFormatter) {
        this.elementRef = elementRef;
        this.ngbDateParserFormatter = ngbDateParserFormatter;
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
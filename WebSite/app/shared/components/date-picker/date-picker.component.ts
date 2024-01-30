import { Component, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-date-picker',
    templateUrl: './date-picker.component.html',
    standalone: true,
    imports: [NgbModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent {
    @Input() public date: NgbDateStruct;
    @Input() public minDate: NgbDateStruct;
    @Input() public maxDate: NgbDateStruct;
    @Input() public disabled: boolean;
    @Output() private readonly change = new EventEmitter();

    public onSelectDate(value: NgbDateStruct) {
        if (value != null) {
            this.change.emit(value);
        }
    }
}
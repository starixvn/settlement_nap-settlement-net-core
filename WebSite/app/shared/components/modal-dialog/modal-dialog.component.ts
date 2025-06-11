import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ng-modal-content',
    templateUrl: './modal-dialog.component.html',
    standalone: true,
    imports: [FormsModule, CommonModule],
    styleUrls: ['./model-dialog.component.css']
})
export class ModalDialogComponent {
    @Input() readonly title = 'Title';
    @Input() readonly message = 'Message';
    @Input() readonly yes = 'Yes';
    @Input() readonly no = 'No';
    @Input() readonly hideNo = false;
    @Input() checkboxLabel = '';
    @Input() requireCheckbox = false;

    isChecked = false;

    constructor(public activeModal: NgbActiveModal) { }
}
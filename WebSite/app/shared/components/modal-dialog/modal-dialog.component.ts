import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ng-modal-content',
    templateUrl: './modal-dialog.component.html'    
})
export class ModalDialogComponent {
    @Input() readonly title = 'Title';
    @Input() readonly message = 'Message';
    @Input() readonly yes = 'Yes';
    @Input() readonly no = 'No';
    @Input() readonly hideNo = false;

    constructor(public activeModal: NgbActiveModal) { }
}
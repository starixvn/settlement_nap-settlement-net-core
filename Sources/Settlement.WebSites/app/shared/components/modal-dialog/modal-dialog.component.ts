import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ng-modal-content',
    templateUrl: './modal-dialog.component.html'
})
export class ModalDialogComponent {
    @Input() private readonly title = 'Title';
    @Input() private readonly message = 'Message';
    @Input() private readonly yes = 'Yes';
    @Input() private readonly no = 'No';
    @Input() private readonly hideNo = false;

    constructor(public activeModal: NgbActiveModal) { }
}
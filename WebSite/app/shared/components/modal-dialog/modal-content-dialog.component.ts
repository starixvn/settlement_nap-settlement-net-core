import { Component, Input, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'ng-modal-content-dialog',
    templateUrl: './modal-content-dialog.component.html',
    standalone: true,
    imports: [NgTemplateOutlet]
})
export class ModalContentDialogComponent {
    @Input() readonly title = 'Title';
    @Input() readonly template: TemplateRef<string>;

    constructor(public activeModal: NgbActiveModal) { }
}
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogComponent } from '../components';
import { ModalDialogMessage } from '../models';
@Injectable()
export class MessageBoxService {
    constructor(private readonly modalService: NgbModal) {
    }

    public alert(dialogModel: ModalDialogMessage) {
        const modal = this.modalService.open(ModalDialogComponent);
        modal.componentInstance.title = dialogModel.title;
        modal.componentInstance.message = dialogModel.message;
        modal.componentInstance.yes = 'Ok';
        modal.componentInstance.hideNo = true;
    }

    public confirm(dialogModel: ModalDialogMessage, func: () => void, rejectedFunc: () => void = null) {
        const modal = this.modalService.open(ModalDialogComponent);
        modal.componentInstance.title = dialogModel.title;
        modal.componentInstance.message = dialogModel.message;
        modal.componentInstance.hideNo = dialogModel.hideNo;
        modal.result.then((response) => {
            return;
        }, (reason: string) => {
            if (reason === 'Yes') {
                func();
            } else if (dialogModel.hasActionOnNoBtn && reason === 'No' && rejectedFunc !== null) {
                rejectedFunc();
            }
        });
    }

    public closePopup() {
        const buttonClose = parent.document.getElementById('close-after-change');
        if (buttonClose !== null) {
            buttonClose.click();
        }
    }
}
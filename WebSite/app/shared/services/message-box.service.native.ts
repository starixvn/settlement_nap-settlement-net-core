import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDialogComponent } from '../components/modal-dialog/modal-dialog.component';
import { ModalDialogMessage } from '../models';
@Injectable({
    providedIn: 'root'
})
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

    public confirm(dialogModel: ModalDialogMessage, func: (checked?: boolean) => void, rejectedFunc: () => void = null) {
        const modal = this.modalService.open(ModalDialogComponent);
        modal.componentInstance.title = dialogModel.title;
        modal.componentInstance.message = dialogModel.message;
        modal.componentInstance.hideNo = dialogModel.hideNo;
        modal.componentInstance.requireCheckbox = dialogModel.requireCheckbox;
        modal.componentInstance.checkboxLabel = dialogModel.checkboxLabel;
        modal.result.then((response) => {
            return;
        }, (reason: string) => {
            if (reason === 'Yes') {
                const isChecked = dialogModel.requireCheckbox ? modal.componentInstance.isChecked : undefined;
                func(isChecked);
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

    public closePopupNotChanged(){
        const buttonClose = parent.document.getElementById('close-not-change');
        if (buttonClose !== null) {
            buttonClose.click();
        }
    }
}
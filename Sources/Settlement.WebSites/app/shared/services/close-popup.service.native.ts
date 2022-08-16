import { Injectable } from '@angular/core';
@Injectable()
export class ClosePopupService {
    public closePopup() {
        const buttonClose = parent.document.getElementById('close-after-change');
        if (buttonClose !== null) {
            buttonClose.click();
        }
    }
}
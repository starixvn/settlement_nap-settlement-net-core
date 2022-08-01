import { Injectable } from '@angular/core';
@Injectable()
export class ClosePopupService {
    private readonly mainPage = 'Sportsbook';
    private readonly dialog = 'DialogBox';
    public closePopup(matchId: number) {
        const buttonClose = parent.document.getElementById('close-after-change');
        if (buttonClose !== null) {
            buttonClose.click();
        }

        if(window.parent != null && window.parent[this.mainPage] != null) {
            window.parent[this.mainPage].handleChangedSingleMatch([matchId], false);
            window.parent[this.dialog].closePopup();
        }
    }

    public angularClosePopup() {
        const buttonClose = parent.document.getElementById('close-after-change');
        if (buttonClose !== null) {
            buttonClose.click();
        }
    }

    public closePopupChangeRemarkSetting(matchId: string, isMTDHold: boolean,
        isUndecided: boolean, isPending: boolean, isUnderSettle: boolean, isKeyHold: boolean, eventStatus: string) {
        window.parent[this.mainPage].refreshRemarkStatus(matchId, isMTDHold, isUndecided, isPending, isUnderSettle, isKeyHold, eventStatus);
    }

    public closePopupOnly(){
        const buttonClose = parent.document.getElementById('close-not-change');
        if (buttonClose !== null) {
            buttonClose.click();
        } else {
            window.parent[this.dialog].closePopup();
        }
    }
}
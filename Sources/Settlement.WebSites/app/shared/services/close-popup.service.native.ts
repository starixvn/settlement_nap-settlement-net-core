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

    public closePopupInstant(leagueId: number, time: number, type: string) {
        window.parent[this.mainPage].instantShowNewTimeSetting(leagueId, time, type);
        window.parent[this.dialog].closePopup();
    }

    public closePopupPayoutSettingMatch(matchId: number, newState: number) {
        window.parent[this.mainPage].refreshPayoutSettingMatch(matchId, newState);
        window.parent[this.dialog].closePopup();
    }

    public closePopupPayoutSettingLeague(leagueId: number, newState: number, isApplyAll: boolean) {
        window.parent[this.mainPage].refreshPayoutSettingLeague(leagueId, newState, isApplyAll);
        window.parent[this.dialog].closePopup();
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
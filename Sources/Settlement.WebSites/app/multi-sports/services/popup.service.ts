import { Injectable } from '@angular/core';
import { MultiSport, PopupProperties } from './../models';
import { DialogBoxService } from './../../shared/services';
import { DialogDataIframe, Match, SportMatch } from './../../shared/models';
import { Language } from './../../shared/language';
import { EventStatus } from './../constants';
import { HandleActionsService } from './handle-actions.service';
import { MultiSportService } from './multi-sport.service';
import * as _ from 'lodash';
import { CalculationStatus, SportType } from '../../shared/constants';

@Injectable()

export class PopupService {
    private readonly generalWidthPopup = '845px';
    private readonly generalHeightPopup = '715px';
    private readonly listNewSport = [SportType.tennis, SportType.badminton, SportType.eSports, SportType.basketBall, SportType.cricket, SportType.volleyBall];
    public properties = new PopupProperties();
    constructor(private readonly dialogBoxService: DialogBoxService,
        private readonly handleActionsService: HandleActionsService,
        private readonly multiSportService: MultiSportService) {
    }
    public popupLog(matchCode: string, fromDate: string, toDate: string) {
        const src = `home/log?matchCode=${encodeURIComponent(matchCode)}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
        const dialogData = new DialogDataIframe(Language.SettlementLog, src);
        this.dialogBoxService.popup(dialogData, '1011px', '800px');
    }

    public popupCalc(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        this.properties.title = Language.CalcPopupTitle;
        this.setPopupSize(match.sportType);

        if (this.listNewSport.includes(match.sportType)) {
            let sportName = sports.find(item => item.id === match.sportType).name.toLowerCase();
            sportName = _.isEqual(sportName, 'volleyball') ? 'badminton' : sportName;
            this.properties.src = `apps/${sportName}-recalculate?matchId=${match.matchId}&sportType=${match.sportType}`;
        } else {
            this.properties.src = `apps/sportsbook/other-sports/calculation?matchId=${match.matchId}&sportType=${match.sportType}`;
        }

        this.openAndHandlePopup(this.properties, match, sports, multiSport);
    }


    public popupRefund(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        this.properties.title = Language.RefundPopupTitle;
        this.setPopupRefundSize(match.sportType);

        if (_.includes(this.listNewSport, match.sportType)) {
            let sportName = sports.find(item => item.id === match.sportType).name.toLowerCase();
            sportName = _.isEqual(sportName, 'volleyball') ? 'badminton' : sportName;
            this.properties.src = `apps/${sportName}-refund?matchId=${match.matchId}&sportType=${match.sportType}`;
        } else {
            this.properties.src = `apps/sportsbook/other-sports/refund?matchId=${match.matchId}&sportType=${match.sportType}`;
        }

        this.openAndHandlePopup(this.properties, match, sports, multiSport);
    }

    public popupEarly(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        this.properties.title = Language.EarlyPopupTitle;
        let sportName = sports.find(item => item.id === match.sportType).name.toLowerCase();
        sportName = _.isEqual(sportName, 'volleyball') ? 'badminton' : sportName;
        this.properties.src = `apps/sportsbook/${sportName}-early?matchId=${match.matchId}&sportType=${match.sportType}`;
        this.properties.width = match.sportType === SportType.cricket ? '1400px' :
            this.isPopupEarlySOP(match.sportType) ? '1480px' : '845px';
        this.properties.height = this.isPopupEarlySOP(match.sportType) ? '958px' : '910px';
        this.openAndHandlePopup(this.properties, match, sports, multiSport);
    }

    private isPopupEarlySOP(sportType: number) {
        return _.includes([SportType.eSports, SportType.basketBall, SportType.badminton,
            SportType.cricket, SportType.volleyBall], sportType);
    }

    public popupChangeRemark(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        this.properties.title = Language.remarkSettingTitle;
        this.properties.src = `apps/remark-setting?matchId=${match.matchId}&matchCode=${match.matchCode}`;
        this.properties.width = '500px';
        this.properties.height = '270px';
        const frameSrc = encodeURI(this.properties.src);
        const dialogData = new DialogDataIframe(this.properties.title, frameSrc);
        this.dialogBoxService.popup(dialogData, this.properties.width, this.properties.height).subscribe(() => {
            this.multiSportService.getRemarkInfo(match.matchId).subscribe((settingResult) => {
                this.handleActionsService.handleChangeRemarkSetting(settingResult, match, sports, multiSport);
            });
        });
    }

    public openAndHandlePopup(properties: PopupProperties, match: Match, sports: SportMatch[], multiSport: MultiSport) {
        const frameSrc = encodeURI(properties.src);
        const dialogData = new DialogDataIframe(properties.title, frameSrc);
        this.dialogBoxService.popup(dialogData, properties.width, properties.height).subscribe(result => {
            if (result) {
                this.handleChangedMatch(match, sports, multiSport);
            }
        });
    }

    public handleChangedMatch(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        match.isCalculatingSingle = CalculationStatus.waiting;
        match.showLink = false;
        match.newEventStatus = EventStatus.waiting;
        match.isCheckedCalcMP = false;
        match.mixParlay.hasMixParlay = this.handleActionsService.getMixParlayStatus(match);
        this.handleActionsService.resetCheckboxCalcMixParlay(match, sports, multiSport);
    }

    private setPopupSize(sportType: number) {
        const groupOne = [SportType.badminton, SportType.basketBall, SportType.eSports];
        const groupTwo = [SportType.beachVolleyball, SportType.volleyBall];
        if (_.includes(groupOne, sportType)) {
            this.properties.width = '1005px';
            this.properties.height = "730px";
        } else if (_.includes(groupTwo, sportType)) {
            this.properties.width = '900px';
            this.properties.height = "820px";
        } else if (sportType === SportType.cricket) {
            this.properties.width = '1018px';
            this.properties.height = "640px";
        } else if (sportType === SportType.tennis) {
            this.properties.width = this.generalWidthPopup;
            this.properties.height = this.generalHeightPopup;
        } else {
            this.properties.width = '820px';
            this.properties.height = '500px';
        }
    }

    private setPopupRefundSize(sportType: number) {
        const sportsSameSize = [SportType.badminton, SportType.basketBall, SportType.tennis];
        if (_.includes(sportsSameSize, sportType)) {
            this.properties.width = this.generalWidthPopup;
            this.properties.height = this.generalHeightPopup;
        } else if(_.isEqual(sportType, SportType.eSports)){
            this.properties.width = '920px';
            this.properties.height = '600px';
        } else {
            this.properties.width = '780px';
            this.properties.height = '600px';
        }
    }
}

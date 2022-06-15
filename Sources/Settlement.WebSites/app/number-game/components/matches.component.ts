import { Component, Input, Output, OnChanges, EventEmitter } from "@angular/core";
import * as _ from 'lodash';
import { NumberGame, Permission, Leagues, MatchDetail, ReCalculationModel } from '../models';
import { MatchStatus } from '../../shared/constants';
import { PopupService } from '../services/popup.service';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html',
})

export class MatchesComponent implements OnChanges {
    @Input() public numberGame: NumberGame;
    @Input() public fromDate: string;
    @Input() public toDate: string;
    @Output() public readonly reloadMainPage = new EventEmitter();
    public match: MatchDetail;
    public pageType: string;
    public leagues: Leagues[];
    public permission: Permission;

    constructor(private readonly popupService: PopupService) {
    }

    public ngOnChanges() {
        this.leagues = this.numberGame.leagues;
        this.permission = this.numberGame.permission;
    }

    public isRecalculate(isYesterdayMatch: boolean) {
        return (isYesterdayMatch && this.permission.canCalculate) || this.permission.canItAdmin;
    }

    public getBackground(eventStatus: string) {
        return this.isCompletedMatch(eventStatus)
            ? "bg-calculated"
            : this.isRefundMatch(eventStatus) ? "bg-refund" : "";
    }

    private isCompletedMatch(eventStatus: string) {
        return _.isEqual(eventStatus.toLowerCase(), MatchStatus.Completed);
    }

    private isRefundMatch(eventStatus: string) {
        return _.isEqual(eventStatus.toLowerCase(), MatchStatus.Refund);
    }

    public openLog(matchId: number) {
        this.popupService.popupLog(matchId, this.fromDate, this.toDate);
    }

    public openReCalc(match: MatchDetail) {
        const model = new ReCalculationModel(match);
        this.popupService.popupReCalc(model);
    }
}
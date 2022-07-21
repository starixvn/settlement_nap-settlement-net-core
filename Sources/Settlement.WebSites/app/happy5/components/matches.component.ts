import { Component, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import * as _ from 'lodash';
import { HappyFive, PopupModel, Permission, Leagues, MatchDetail, Ball } from '../models';
import { RedBall } from '../constants';
import { MatchStatus } from '../../shared/constants';
import { PopupService, BallService } from '../services';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html',
})

export class MatchesComponent implements OnChanges  {
    @Input() public happyFive: HappyFive;
    @Input() public fromDate: string;
    @Input() public toDate: string;
    @Output() public readonly reloadMainPage = new EventEmitter();
    public match: MatchDetail;
    public pageType: string;
    public leagues: Leagues[];
    public permission: Permission;

    constructor(
        private readonly popupService: PopupService,
        private readonly ballService: BallService) {
    }

    public ngOnChanges() {
        this.leagues = this.happyFive.leagues;
        this.permission = this.happyFive.permission;
        this.generateTotalValue(this.leagues);
    }

    private generateTotalValue(leagues: Leagues[]) {
        leagues.forEach((league) => {
            league.matches.forEach((match) =>{
                this.ballService.resetValueOnCurrentMatch(match);
            });
        });
    }

    public openLog(matchId: number) {
        this.popupService.popupLog(matchId, this.fromDate, this.toDate);
    }

    public openReCalc(match: MatchDetail) {
        const model = new PopupModel(match);
        this.popupService.popupReCalc(model);
    }

    public openRefund(match: MatchDetail) {
        const model = new PopupModel(match);
        this.popupService.popupRefund(model);
    }

    public isRecalculate(isYesterdayMatch: boolean) {
        return (isYesterdayMatch && this.permission.canCalculate) || this.permission.canItAdmin;
    }

    public isRefund(isYesterdayMatch: boolean) {
        return (isYesterdayMatch && this.permission.canRefund) || this.permission.canItAdmin;
    }

    public getColorBall(ball: Ball) {
        return _.includes(RedBall, Number(ball.numberBall)) ? "red" : "blue";
    }

    public getBackground(eventStatus: string) {
        return this.isCompletedMatch(eventStatus)
            ? "bg-calculated"
            : this.isRefundMatch(eventStatus) ? "bg-refund" : "";
    }

    public isCompletedMatch(eventStatus: string) {
        return _.isEqual(eventStatus.toLowerCase(), MatchStatus.Completed);
    }

    private isRefundMatch(eventStatus: string) {
        return _.isEqual(eventStatus.toLowerCase(), MatchStatus.Refund);
    }
}
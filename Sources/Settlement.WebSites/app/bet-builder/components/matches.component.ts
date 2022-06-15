import * as _ from 'lodash';
import { interval } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
import { Component, OnInit, OnDestroy} from "@angular/core";
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MultiSports, MatchDetail, SportLeagues, LeagueMatches, Template } from '../models';
import { LeagueSettingService, MatchSettingService, RefreshMatchService, PopupService } from '../services';
import { Resources, BackgroundColor, EventStatus } from '../constants';
import { MatchStatus } from '../../shared/constants';
import { ModalDialogMessage } from '../../shared/models';
import { MessageBoxService } from '../../shared/services';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html'
})

export class MatchesComponent implements Template, OnInit, OnDestroy {
    private readonly period = 5000;
    private subscriber: ISubscription;
    public multiSports: MultiSports;
    public readonly leagueMatch: LeagueMatches[];
    public readonly modalDialogMessage = new ModalDialogMessage();
    public matchId: number;
    public modalRef: NgbModalRef;
    public intervalTimer = interval(this.period);
    public apiUrl: string;
    constructor(
        private readonly messageBoxService: MessageBoxService,
        private readonly leagueSettingService: LeagueSettingService,
        private readonly matchSettingService: MatchSettingService,
        private readonly refreshMatchService: RefreshMatchService,
        private readonly popupService: PopupService) {
    }

    getNewApi(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    public ngOnInit() {
        this.modalDialogMessage.title = "Update Auto Setting";
        this.refreshMatches();
    }

    public ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }

    public get isExistedSport(): boolean | undefined {
        return this.multiSports.sportLeagues && this.multiSports.sportLeagues.length > 0;
    }

    public collapseLeague(league: LeagueMatches) {
        league.collapse = !league.collapse;
    }

    public collapseSport(sport: SportLeagues) {
        sport.collapse = !sport.collapse;
    }

    private refreshMatches() {
        this.subscriber = this.intervalTimer.subscribe(() => {
            if (this.multiSports && this.multiSports.sportLeagues.length > 0) {
                this.refreshMatchService.refreshMatches(this.multiSports.sportLeagues, this.multiSports.request);
            }
        });
    }
    public isProcessingMatch(parlayStatus: string) {
        return _.isEqual(parlayStatus, EventStatus.waiting) || _.isEqual(parlayStatus, EventStatus.calculating);
    }


    public isShowLinkCalculation(match: MatchDetail) {
        return !this.isProcessingMatch(match.parlayStatus) && match.isShowLink  ? BackgroundColor.codeLink : '';
    }

    public isShowAutoSettingLeague(match: MatchDetail) {
          if (match.isShowLink) {
            return match.autoCalcSetting.isAutoSettingForMatch ? BackgroundColor.iconYes : BackgroundColor.iconNo;
          } else {
            return match.autoCalcSetting.isAutoSettingForMatch ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
        }
      }

    public getColorParlayStatus(parlayStatus: string) {
        const colorName = _.isEqual(parlayStatus, EventStatus.waiting)
            ? BackgroundColor.waiting
            : _.isEqual(parlayStatus, EventStatus.calculating) ? BackgroundColor.calculating : "";
        return `event-status ${colorName}`;
    }

    public getBackground(parlayStatus: string, eventStatus: string) {
        return this.isCompletedMatchParlay(parlayStatus)
            ? BackgroundColor.calculated
            : this.isRunningMatchParlay(parlayStatus, eventStatus) ? BackgroundColor.autoSettleRunning : "";
    }

    public getClassNameViewLog() {
        return this.multiSports.permission.canViewSettlementLog ? BackgroundColor.codeLink : BackgroundColor.noLink;
    }

    private isCompletedMatchParlay(parlayStatus: string) {
        return _.isEqual(parlayStatus.toLowerCase(), MatchStatus.Completed);
    }

    private isRunningMatchParlay(parlayStatus: string, eventStatus: string) {
        return _.isEqual(parlayStatus.toLowerCase(), MatchStatus.Running)
            && _.isEqual(eventStatus.toLowerCase(), MatchStatus.Completed);
    }

    public getAutoSettingTooltip(isAuto: boolean) {
        return isAuto ? Resources.turnOffAutoSetting : Resources.turnOnAutoSetting;
    }

    public updateMatchSetting(match: MatchDetail) {
        if  (match.isShowLink) {
            this.modalDialogMessage.message = Resources.confirmUpdateAutoSettingMatch;
            this.messageBoxService.confirm(this.modalDialogMessage, () => {
            this.matchSettingService.updateMatch(match);
            });
        }
    }

    public updateLeagueSetting(league: LeagueMatches) {
        this.modalDialogMessage.message = this.leagueSettingService.getConfirmMessage(league.isAutoSettingForLeague);
        this.modalDialogMessage.hasActionOnNoBtn = true;
        this.messageBoxService.confirm(
            this.modalDialogMessage,
            () => this.leagueSettingService.updateLeague(league, true),
            () => this.leagueSettingService.updateLeague(league, false),
        );
    }

    public openPopupCalc(match: MatchDetail) {
      this.popupService.popupCalc(match, this.apiUrl);
    }

    public openPopupLog(match: MatchDetail) {
        this.popupService.popupLog(match.matchId, this.multiSports.request.fromDate, this.multiSports.request.toDate, this.apiUrl);
    }

    public getEventStatusColor(match: MatchDetail) {
        return  match.eventStatus === EventStatus.waiting ? BackgroundColor.waiting
              : match.eventStatus === EventStatus.calculating ? BackgroundColor.calculating
              : '';
    }

    public search(value: MultiSports) {
        this.multiSports = value;
    }
}
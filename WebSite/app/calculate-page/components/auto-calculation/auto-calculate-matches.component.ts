import { Component, inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService, HandleActionsService } from '../../services';
import * as _ from 'lodash';
import { MatchesBaseComponent } from '../base-component';
import { CalculationMatch, FilterAutoQuery, League, UpdateInstantQuery } from '../../models';
import { BackgroundColor, CalculationStatus } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import { MessageBoxService } from '../../../shared/services';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ModalDialogMessage, AutoSetting } from '../../../shared/models';
import { AutoSettingType, InstantStatus } from '../../constants';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynamicHeightDirective } from '../../../shared/directives/dynamic-height.directive.native';
import { CommonModule } from '@angular/common';
import { AutoCalculateService } from './auto-calculate.service';
import { AutoSettleSetting } from '../../models/auto-settle-settings';
import { UpdateSettingsService } from '../../services/update-settings.service';

@Component({
    selector: 'auto-calculate-matches',
    templateUrl: './auto-calculate-matches.component.html',
    standalone: true,
    imports: [CommonModule, DynamicHeightDirective, MatTooltipModule, NgbTooltip],
})
export class AutoCalculateMatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
    @Input() public filterQuery: FilterAutoQuery;
    @Input() public disableRefresh: boolean;
    private readonly dialogConfirmMessage = new ModalDialogMessage();
    private readonly dialogAlertMessage = new ModalDialogMessage();
    public instantStatus = InstantStatus;
    public language = Language;
    public instantCalcFt = 102;
    private readonly autoSettingInstantType = 2;
    private subscriber: ISubscription;
    private readonly period = 6000;
    private readonly intervalTimer = interval(this.period);
    private readonly autoCalculateService = inject(AutoCalculateService);
    private readonly updateSettingsService = inject(UpdateSettingsService);

    constructor(
        protected popupService: PopupService,
        protected requestService: RequestService,
        protected backGroundService: BackGroundService,
        private readonly messageBoxService: MessageBoxService,
        private readonly handleActionService: HandleActionsService) {
        super(popupService, requestService, backGroundService);
        this.dialogConfirmMessage.title = Language.confirmationBox;
        this.dialogAlertMessage.title = Language.warningTitle;
    }

    ngOnInit() {
        this.refreshMatches();
    }

    ngOnDestroy() {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }

    private refreshMatches() {
        this.subscriber = this.intervalTimer.subscribe(() => {
            if (!this.disableRefresh && this.leagues.length > 0) {
                this.requestService.refreshMatches(this.filterQuery.leagueId, this.leagues, true);
            }
        });
    }


    public getClassInstant(isInstant: boolean) {
        if (this.permission.canAutoPayout) {
            return isInstant ? BackgroundColor.iconOn : BackgroundColor.iconOff;
        } else {
            return isInstant ? BackgroundColor.iconOnDisabled : BackgroundColor.iconOffDisabled;
        }
    }

    public getClassPayOut(isAutoPayout: boolean, isDirectPayout: boolean) {
        if (this.permission.canAutoPayout) {
            return isAutoPayout ? BackgroundColor.iconAuto :
                isDirectPayout ? BackgroundColor.iconDirect : BackgroundColor.iconOff;
        } else {
            return isAutoPayout ? BackgroundColor.iconAutoDisabled :
                isDirectPayout ? BackgroundColor.iconDirectDisabled : BackgroundColor.iconOffDisabled;
        }
    }

    public getStatusAutoPayout(league: League, match: CalculationMatch | null = null) {
        return match
            ? this.autoCalculateService.getStatusAutoPayoutMatch(match)
            : this.autoCalculateService.getStatusAutoPayoutLeague(league);
    }

    public getTittleInstant(isInstant: boolean) {
        if (this.permission.canAutoPayout) {
            return isInstant ? Language.instants.titleOffInstant : Language.instants.titleOnInstant;
        }

        return "";
    }

    public updateInstant(match: CalculationMatch) {
        const isPermission = this.permission.canAutoPayout && this.notInQueue(match);
        if (isPermission) {
            this.dialogConfirmMessage.message = Language.instants.confirm;
            this.messageBoxService.confirm(this.dialogConfirmMessage, () => {
                this.doUpdateInstant(match);
            });
        }
    }

    private notInQueue(match: CalculationMatch) {
        return _.isNull(match.isCalculatingSingle) ||
            (!_.isEqual(match.isCalculatingSingle, CalculationStatus.waiting)
                && !_.isEqual(match.isCalculatingSingle, CalculationStatus.calculating))
    }

    private async doUpdateInstant(match: CalculationMatch) {
        const query = new AutoSettingMatchQuery(
            Number(match.matchId),
            AutoSettingType.instant,
            !match.autoCalcSetting.isInstantForMatch
        );
        const result = await this.requestService.updateSettingMatch(query);
        if (result.errCode === 0) {
            match.autoCalcSetting.isInstantForMatch = !match.autoCalcSetting.isInstantForMatch;

        } else {
            this.dialogAlertMessage.message = result.errMsg;
            this.messageBoxService.alert(this.dialogAlertMessage);
        }
    }

    public updateInstantForLeague(autoCalcSetting: AutoSetting, league: League) {
        this.dialogConfirmMessage.message = autoCalcSetting.isAutoPayoutForLeague ? Language.instants.confirmOffLeague : Language.instants.confirmOnLeague;
        this.dialogConfirmMessage.hasActionOnNoBtn = true;
        this.messageBoxService.confirm(this.dialogConfirmMessage, () => {
            this.doUpdateSettingLeague(autoCalcSetting, league, true);
        }, () => {
            this.doUpdateSettingLeague(autoCalcSetting, league, false);
        });
    }

    private async doUpdateSettingLeague(autoCalcSetting: AutoSetting, leagueMatch: League, isApplyAll: boolean) {
        this.dialogConfirmMessage.hasActionOnNoBtn = false;
        const query = new AutoSettingLeagueQuery(
            Number(leagueMatch.leagueId),
            this.autoSettingInstantType,
            !autoCalcSetting.isInstantForLeague,
            isApplyAll
        );
        const result = await this.requestService.updateSettingLeague(query);
        if (result.errCode === 0) {
            autoCalcSetting.isInstantForLeague = !autoCalcSetting.isInstantForLeague;
            if (isApplyAll) {
                this.handleActionService.handleAutoInstantForMatch(leagueMatch, autoCalcSetting.isInstantForLeague);
            }
        } else {
            this.dialogConfirmMessage.message = result.errMsg;
            this.messageBoxService.alert(this.dialogConfirmMessage);
        }
    }

    public getLog(matchId: string) {
        this.popupService.popupLog(matchId, this.filterQuery.fromDate, this.filterQuery.toDate);
    }

    public openUpdatePayout(match: CalculationMatch) {
        const isPermission = this.permission.canAutoPayout && this.notInQueue(match);
        if (isPermission) {
            this.popupService.openUpdatePayout(match);
        }
    }

    public openUpdatePayoutForLeague(league: League) {
        if (this.permission.canAutoPayout) {
            this.popupService.openUpdatePayoutForLeague(league);
        }
    }

    public openSoccerAutoSettings(league: League, match: CalculationMatch | null = null) {
        const { canAutoPayout } = this.permission;
        if (!canAutoPayout) {
            return;
        }
        this.popupService.openSoccerAutoSettings(league, match)
            .subscribe(result => {
                const setting = Object.assign(new AutoSettleSetting(), JSON.parse(result));
                if (match) {
                    this.updateSettingsService.setAutoCalcSettingMatch(match, setting);
                } else {
                    this.updateSettingsService.setAutoCalcSettingLeague(league, setting);
                }
            });
    }

    public openUpdateTime(league: League, isInstant: boolean) {
        if (this.permission.canAutoPayout) {
            this.popupService.openUpdateTime(league, isInstant);
        }
    }

    public getClassInstantStatus(match: CalculationMatch) {
        return _.isEqual(match.instantScoreDiff, 1) && match.autoCalcSetting.isInstantForMatch ? BackgroundColor.autoSettleRunning : "";
    }

    public getColorInstant(match: CalculationMatch) {
        return match.instantStatus.includes('LIVE') ? "live-red" : "";
    }

    public doUpdateInstantStatus(match: CalculationMatch) {
        const query = new UpdateInstantQuery(match)
        this.dialogConfirmMessage.message = Language.instants.confirmExecuteInstant;
        this.messageBoxService.confirm(this.dialogConfirmMessage, async () => {
            const resultPushScore = await this.requestService.pushInstantStatus(query);
            if (resultPushScore.errCode === 0) {
                this.handleActionService.handleChangeInstantStatus(match);
            } else {
                this.dialogAlertMessage.message = resultPushScore.errMsg;
                this.messageBoxService.alert(this.dialogAlertMessage);
            }
        });
    }

    public isNullOrEmpty(value: string) {
        return _.isNull(value) || _.isEmpty(value);
    }
}
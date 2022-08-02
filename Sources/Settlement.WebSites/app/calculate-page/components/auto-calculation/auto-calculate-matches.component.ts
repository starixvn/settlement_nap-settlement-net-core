import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService, HandleActionsService } from '../../services';
import * as _ from 'lodash';
import { MatchesBaseComponent } from '../base-component';
import { CalculationMatch, League, MatchGoalRecord, UpdateInstantQuery } from '../../models';
import { BackgroundColor } from '../../../shared/constants';
import { Language } from '../../../shared/language';
import { MessageBoxService } from '../../../shared/services';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, ModalDialogMessage } from '../../../shared/models';
import { AutoSettingType, InstantStatus } from '../../Constants';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';

@Component({
  selector: 'auto-calculate-matches',
  templateUrl: './auto-calculate-matches.component.html'
})
export class AutoCalculateMatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
  private readonly dialogConfirmMessage = new ModalDialogMessage();
  private readonly dialogAlertMessage = new ModalDialogMessage();
  public instantStatus = InstantStatus;
  public language = Language;
  public instantCalcFt = 102;
  private readonly autoSettingInstantType = 2;
  private subscriber: ISubscription;
  private readonly period = 5000;
  private intervalTimer = interval(this.period);
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
      if (this.leagues.length > 0) {
        this.requestService.refreshMatches(this.filterQuery.leagueId, this.leagues, true);
      }
    });
  }


  public getCLassInstant(isInstant: boolean) {
    if (this.permission.canAutoPayout) {
      return isInstant ? BackgroundColor.iconAuto : BackgroundColor.iconOff;
    } else {
      return isInstant ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconOffDisabled;
    }
  }

  public getCLassPayOut(isAutoPayout: boolean, isDirectPayout: boolean) {
    if (this.permission.canAutoPayout) {
      return isAutoPayout ? BackgroundColor.iconAuto :
      isDirectPayout ? BackgroundColor.iconDirect : BackgroundColor.iconOff;
    } else {
      return isAutoPayout ? BackgroundColor.iconAutoDisabled :
      isDirectPayout ? BackgroundColor.iconDirectDisabled : BackgroundColor.iconOffDisabled;
    }
  }

  public getTittleInstant(isInstant: boolean) {
    if (this.permission.canAutoPayout) {
      return isInstant ? Language.instants.titleOffInstant : Language.instants.titleOnInstant;
    }

    return "";
  }

  public updateInstant(match: CalculationMatch) {
    var isPermission = this.permission.canAutoPayout && _.isNull(match.isCalculatingSingle) && _.isNull(match.isCalculatingMP);
    if (isPermission) {
      this.dialogConfirmMessage.message = Language.instants.confirm;
      this.messageBoxService.confirm(this.dialogConfirmMessage, () => {
        this.doUpdateInstant(match);
      });
    }
  }
  private async doUpdateInstant(match: CalculationMatch) {
    const query = new AutoSettingMatchQuery(
      Number(match.matchId),
      AutoSettingType.instant,
      !match.autoCalcSetting.isInstantForMatch
    );
    const result = await this.requestService.updateSettingMatch(query).toPromise();
    if (result.errCode === 0) {
      match.autoCalcSetting.isInstantForMatch = !match.autoCalcSetting.isInstantForMatch;

    } else {
      this.dialogAlertMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogAlertMessage);
    }
  }

  public updateInstantForLeague(match: CalculationMatch, league: League){
    this.dialogConfirmMessage.message = league.matches[0].autoCalcSetting.isAutoPayoutForLeague ? Language.instants.confirmOffLeague : Language.instants.confirmOnLeague;
    this.dialogConfirmMessage.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(this.dialogConfirmMessage, () => {
      this.doUpdateSettingLeague(match, league, true);
    }, () => {
      this.doUpdateSettingLeague(match, league, false);
    });
  }

  private async doUpdateSettingLeague(match: CalculationMatch, leagueMatch: League, isApplyAll: boolean) {
    this.dialogConfirmMessage.hasActionOnNoBtn = false;
    const query = new AutoSettingLeagueQuery(
      Number(leagueMatch.leagueId),
      this.autoSettingInstantType,
      !match.autoCalcSetting.isInstantForLeague,
      isApplyAll
    );
    const result = await this.requestService.updateSettingLeague(query).toPromise();
    if (result.errCode === 0) {
      match.autoCalcSetting.isInstantForLeague = !match.autoCalcSetting.isInstantForLeague;
      if (isApplyAll) {
        this.handleActionService.handleAutoInstantForMatch(leagueMatch, match.autoCalcSetting.isInstantForLeague);
      }
    } else {
      this.dialogConfirmMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogConfirmMessage);
    }
  }


  public openUpdatePayout(match: CalculationMatch) {
    if (this.permission.canAutoPayout) {
      this.popupService.openUpdatePayout(match);
    }
  }

  public openUpdatePayoutForLeague(league: League){
    if (this.permission.canAutoPayout) {
      this.popupService.openUpdatePayoutForLeague(league);
    }
  }

  public openUpdateTime(league: League, isInstant: boolean){
    if (this.permission.canAutoPayout) {
      this.popupService.openUpdateTime(league, isInstant);
    }
  }

  public getClassInstantStatus(match: CalculationMatch) {
    return _.isEqual(match.instantScoreDiff, 1) && match.autoCalcSetting.isInstantForMatch ? BackgroundColor.autoSettleRunning : "";
  }

  public getColorInstant(match: CalculationMatch) {
    return match.instantStatus.includes('LIVE') ? "red" : "";
  }

  public async updateInstantStatus(match: CalculationMatch) {
    if (!this.isNullOrEmpty(match.instantHomeScore) && !this.isNullOrEmpty(match.instantAwayScore)) {
      const query = new UpdateInstantQuery(match);
      const result = await this.requestService.updateInstantStatus(query).toPromise();
      if (result.errCode === 0) {
        this.doUpdateInstantStatus(match, query, result);
      } else {
        this.dialogAlertMessage.message = result.errMsg;
        this.messageBoxService.alert(this.dialogAlertMessage);
      }
    }
  }

  private doUpdateInstantStatus(match: CalculationMatch, query: UpdateInstantQuery, result: MatchGoalRecord) {
    this.dialogConfirmMessage.message = Language.instants.confirmExecuteInstant;
    this.messageBoxService.confirm(this.dialogConfirmMessage, () => {
      this.requestService.updateInstantStatus(query).subscribe(result => {
        if (result.errCode === 0) {
          this.handleActionService.handleChangeInstantStatus(match);
        } else {
          this.dialogAlertMessage.message = result.errMsg;
          this.messageBoxService.alert(this.dialogAlertMessage);
        }
      }
      );
    });
  }
  public isNullOrEmpty(value: string) {
    return _.isNull(value) || _.isEmpty(value);
  }
}
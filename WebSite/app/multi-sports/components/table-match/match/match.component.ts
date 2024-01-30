import { Match } from '../../../models';
import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { AutoSettingPosition, DefaultValue } from '../../../constants';
import * as _ from 'lodash';
import { PopupService, MultiSportService, BackGroundService, SportMatchService } from '../../../services';
import { MessageBoxService } from '../../../../shared/services';
import { Language } from '../../../../shared/language.native';
import { ModalDialogMessage, Remark, AutoSetting, AutoSettingMatchQuery } from '../../../../shared/models';
import { SportType, ResultType, BackgroundColor, CalculationStatus, EventStatus } from '../../../../shared/constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../../../shared/pipes/pipes.module.native';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MultiSportsStore } from '../../../services/multi-sports.store';
import { SportSupportInstant } from '../../../constants/sport-instant';
import { MatchState } from '../../../models/match-state.model';
import { IntervalScorePipe } from '../../../../shared/pipes/interval-score.pipe';

@Component({
  selector: 'match',
  templateUrl: './match.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, PipesModule, NgbTooltip],
  providers: [IntervalScorePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchComponent implements OnChanges {
  @Input() match: Match;
  private sportMatchService = inject(SportMatchService);
  private popupService = inject(PopupService);
  private backGroundService = inject(BackGroundService);
  private messageBoxService = inject(MessageBoxService);
  private multiSportService = inject(MultiSportService);
  private intervalPipe = inject(IntervalScorePipe);
  public store = inject(MultiSportsStore);
  public language = Language;
  private readonly autoSettingCompleted = 2;
  private readonly autoSettingFailed = 3;
  private readonly earlyOverOnlyValue = "1";
  public readonly sportTypeCricket = SportType.cricket;
  public readonly sportSupportInstant = SportSupportInstant;
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public math = Math;
  public matchState = new MatchState();

  constructor( readonly cd: ChangeDetectorRef) {}
    console.log(this.multiSport.sports)
    

  public ChangeDetectionCount = 0
  public get GetChangeDetectionCount() {

    return this.ChangeDetectionCount++
  }


  ngOnChanges(changes: SimpleChanges) {
    this.sportMatchService.getMatchIntervalScore(this.match, this.store.state.permission);
    this.matchState.isChanged = true;
    this.matchState.undecidedColor = this.undecidedColor(this.match.remark);
    this.matchState.autoSettingBackgroundColor = this.getBackgroundAutoSetting();
    this.matchState.resultHomeConfirmedBackgroundColor = this.ResultConfirmedBackGround(this.match.isHavingIntervalScore, 'home');
    this.matchState.resultAwayConfirmedBackgroundColor = this.ResultConfirmedBackGround(this.match.isHavingIntervalScore, 'away');
    this.cd.detectChanges();
  }

  private undecidedColor(remark: Remark) {
    return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
  }

  public isShowCalculationLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.store.state.permission.canCalculate || (this.store.state.permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  public isShowRefundLink(match: Match) {
    const disableRefund = _.isEmpty(this.store.request.matchCode) && !_.isEqual(this.store.request.overStatus, DefaultValue.unCheckAll);
    return this.backGroundService.isShowLink(match) && this.store.state.permission.canRefund && !disableRefund ? BackgroundColor.codeLink : '';
  }

  public isShowEarlySettleLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.store.state.permission.canCalculate || this.store.state.permission.canUncalculate || this.store.state.permission.canRefund
      || (this.store.state.permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  public canAutoSettlement(sportType: number) {
    return _.includes(ResultType.autoSettleSupported, sportType);
  }

  public getEarlySettleBackground(match: Match) {
    const backgroundColorBlinking = match.isExistsConfirmedEarly && this.isEarlyOverAndOtherStatus(this.store.request.overStatus) ? BackgroundColor.confirmedEarlyBlinking : '';
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColorBlinking + ' ' + backgroundColor;
  }

  private isEarlyOverAndOtherStatus(overStatus: string) {
    return _.includes(overStatus, this.earlyOverOnlyValue) && overStatus.length > 1;
  }

  public getAutoSetting(autoSetting: AutoSetting) {
    if (autoSetting.isAutoPayoutForMatch && autoSetting.isDirectPayoutForMatch) {
      return "BOTH";
    }
    if (autoSetting.isAutoPayoutForMatch) {
      return "AUTO";
    }
    if (autoSetting.isDirectPayoutForMatch) {
      return "DIRECT";
    }

    return "OFF";

  }

  public changeAutoSetting(match: Match) {
    if (this.store.state.permission.canAutoPayout) {
      this.popupService.openUpdatePayoutForMatch(match);
    }
  }

  getClassInstant(isInstant: boolean) {
    if (this.store.state.permission.canAutoPayout) {
      return isInstant ? BackgroundColor.iconOn : BackgroundColor.iconOff;
    } else {
      return isInstant ? BackgroundColor.iconOnDisabled : BackgroundColor.iconOffDisabled;
    }
  }


  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.store.request.fromDate, this.store.request.toDate);
  }

  public popupCalc(match: Match) {
    this.popupService.popupCalc(match);
  }

  public popupRefund(match: Match) {
    this.popupService.popupRefund(match);
  }

  public popupEarly(match: Match) {
    this.popupService.popupEarly(match);
  }

  public popupChangeRemarkSetting(match: Match) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match);
    }
  }

  public isChangeSetting(match: Match) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }

  public getBackgroundAutoSetting(match: Match, isPayout: boolean = true) {
    const enableLink = this.permission.canAutoPayout && isPayout ? BackgroundColor.codeLink : "";
    const status = isPayout ? match.autoPayoutStatus : match.autoInstantStatus;
    const colorStatus = _.isEqual(status, this.autoSettingCompleted) ? 'auto-setting-completed' :
      _.isEqual(status, this.autoSettingFailed) ? 'auto-setting-failed' : '';

    return `${enableLink} ${colorStatus}`;
  }

  private ResultConfirmedBackGround(isHavingIntervalScore : boolean, teamName: string) {
    if(isHavingIntervalScore) {
      return _.some(this.match.intervalScore, score => score.isConfirmed && score.isNotSettled) ? BackgroundColor.resultConfirmed : '';
    }
    return _.some(this.intervalPipe.transform(this.match.intervalScore, teamName), score => score.isConfirmed && score.isNotSettled) ? BackgroundColor.resultConfirmed : '';
  }

  public isFinalConfirmed(match: Match) {
    if (ResultType.havingConfirmedStatus.includes(match.sportType) || ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)) {
      if (ResultType.intervalScoreByResultDetail.includes(match.sportType)) {
        return match.moreScores.finalScore.isConfirmed && match.moreScores.finalScore.isNotSettled;
      }

      return !_.isEqual(match.suspenderFullTime, '-') && match.finalHomeScore !== null && match.finalAwayScore !== null
        && !match.isCalculated && !match.isCalRefund;
    }

    return false;
  }

  public isHalfTimeConfirmed(match: Match) {
    if (ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)) {

      if (ResultType.intervalScoreByResultDetail.includes(match.sportType)) {
        return match.moreScores.halfTimeScore.isConfirmed && match.moreScores.halfTimeScore.isNotSettled;
      }

      return !_.isEqual(match.suspenderHalfTime, '-') && match.halfTimeHomeScore !== null && match.halfTimeAwayScore !== null
        && !match.isHalfTimeCal && !match.isCalRefund;
    }

    return false;
  }

  public getHalfTimeHomeScore(match: Match) {

    let halfTimeHomeScore;
    if (this.isHideHtScore(match)) {
      halfTimeHomeScore = null;
    } else {
      halfTimeHomeScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
        ? _.includes(ResultType.scoreInResultDetail, match.sportType)
          ? match.moreScores.halfTimeScore.home
          : match.halfTimeHomeScore : null;
    }
    return _.isNil(halfTimeHomeScore) ? '-' : halfTimeHomeScore.toString();
  }

  public getHalfTimeAwayScore(match: Match) {
    let halfTimeAwayScore;
    if (this.isHideHtScore(match)) {
      halfTimeAwayScore = null;
    } else {
      halfTimeAwayScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
        ? _.includes(ResultType.scoreInResultDetail, match.sportType)
          ? match.moreScores.halfTimeScore.away
          : match.halfTimeAwayScore : null;
    }
    return _.isNil(halfTimeAwayScore) ? '-' : halfTimeAwayScore.toString();
  }

  public getFinalHomeScore(match: Match) {
    let finalHomeScore;
    if (this.isHideFinalScore(match)) {
      finalHomeScore = null;
    } else {
      finalHomeScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.finalScore.home
        : match.finalHomeScore;
    }
    return _.isNil(finalHomeScore) ? '-' : finalHomeScore.toString();
  }

  public getFinalAwayScore(match: Match) {
    let finalAwayScore;
    if (this.isHideFinalScore(match)) {
      finalAwayScore = null;
    } else {
      finalAwayScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.finalScore.away
        : match.finalAwayScore;
    }

    return _.isNil(finalAwayScore) ? '-' : finalAwayScore.toString();
  }

  public isHideHtScore(match: Match) {
    return ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)
      && !this.store.state.permission.isLeader // false => true
      && !match.isHalfTimeCal // flase => true
      && (!this.isRefundHt(match)
        && !match.isCalRefund);
  }

  public isHideFinalScore(match: Match) {
    return (ResultType.havingConfirmedStatus.includes(match.sportType)
      || ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType))
      && !this.store.state.permission.isLeader
      && !match.isCalculated
      && !match.isCalRefund;
  }

  private isRefundHt(match: Match) {
    return match.eventStatus === EventStatus.refundHalftime
      || (_.includes(ResultType.scoreInResultDetail, match.sportType)
        && _.isEqual(match.moreScores?.halfTimeScore?.home, Language.RefundSymbol.All))
  }

  public getInterval(match: Match) {
    const eSportNormalMaxMap = 9;
    if (_.isEqual(match.sportType, SportType.eSports) && match.bestOfMap > eSportNormalMaxMap) {
      match.isMatchBOMThirty = true;
      return _.slice(match.intervalScore, 0, eSportNormalMaxMap);
    }

    return match.intervalScore;
  }

  public getTotalHomeGames(match: Match) {
    const homeTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
      ? _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.halfTimeScore.home
        : match.homeTotalGames : null;
    return _.isNil(homeTotalGames) ? '-' : homeTotalGames.toString();
  }

  public getTotalAwayGames(match: Match) {
    const awayTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
      ? _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.halfTimeScore.away
        : match.awayTotalGames : null;
    return _.isNil(awayTotalGames) ? '-' : awayTotalGames.toString();
  }

  public getRemarkStatusTooltip(remark: Remark) {
    let tooltip = "";
    if (remark.isMtdHold) {
      tooltip += "MTD. Hold\n";
    }

    if (remark.isUndecided) {
      tooltip += "Undecided\n";
    }

    if (remark.isPending) {
      tooltip += "Result Pending\n";
    }

    if (remark.isUnderSettle) {
      tooltip += "Under Settlement\n";
    }

    if (remark.isKeyHold) {
      tooltip += "Hold Key\n";
    }

    return tooltip;
  }

  public getEventStatusColor(match: Match) {
    return _.isNull(match.isCalculatingSingle) ? match.eventStatusColor
      : match.isCalculatingSingle === CalculationStatus.waiting ? `${BackgroundColor.waiting} ${match.eventStatusColor}`
        : match.isCalculatingSingle === CalculationStatus.calculating ? `${BackgroundColor.calculating} ${match.eventStatusColor}`
          : match.eventStatusColor;
  }

  public getCalcColumnColor(match: Match) {
    return match.isCalculated ? BackgroundColor.calculated
      : match.isCalRefund ? BackgroundColor.calRefund
        : match.isHalfTimeCal ? BackgroundColor.halfTimeCalculated
          : '';
  }

  public updateInstant(match: Match) {
    this.dialogMessage.message = Language.instants.confirm;
    this.dialogMessage.title = Language.confirmationBox;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doUpdateInstant(match);
    });
  }

  private async doUpdateInstant(match: Match) {
    const query = new AutoSettingMatchQuery(
      Number(match.matchId),
      AutoSettingPosition.autoInstant,
      !match.autoCalcSetting.isInstantForMatch
    );
    const result = await this.multiSportService.updateSettingMatch(query);
    if (result.errCode === 0) {
      match.autoCalcSetting.isInstantForMatch = !match.autoCalcSetting.isInstantForMatch;
    } else {
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }
}

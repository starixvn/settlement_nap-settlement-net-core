import { Injectable } from "@angular/core";
import { AutoSetting, Remark } from "../../shared/models";
import { Permission } from "../models/permission.model";
import { Match } from "../models";
import { BackgroundColor, CalculationStatus, EventStatus, ResultType, SportType } from "../../shared/constants";
import { IntervalScorePipe } from "../../shared/pipes/interval-score.pipe";
import * as _ from 'lodash';
import { Language } from "../../shared/language.native";
import { BackGroundService } from "./back-ground.service";
import { DefaultValue } from "../constants";

@Injectable()
export class MatchStateService {

  private readonly autoSettingCompleted = 2;
  private readonly autoSettingFailed = 3;
  private readonly earlyOverOnlyValue = "1";

  constructor(private readonly intervalPipe: IntervalScorePipe, private readonly backGroundService: BackGroundService) {

  }
  getUndecidedColor(remark: Remark) {
    return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
  }

  getBackgroundAutoSetting(match: Match, permission: Permission, isPayout: boolean = true) {
    const enableLink = permission.canAutoPayout && isPayout ? BackgroundColor.codeLink : "";
    const status = isPayout ? match.autoPayoutStatus : match.autoInstantStatus;
    const colorStatus = _.isEqual(status, this.autoSettingCompleted) ? 'auto-setting-completed' :
      _.isEqual(status, this.autoSettingFailed) ? 'auto-setting-failed' : '';

    return `${enableLink} ${colorStatus}`;
  }

  ResultConfirmedBackGround(match: Match, teamName: string) {
    if (match.isHavingIntervalScore) {
      return _.some(match.intervalScore, score => score.isConfirmed && score.isNotSettled) ? BackgroundColor.resultConfirmed : '';
    }
    return _.some(this.intervalPipe.transform(match.intervalScore, teamName), score => score.isConfirmed && score.isNotSettled) ? BackgroundColor.resultConfirmed : '';
  }

  
  getTotalHomeGames(match: Match) {
    const homeTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
      ? _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.halfTimeScore.home
        : match.homeTotalGames : null;
    return _.isNil(homeTotalGames) ? '-' : homeTotalGames.toString();
  }

  getTotalAwayGames(match: Match) {
    const awayTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
      ? _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.halfTimeScore.away
        : match.awayTotalGames : null;
    return _.isNil(awayTotalGames) ? '-' : awayTotalGames.toString();
  }

  isHalfTimeConfirmed(match: Match) {
    if (ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)) {

      if (ResultType.intervalScoreByResultDetail.includes(match.sportType)) {
        return match.moreScores.halfTimeScore.isConfirmed && match.moreScores.halfTimeScore.isNotSettled;
      }

      return !_.isEqual(match.suspenderHalfTime, '-') && match.halfTimeHomeScore !== null && match.halfTimeAwayScore !== null
        && !match.isHalfTimeCal && !match.isCalRefund;
    }

    return false;
  }

   isFinalConfirmed(match: Match) {
    if (ResultType.havingConfirmedStatus.includes(match.sportType) || ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)) {
      if (ResultType.intervalScoreByResultDetail.includes(match.sportType)) {
        return match.moreScores.finalScore.isConfirmed && match.moreScores.finalScore.isNotSettled;
      }

      return !_.isEqual(match.suspenderFullTime, '-') && match.finalHomeScore !== null && match.finalAwayScore !== null
        && !match.isCalculated && !match.isCalRefund;
    }

    return false;
  }

  getHalfTimeHomeScore(match: Match, permission: Permission) {
    let halfTimeHomeScore;
    if (this.isHideHtScore(match, permission)) {
      halfTimeHomeScore = null;
    } else {
      halfTimeHomeScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
        ? _.includes(ResultType.scoreInResultDetail, match.sportType)
          ? match.moreScores.halfTimeScore.home
          : match.halfTimeHomeScore : null;
    }
    return _.isNil(halfTimeHomeScore) ? '-' : halfTimeHomeScore.toString();
  }

  getHalfTimeAwayScore(match: Match, permission: Permission) {
    let halfTimeAwayScore;
    if (this.isHideHtScore(match, permission)) {
      halfTimeAwayScore = null;
    } else {
      halfTimeAwayScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
        ? _.includes(ResultType.scoreInResultDetail, match.sportType)
          ? match.moreScores.halfTimeScore.away
          : match.halfTimeAwayScore : null;
    }
    return _.isNil(halfTimeAwayScore) ? '-' : halfTimeAwayScore.toString();
  }

  isHideHtScore(match: Match, permission: Permission) {
    return ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType)
      && !permission.isLeader 
      && !match.isHalfTimeCal
      && (!this.isRefundHt(match) && !match.isCalRefund);
  }

  private isRefundHt(match: Match) {
    return match.eventStatus === EventStatus.refundHalftime
      || (_.includes(ResultType.scoreInResultDetail, match.sportType)
        && _.isEqual(match.moreScores?.halfTimeScore?.home, Language.RefundSymbol.All))
  }

  getFinalHomeScore(match: Match, permission: Permission) {
    let finalHomeScore;
    if (this.isHideFinalScore(match, permission)) {
      finalHomeScore = null;
    } else {
      finalHomeScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.finalScore.home
        : match.finalHomeScore;
    }
    return _.isNil(finalHomeScore) ? '-' : finalHomeScore.toString();
  }

  getFinalAwayScore(match: Match, permission: Permission) {
    let finalAwayScore;
    if (this.isHideFinalScore(match, permission)) {
      finalAwayScore = null;
    } else {
      finalAwayScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
        ? match.moreScores.finalScore.away
        : match.finalAwayScore;
    }

    return _.isNil(finalAwayScore) ? '-' : finalAwayScore.toString();
  }

  isHideFinalScore(match: Match, permission: Permission) {
    return (ResultType.havingConfirmedStatus.includes(match.sportType)
      || ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType))
      && !permission.isLeader
      && !match.isCalculated
      && !match.isCalRefund;
  }

  canAutoSettlement(sportType: number) {
    return _.includes(ResultType.autoSettleSupported, sportType);
  }

  getEarlySettleBackground(match: Match, overStatus: string) {
    const backgroundColorBlinking = match.isExistsConfirmedEarly && this.isEarlyOverAndOtherStatus(overStatus) ? BackgroundColor.confirmedEarlyBlinking : '';
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColorBlinking + ' ' + backgroundColor;
  }

  private isEarlyOverAndOtherStatus(overStatus: string) {
    return _.includes(overStatus, this.earlyOverOnlyValue) && overStatus.length > 1;
  }

  isShowEarlySettleLink(match: Match, permission: Permission) {
    return this.backGroundService.isShowLink(match) && (permission.canCalculate || permission.canUncalculate || permission.canRefund
      || (permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  isShowCalculationLink(match: Match, permission: Permission) {
    return this.backGroundService.isShowLink(match) && (permission.canCalculate || (permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  isShowRefundLink(match: Match, matchCodeSearched: string, permission: Permission, overStatus: string) {
    const disableRefund = _.isEmpty(matchCodeSearched) && !_.isEqual(overStatus, DefaultValue.unCheckAll);
    return this.backGroundService.isShowLink(match) && permission.canRefund && !disableRefund ? BackgroundColor.codeLink : '';
  }

  getEventStatusColor(match: Match) {
    return _.isNull(match.isCalculatingSingle) ? match.eventStatusColor
      : match.isCalculatingSingle === CalculationStatus.waiting ? `${BackgroundColor.waiting} ${match.eventStatusColor}`
        : match.isCalculatingSingle === CalculationStatus.calculating ? `${BackgroundColor.calculating} ${match.eventStatusColor}`
          : match.eventStatusColor;
  }

  getCalcColumnColor(match: Match) {
    return match.isCalculated ? BackgroundColor.calculated
      : match.isCalRefund ? BackgroundColor.calRefund
        : match.isHalfTimeCal ? BackgroundColor.halfTimeCalculated
          : '';
  }


  getClassInstant(isInstant: boolean, canAutoPayout: boolean) {
    if (canAutoPayout) {
      return isInstant ? BackgroundColor.iconOn : BackgroundColor.iconOff;
    } else {
      return isInstant ? BackgroundColor.iconOnDisabled : BackgroundColor.iconOffDisabled;
    }
  }

  getRemarkStatusTooltip(remark: Remark) {
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

  isChangeSetting(match: Match) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }

  getRemarkState (remark: Remark){
    return remark.isKeyHold || remark.isMtdHold || remark.isPending ||
				remark.isUndecided || remark.isUnderSettle ? "YES" : "NO"
  }

   getAutoSetting(autoSetting: AutoSetting) {
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
}

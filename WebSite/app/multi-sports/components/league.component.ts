import { MultiSport, MatchWaitingRequest, LeagueMatch, Match, SportMatch } from './../models';
import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef, Injector } from '@angular/core';
import { DefaultValue } from '../constants';
import * as _ from 'lodash';
import { RefreshMatchService, MultiSportService, PopupService } from '../services/';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { MessageBoxService } from './../../shared/services';
import { Language } from '../../shared/language.native';
import { ModalDialogMessage, AutoSettingLeagueQuery, AutoSettingMatchQuery, Score, Remark } from '../../shared/models';
import { SportType, ResultType, BackgroundColor, CalculationStatus, EventStatus } from '../../shared/constants';
import { Permission } from '../../shared/models/sportsbook-sop';
import { BackGroundService, SportMatchService } from '../services';

@Component({
  selector: 'league',
  templateUrl: './league.component.html'
})
export class LeagueComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public multiSport: MultiSport;
  @Input() public request: MatchWaitingRequest;
  @Input() public enableRefresh: boolean;
  private sportMatchService: SportMatchService;
  private refreshMatchesService: RefreshMatchService;
  private multiSportService: MultiSportService;
  private messageBoxService: MessageBoxService;
  private popupService: PopupService;
  private backGroundService: BackGroundService;
  public language = Language;
  private readonly period = 5000;
  private readonly autoSettingType = 1;
  private readonly autoSettingCompleted = 2;
  private readonly autoSettingFailed = 3;
  private readonly earlyOverOnlyValue = "1";
  private subscriber: Subscription;
  public sports: SportMatch[];
  public permission: Permission;
  public match: Match;
  public sportTypeCricket = SportType.cricket;
  public intervalTimer = interval(this.period);
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();

  constructor(protected injector: Injector, private readonly cd: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!_.isUndefined(changes.multiSport) && !changes.multiSport.firstChange) {
      this.permission = this.multiSport.permission;
      this.refreshMatchesService.permission = this.permission;
      this.sports = this.sportMatchService.getSportsWithIntervalScore(this.multiSport.sports, this.permission);
    }
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.sportMatchService = this.injector.get(SportMatchService);
    this.refreshMatchesService = this.injector.get(RefreshMatchService);
    this.multiSportService = this.injector.get(MultiSportService);
    this.messageBoxService = this.injector.get(MessageBoxService);
    this.popupService = this.injector.get(PopupService);
    this.backGroundService = this.injector.get(BackGroundService);
    this.permission = this.multiSport.permission;
    this.refreshMatches();
  }

  public ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  public get isExistedSport(): boolean | undefined {
    return this.sports && this.sports.length > 0;
  }

  public collapseSport(sport: SportMatch) {
    sport.collapse = !sport.collapse;
  }

  public collapseLeague(league: LeagueMatch) {
    league.collapse = !league.collapse;
  }

  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (this.enableRefresh && this.isExistedSport) {
        this.refreshMatchesService.refreshMatches(this.sports, this.request, this.multiSport);
      }
    });
  }

  public isShowCalculationLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || (this.permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  public isShowRefundLink(match: Match) {
    const disableRefund = _.isEmpty(this.request.matchCode) && !_.isEqual(this.request.overStatus, DefaultValue.unCheckAll);
    return this.backGroundService.isShowLink(match) && this.permission.canRefund && !disableRefund ? BackgroundColor.codeLink : '';
  }

  public isShowEarlySettleLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund
      || (this.permission.isTrader && match.sportType === SportType.cricket))
      ? BackgroundColor.codeLink : '';
  }

  public canAutoSettlement(sportType: number) {
    return _.includes(ResultType.autoSettleSupported, sportType);
  }

  public getEarlySettleBackground(match: Match) {
    const backgroundColorBlinking = match.isExistsConfirmedEarly && this.isEarlyOverAndOtherStatus(this.request.overStatus) ? BackgroundColor.confirmedEarlyBlinking : '';
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColorBlinking + ' ' + backgroundColor;
  }

  private isEarlyOverAndOtherStatus(overStatus: string) {
    return _.includes(overStatus, this.earlyOverOnlyValue) && overStatus.length > 1;
  }

  public getAutoSetting(match: Match) {
    if (this.permission.canAutoPayout) {
      return match.isAutoPayoutForMatch ? BackgroundColor.iconAuto : BackgroundColor.iconNo;
    } else {
      return match.isAutoPayoutForMatch ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
    }
  }

  public changeAutoSetting(match: Match) {
    if (!this.permission.canAutoPayout) {
      return;
    }
    this.dialogMessage.title = Language.AutoPayoutSetting.PopupTitle;
    this.dialogMessage.message = Language.AutoPayoutSetting.ConfirmMessageForMatch;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doUpdateSettingMatch(match);
    });
  }

  private async doUpdateSettingMatch(match: Match) {
    const query = new AutoSettingMatchQuery(
      Number(match.matchId),
      this.autoSettingType,
      !match.isAutoPayoutForMatch
    );
    const result = await this.multiSportService.updateSettingMatch(query);
    if (result.errCode === 0) {
      match.isAutoPayoutForMatch = !match.isAutoPayoutForMatch;
    } else {
      this.dialogMessage.title = Language.InstantSetting.WarningTitle;
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }

  public changeAutoLeague(leagueMatch: LeagueMatch) {
    if (!this.permission.canAutoPayout) {
      return;
    }
    this.dialogMessage.title = Language.AutoPayoutSetting.PopupTitle;
    this.dialogMessage.message = this.autoSettingLeagueMessage(leagueMatch.isAutoPayoutForLeague);
    this.dialogMessage.hasActionOnNoBtn = true;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doUpdateSettingLeague(leagueMatch, true);
    }, () => {
      this.doUpdateSettingLeague(leagueMatch, false);
    });
  }

  private autoSettingLeagueMessage(isAutoPayoutForLeague: boolean) {
    return Language.AutoPayoutSetting.ConfirmMessageForLeagueAutoSetting
      .replace(/OLD_SETTING/g, isAutoPayoutForLeague ? 'AUTO' : 'OFF')
      .replace(/NEW_SETTING/g, !isAutoPayoutForLeague ? 'AUTO' : 'OFF');
  }

  private async doUpdateSettingLeague(leagueMatch: LeagueMatch, isApplyAll: boolean) {
    this.dialogMessage.hasActionOnNoBtn = false;
    const query = new AutoSettingLeagueQuery(
      Number(leagueMatch.leagueId),
      this.autoSettingType,
      !leagueMatch.isAutoPayoutForLeague,
      isApplyAll
    );
    const result = await this.multiSportService.updateSettingLeague(query);
    if (result.errCode === 0) {
      leagueMatch.isAutoPayoutForLeague = !leagueMatch.isAutoPayoutForLeague;
      if (isApplyAll) {
        this.affectAutoPayoutForMatch(leagueMatch, leagueMatch.isAutoPayoutForLeague);
      }
    } else {
      this.dialogMessage.title = Language.InstantSetting.WarningTitle;
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }

  private affectAutoPayoutForMatch(leagueMatch: LeagueMatch, isAutoPayoutForLeague: boolean) {
    leagueMatch.matches.forEach(item => {
      if (_.isEqual(item.eventStatus.toLowerCase(), EventStatus.running.toLowerCase()) || _.isEqual(item.eventStatus.toLowerCase(), EventStatus.closed.toLowerCase())) {
        item.isAutoPayoutForMatch = isAutoPayoutForLeague;
      }
    });
  }

  public getAutoSettingLeague(isAutoPayoutForLeague: boolean) {
    if (this.permission.canAutoPayout) {
      return isAutoPayoutForLeague ? BackgroundColor.iconAuto : BackgroundColor.iconNo;
    } else {
      return isAutoPayoutForLeague ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
    }
  }

  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.request.fromDate, this.request.toDate);
  }

  public popupCalc(match: Match) {
    this.popupService.popupCalc(match, this.sports);
  }

  public popupRefund(match: Match) {
    this.popupService.popupRefund(match, this.sports);
  }

  public popupEarly(match: Match) {
    this.popupService.popupEarly(match, this.sports);
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


  public getBackgroundAutoSetting(match: Match) {
    return _.isEqual(match.autoPayoutStatus, this.autoSettingCompleted) ? 'auto-setting-completed' :
      _.isEqual(match.autoPayoutStatus, this.autoSettingFailed) ? 'auto-setting-failed' : '';
  }

  public getTextTooltipMatch(isAuto: boolean) {
    return isAuto ? Language.AutoPayoutSetting.TurnOffAutoSetting : Language.AutoPayoutSetting.TurnOnAutoSetting;
  }

  public isExistIntervalConfirmed(intervalScores: Score[]) {
    return _.some(intervalScores, score => score.isConfirmed && score.isNotSettled);
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
      && !this.permission.isLeader && !match.isHalfTimeCal && !match.isCalRefund;
  }

  public isHideFinalScore(match: Match) {
    return (ResultType.havingConfirmedStatus.includes(match.sportType)
      || ResultType.havingHalfTimeConfirmedStatus.includes(match.sportType))
      && !this.permission.isLeader && !match.isCalculated && !match.isCalRefund;
  }

  public getInterval(match: Match) {
    const eSportNormalMaxMap = 9;
    if (_.isEqual(match.sportType, SportType.eSports) && match.bestOfMap > eSportNormalMaxMap) {
      match.isMatchBOMThirty = true;
      return _.slice(match.intervalScore, 0, eSportNormalMaxMap);
    }

    return match.intervalScore;
  }

  public undecidedColor(remark: Remark) {
    return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
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

  public openUpdateTime(league: LeagueMatch) {
    if (this.permission.canAutoPayout) {
      this.popupService.openUpdateTime(league);
    }
  }
}

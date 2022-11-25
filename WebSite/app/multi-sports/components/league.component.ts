import { MultiSport, MatchWaitingRequest, ParlayQuery,LeagueMatch, Match, SportMatch } from './../models';
import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DefaultValue } from '../constants';
import * as _ from 'lodash';
import { RefreshMatchService, MultiSportService, PopupService, HandleActionsService } from '../services/';
import { ISubscription } from 'rxjs/Subscription';
import { interval } from 'rxjs';
import { MessageBoxService } from './../../shared/services';
import { Language } from './../../shared/language';
import { ModalDialogMessage, Result,  AutoSettingLeagueQuery, AutoSettingMatchQuery, Score, Remark } from '../../shared/models';
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
  private readonly period = 5000;
  private readonly autoSettingType = 1;
  private readonly autoSettingCompleted = 2;
  private readonly autoSettingFailed = 3;
  private readonly earlyOverOnlyValue = "1";
  private subscriber: ISubscription;
  private matchIdsCalcMp: string[] = [];
  public sports: SportMatch[];
  public permission: Permission;
  public match: Match;
  public sportTypeCricket = SportType.cricket;
  public intervalTimer = interval(this.period);
  public readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
  @ViewChildren('calcMPOnLeague') calcMPOnLeague: QueryList<ElementRef>;
  @ViewChildren('calcMPOnMatch') calcMPOnMatch: QueryList<ElementRef>;

  constructor(
    private readonly refreshMatchesService: RefreshMatchService,
    private readonly multiSportService: MultiSportService,
    private readonly messageBoxService: MessageBoxService,
    private readonly popupService: PopupService,
    private readonly handleActionsService: HandleActionsService,
    private readonly sportMatchService: SportMatchService,
    private readonly cd: ChangeDetectorRef,
    private readonly backGroundService: BackGroundService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.multiSport.firstChange) {
      this.permission = this.multiSport.permission;
      this.refreshMatchesService.permission = this.permission;
      this.sports = this.sportMatchService.getSportsWithIntervalScore(this.multiSport.sports, this.permission);
    }
    this.cd.detectChanges();
  }

  public ngOnInit() {
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

  public selectCalcMPOnSport(checked: boolean) {
    _.forEach(this.sports, (sport: SportMatch) => {
      const leagues = sport.leagues.filter((x) => !x.disableCheckCalcMP && !x.isMergedParlay);
      _.forEach(leagues, (league: LeagueMatch) => {
        league.isCheckedCalcMP = checked;
        const matches = league.matches.filter((x) => this.enableCalcMPOnMatch(x) && !x.isMergedParlay);
        _.forEach(matches, (match: Match) => {
          match.isCheckedCalcMP = checked;
        });
      });
    });
  }

  public selectCalcMPOnMatch(league: LeagueMatch) {
    league.isCheckedCalcMP = this.handleActionsService.isCheckedCalcMpOnLeague(league, this.multiSport.permission.canCalculateMp);
    this.multiSport.isCheckedCalcMP = this.handleActionsService.isAllCalcMPAllLeaguesChecked(this.sports);
  }

  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (this.isExistedSport) {
        this.refreshMatchesService.refreshMatches(this.sports, this.request, this.multiSport);
      }
    });
  }

  public selectCalcMPOnLeague(league: LeagueMatch, checked: boolean) {
    league.matches.forEach((match) => match.isCheckedCalcMP = this.enableCalcMPOnMatch(match) ? checked : false);
    this.multiSport.isCheckedCalcMP = this.handleActionsService.isAllCalcMPAllLeaguesChecked(this.sports);
  }

  public disableSelectCalcMPOnLeague(league: LeagueMatch) {
    const findMatch = _.find(league.matches, (match: Match) => this.enableCalcMPOnMatch(match));
    league.disableCheckCalcMP = _.isNil(findMatch);
    return league.disableCheckCalcMP;
  }

  public disableSelectAllCalcMP() {
    const findItem = this.calcMPOnLeague.find(item => !item.nativeElement.disabled);
    return _.isNil(findItem);
  }

  public enableCalcMPOnMatch(match: Match) {
    return this.handleActionsService.enableCalcMPOnMatch(match, this.permission.canCalculateMp);
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

  public getCalcMPColor(match: Match) {
    if (match.isExistMarkedTicketParlay) {
      return BackgroundColor.whiteBlinking;
    }
    if (match.isMultiCaled !== match.isRefund) {
      return match.isMultiCaled ? (match.isExistRunningTicketParlay ? BackgroundColor.pink : BackgroundColor.calculated)
                    : BackgroundColor.calRefund;
    }
    return "";
  }

  public canAutoSettlement(sportType: number) {
    return _.includes(ResultType.autoSettleSupported, sportType);
  }

  public getEarlySettleBackground(match: Match) {
    const earlyOverFilterOnly = _.isEqual(this.request.overStatus, this.earlyOverOnlyValue);
    const backgroundColorBlinking = match.isExistsConfirmedEarly && earlyOverFilterOnly ? BackgroundColor.confirmedEarlyBlinking : '';
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColorBlinking + ' ' + backgroundColor;
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
    const result = await this.multiSportService.updateSettingMatch(query).toPromise();
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
    const result = await this.multiSportService.updateSettingLeague(query).toPromise();
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

  public getCalcMPStatus(match: Match) {
    return match.isCalculatingMP === CalculationStatus.waiting ? EventStatus.waiting : EventStatus.calculating;
  }

  public popupCalc(match: Match) {
    this.popupService.popupCalc(match, this.sports, this.multiSport);
  }

  public popupRefund(match: Match) {
    this.popupService.popupRefund(match, this.sports, this.multiSport);
  }

  public popupEarly(match: Match) {
    this.popupService.popupEarly(match, this.sports, this.multiSport);
  }

  public popupChangeRemarkSetting(match: Match) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match, this.sports, this.multiSport);
    }
  }

  public calculateMixParlay() {
    const findItems = this.sports.find((sport) =>
      sport.leagues.find((league) =>
        league.matches.find((match) => match.isCheckedCalcMP)));

    if (_.isNil(findItems)) {
      return false;
    } else {
      this.confirmCalculateMixParlay();
      return true;
    }
  }

  private confirmCalculateMixParlay() {
    this.matchIdsCalcMp = [];
    const matchCodes: string[] = [];
    _.forEach(this.sports, (sport: SportMatch) => {
      _.forEach(sport.leagues, (league: LeagueMatch) => {
        const matches = league.matches.filter((x) => x.isCheckedCalcMP);
        _.forEach(matches, (match: Match) => {
          this.matchIdsCalcMp.push(match.matchId);
          matchCodes.push(match.matchCode);
        });
      });
    });

    const message = Language.ConfirmCalculateMixParlay.replace('MATCH_CODES', matchCodes.join(', '));
    this.dialogMessage.title = Language.CalculateMixParlay;
    this.dialogMessage.message = message;
    this.messageBoxService.confirm(this.dialogMessage, () => {
      this.doCalculateMixParlay(this.matchIdsCalcMp);
    });
  }

  private async doCalculateMixParlay(matchIds: string[]) {
    const param: ParlayQuery = {
      matchIds: matchIds.join(',')
    };

    const result = await this.multiSportService.calculateMixParlay(param).toPromise() as Result;
    if (result.isSuccessful) {
      this.multiSport.isCheckedCalcMP = false;
      _.forEach(this.sports, (sport: SportMatch) => {
        const leagues = sport.leagues.filter((x) => !x.disableCheckCalcMP);
        _.forEach(leagues, (league: LeagueMatch) => {
          const matches = league.matches.filter((x) => x.isCheckedCalcMP);
          _.forEach(matches, (match: Match) => {
            match.isCalculatingMP = CalculationStatus.waiting;
          });
        });
      });

      this.selectCalcMPOnSport(false);
    } else {
      this.dialogMessage.title = Language.CalculationWarning;
      this.dialogMessage.message = result.errMsg;
      this.messageBoxService.alert(this.dialogMessage);
    }
  }

  public isChangeSetting(match: Match) {
    if (match.isMergedParlay) {
      return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating;
    }

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

  public getInterval(match: Match){
    const eSportNormalMaxMap = 9;
    if(_.isEqual(match.sportType, SportType.eSports) && match.bestOfMap > eSportNormalMaxMap) {
      match.isMatchBOMThirty = true;
      return _.slice(match.intervalScore, 0, eSportNormalMaxMap);
    }

   return  match.intervalScore;
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
}
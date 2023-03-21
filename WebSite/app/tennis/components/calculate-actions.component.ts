import { Component, Input, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService, AioService } from '../../shared/services';
import { ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language';
import { SettlementStatusId, CalculateAction, SportType, ResultStatusId } from '../../shared/constants';
import { KickOffTime, Resources, ResourcesIds, TennisApiKeys } from '../constants';
import { Match, SettleQuery } from '../models';
import { TennisService, VerificationService } from '../services';
import { ExternalResultDetail, HedgeMatchDetail, ResultDetail, SaveScoreQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { ResourceNameByIdPipe } from '../pipes';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'calculate-actions',
  templateUrl: './calculate-actions.component.html',
})
export class CalculateActionsComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  @Input() public match: Match;
  public isReSettledTickets: boolean;
  public enableUncalculate: boolean;
  public isLeader: boolean;
  public disableScoreDirect: boolean;
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  public isReadyMatch: boolean;
  public readonly totalGamesId = ResourcesIds.totalGames;
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(
    private readonly messageBoxService: MessageBoxService,
    private readonly tennisService: TennisService,
    private readonly verificationService: VerificationService,
    private readonly aioService: AioService,
    private readonly toastrService: ToastrService) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    const query = {
      matchId,
      apikey: TennisApiKeys.NormalMatch,
    };
    this.toastrService.overlayContainer = this.toastContainer;
    this.match = await this.aioService.getMatch(query).toPromise() as Match;
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.cloneResultDetail();
    this.init();
  }

  private cloneResultDetail() {
    this.match.resultDetails.forEach((map) => {
      if (map.settlementStatusId === SettlementStatusId.Calculated) {
        map.originalHomeValue = _.clone(map.homeValue);
        map.originalAwayValue = _.clone(map.awayValue);
      } else {
        map.originalHomeValue = '0';
        map.originalAwayValue = '0';
      }
    });
  }

  private init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.match.resultDetails = this.tennisService.getResultDetail(this.match.resultDetails);
    this.verificationService.generateExternalScores(this.match, this.match.resultDetails, SportType.tennis);
    this.resetHomeAway(this.noTotalGames);
    this.enableUncalculate = this.enableUncalculateButton();
    this.disableScoreDirect = this.verificationService.isTicketOnGame(this.match.resultDetails,
      ResourcesIds.totalGames, ResourcesIds.totalSets);
    this.isLeader = this.match.permission.isLeader;
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.autoFillScoreOnLoad(this.match.resultDetails);
    this.generateOutsideTotalGames();
  }

  private resetHomeAway(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      map.homeValue = map.settlementStatusId === SettlementStatusId.Calculated? map.homeValue : "";
      map.awayValue = map.settlementStatusId === SettlementStatusId.Calculated? map.awayValue : "";
    });
  }

  public get noTotalGames(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.totalGames));
  }

  public get selectedResources(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => map.checked);
  }

  public get totalGames(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalGames));
  }

  public get totalSets(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalSets));
  }

  public calculate() {
    this.toastrService.clear();
    this.match.isClickOnCalculate = true;
    const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
    if (!_.isNil(existResultConfirmed)) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Resources.UnSelectedMapForCalculation);
    } else if (this.verificationService.invalidInputScore(this.selectedResources, this.match.isScoreDirect, ResourcesIds.totalSets)) {
      this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else {
      this.verifyRunningOdds();
    }
  }

  private async verifyRunningOdds() {
    const selectedSets = this.selectedResources.filter(item => !_.isEqual(item.resourceId, ResourcesIds.totalGames))
      .map(item => item.resourceId);
    const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId,
      selectedSets, CalculateAction.calculate);
    if (_.isNil(errorMessage)) {
      this.verifyScoreSourcesAndCalculate();
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private verifyScoreSourcesAndCalculate() {
    if (this.verificationService.allMapHaveScoreSources(this.selectedResources)) {
      this.confirmCalculateMismatchScores();
    } else {
      if (!this.isLeader) {
        this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
      } else {
        this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmCalculateMismatchScores();
        });
      }
    }
  }

  private confirmCalculateMismatchScores() {
    if (this.verificationService.isExistMismatchScore(this.match.resultDetails)) {
      if (!this.isLeader) {
        this.toastrService.error(Language.eSports.nonLeader.mismatchedScore);
      } else {
        this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmIntervalConsistent();
        });
      }
    } else {
      this.confirmIntervalConsistent();
    }
  }

  public uncalculate() {
    this.toastrService.clear();
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Language.NotSelectUncalculationTypeMessage);
    } else {
      this.confirmUncalculation();
    }
  }

  public selectedOnMap() {
    this.match.isClickOnCalculate = false;
    this.enableUncalculate = this.enableUncalculateButton();
  }

  private confirmCalculationResults() {
    const errorMessage = this.verificationService.verifyIntervalsOnCalculation(this.match.resultDetails, this.match.isScoreDirect);
    if (_.isEmpty(errorMessage)) {
      this.confirmChangedResults();
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private confirmIntervalConsistent() {
    if (this.verificationService.verifyMatchScoreOnCalculation(this.match.resultDetails)) {
      this.confirmationDialogMessage.message = Language.intervalsAndMatch.matchNotSelected;
      this.confirmationDialogMessage.hasActionOnNoBtn = true;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.totalSets.checked = true;
        this.isReSettledTickets = true;
      }, () => {
        this.confirmCalculationResults();
      });
    } else {
      this.confirmCalculationResults();
    }
  }

  private async confirmChangedResults() {
    const tennisResultDetails = _.filter(this.match.resultDetails, { checked: true });
    if (this.isReSettledTickets) {
      this.confirmCalculation(tennisResultDetails);
    } else {
      const getTennisResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: TennisApiKeys.NormalMatch,
        sportType: SportType.tennis,
      };
      const needConfirm = await this.aioService.verifyChangedSettledTickets(tennisResultDetails, getTennisResultQuery).toPromise();
      if (needConfirm) {
        this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(tennisResultDetails);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    const excludeTotalGame = resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourcesIds.totalGames));
    const confirmMessage = this.verificationService.getCalculationConfirmMessage(excludeTotalGame, new ResourceNameByIdPipe());
    this.confirmationDialogMessage.message = confirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doCalculation(this.selectedResources);
    });
  }

  private confirmUncalculation() {
    this.match.isClickOnCalculate = false;
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doUncalculation(this.selectedResources);
    });
  }

  private doCalculation(selectedResources: ResultDetail[]) {
    selectedResources.forEach((item) => {
      item.homeValue = (Number(item.homeValue)).toString();
      item.awayValue = (Number(item.awayValue)).toString();
    });

    const betStatus = this.getBetStatus(false);
    this.doSaveScoreAndCalculate(CalculateAction.calculate, selectedResources, betStatus);
  }

  private doUncalculation(selectedResources: ResultDetail[]) {
    selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });

    const betStatus = this.getBetStatus(true);
    this.sendRequest(CalculateAction.unCalculate, selectedResources, betStatus);
  }

  private async doSaveScoreAndCalculate(type: string, resource: ResultDetail[], betStatus: string) {
    const resultWithoutTotalGame = this.noTotalGames;
    const scoresToSave = this.verificationService.getChangedScores(resultWithoutTotalGame, this.match.originalResultDetail);
    const checkedScores = this.verificationService.getOutsideScores(resultWithoutTotalGame);
    const saveScoreQuery: SaveScoreQuery = {
      matchId: this.match.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: TennisApiKeys.NormalMatch
    };

    const saveScoreResult = await this.aioService.saveScore(saveScoreQuery).toPromise() as Result;
    if (!saveScoreResult.isSuccessful) {
      this.toastrService.error(saveScoreResult.errMsg);
    } else {
      resource = _.filter(resource, item => !_.isEqual(item.resourceId, ResourcesIds.totalGames));
      const query = new SettleQuery(this.match.matchDetail.matchId, resource, type, this.isReSettledTickets,
        betStatus, this.match.isScoreDirect);
      query.isLeader = this.isLeader;
      this.push(query);
    }
  }

  private async push(query: SettleQuery): Promise<void> {
    const result = await this.aioService.push(query).toPromise() as Result;
    if (result.errCode === 0) {
      this.hedgeMatch(query);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async hedgeMatch(query: SettleQuery) {
    const matchId = query.matchId;
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      await this.aioService.push(query).toPromise().then(() => {
        this.messageBoxService.closePopup();
      });
    } else {
      this.messageBoxService.closePopup();
    }
  }

  private async sendRequest(type: string, resource: ResultDetail[], betStatus: string): Promise<void> {
    resource = _.filter(resource, item => !_.isEqual(item.resourceId, ResourcesIds.totalGames));
    const query = new SettleQuery(this.match.matchDetail.matchId, resource, type, this.isReSettledTickets,
      betStatus, this.match.isScoreDirect);
    query.isLeader = this.isLeader;
    this.push(query);
  }

  private enableUncalculateButton() {
    return this.match.resultDetails.filter((map) => map.checked).length > 0;
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  private getBetStatus(isUnCal: boolean) {
    const betStatus: string[] = [];
    const refund = !this.match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalSets).checked
      && this.match.matchDetail.betStatus
      && _.includes(this.match.matchDetail.betStatus, 'Refund')
      ? 'Refund;' : '';
    if (!this.match.isScoreDirect) {
      const submitedSets = this.match.resultDetails.filter((map) =>
        map.resourceId !== ResourcesIds.totalGames && map.resourceId !== ResourcesIds.totalSets);
      submitedSets.forEach((map) => {
        betStatus.push(map.checked
          ? !isUnCal ? `${Number(map.homeValue)}-${Number(map.awayValue)}` : `0-0`
          : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
      });
    }

    return refund + betStatus.join(',');
  }

  public selectedOnLastMap() {
    this.totalGames.checked = this.totalSets.checked;
    const newFullTimeScore = this.verificationService.getNewFinalResource(this.noTotalGames, ResourcesIds.totalSets, false);
    const confirmMessage = this.verificationService.verifyFinalResource(this.noTotalGames,
      ResourcesIds.totalSets, newFullTimeScore, "Total Set");
    if (!_.isEmpty(confirmMessage) && !this.match.isScoreDirect) {
      this.confirmationDialogMessage.message = confirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.verificationService.changeToNewFinalResource(this.totalSets, newFullTimeScore);
      });
    }
    this.selectedOnMap();
  }

  public changeScore() {
    const maps = this.match.resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourcesIds.totalSets)
      && !_.isEqual(item.resourceId, ResourcesIds.totalGames)
      && this.verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));
    if (!this.match.isScoreDirect) {
      this.verificationService.sumTotalResultWin(maps, ResourcesIds.setOne, this.totalSets);
      this.verificationService.sumTotalScores(maps, ResourcesIds.setOne, this.totalGames);
    }
    this.totalSets.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalSets);
    this.totalGames.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalGames);
  }

  public changeInputDirectly() {
    this.match.resultDetails.forEach((map) => {
      map.checked = this.match.isScoreDirect && _.isEqual(map.resourceId, ResourcesIds.totalSets);
    });
    this.enableUncalculate = this.enableUncalculateButton();
  }

  public autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
    const intervals = resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.totalSets)
      && !_.isEqual(map.resourceId, ResourcesIds.totalGames));
    if (intervals.length > 0) {
      _.forEach(intervals, (map) => {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
        if (map.settlementStatusId !== SettlementStatusId.Refund) {
          this.verifyAndAutoFillScore(map, true);
        }
      });
    } else {
      this.adjustFinalScoreOnChange(true);
    }
  }

  private adjustFinalScoreOnChange(isOnload = false) {
    this.changeScore();
    if ((_.isEmpty(this.totalSets.homeValue) && _.isEmpty(this.totalSets.awayValue))
      && (isOnload && this.totalSets.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
      this.verificationService.autoFillScore(this.totalSets);
    }
  }

  public verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    const scoreBeforeAutofill = _.cloneDeep(map);
    this.verificationService.autoFillScore(map);
    if (isOnLoad) {
      if (this.totalSets.settlementStatusId === SettlementStatusId.Calculated
        || this.totalSets.settlementStatusId === SettlementStatusId.Refund) {
        this.totalSets.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalSets);
      } else {
        this.adjustFinalScoreOnChange(isOnLoad);
      }
    } else {
      map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
      if (!_.isEqual(scoreBeforeAutofill.homeValue, map.homeValue) || !_.isEqual(scoreBeforeAutofill.awayValue, map.awayValue)) {
        this.adjustFinalScoreOnChange();
      }
    }
  }

  public getClass(resultDetail: ResultDetail) {
    const className = this.isFullTimeMismatched() ? 'col-mismatched ' : '';

    return className + this.tennisService.getIntervalBackground(resultDetail.settlementStatusId);
  }

  public isFinalScoreDisabled(set: ResultDetail, outsideSource = false) {
    if (_.isEqual(set.resourceId, ResourcesIds.totalGames)) {
      return true;
    }

    return this.isLeader || outsideSource ? _.isEqual(set.resourceId, ResourcesIds.totalSets)
      ? !this.match.isScoreDirect : this.match.isScoreDirect : true;
  }

  public isErrorOnVerification(resultDetail: ResultDetail, score: string) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourcesIds.totalSets) {
      disabled = !this.match.isScoreDirect;
    }
    return this.match.isClickOnCalculate && !disabled && resultDetail.checked && _.isEmpty(score);
  }

  public isFullTimeMismatched() {
    return this.verificationService.isFullTimeMismatched(this.noTotalGames, this.match.isScoreDirect,
      ResourcesIds.totalSets, false);
  }

  public checkMapIsMatched(map: ResultDetail) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    this.changeScore();
  }

  public isSaveScoreDisabled() {
    return !this.match.resultDetails.find((map) => map.checked);
  }

  public saveScore() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.eSports.saveScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveScore();
    });
  }

  private async doSaveScore() {
    const resultWithoutTotalGame = this.match.resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.totalGames));
    const scoresToSave = this.verificationService.getChangedScores(resultWithoutTotalGame, this.match.originalResultDetail);
    const checkedScores = this.verificationService.getOutsideScores(resultWithoutTotalGame);
    const query: SaveScoreQuery = {
      matchId: this.match.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: TennisApiKeys.NormalMatch
    };

    const result = await this.aioService.saveScore(query).toPromise() as Result;
    if (!result.isSuccessful) {
      this.toastrService.error(result.errMsg);
    } else {
      this.match.resultDetails.forEach((map) => {
        map.checked = false;
      });
    }
  }

  public generateOutsideTotalGames() {
    const firstSet = this.match.resultDetails[0];
    _.forEach(firstSet.externalScores, (score) => {
      this.updateOutsideScore(score.sourceId, true);
    });
    this.totalGames.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalGames);
  }

  public updateOutsideScore(sourceId: number, IsOnLoad = false) {
    const outsideResults: ExternalResultDetail[] = [];
    this.match.resultDetails.forEach((item) => {
      const outsideResult = _.find(item.externalScores, (score) => score.sourceId === sourceId);
      if (outsideResult && !_.isEqual(item.resourceId, ResourcesIds.totalSets)
        && !_.isEqual(item.resourceId, ResourcesIds.totalGames)
        && this.verificationService.isExistedHomeAwayScore(outsideResult.homeValue, outsideResult.awayValue)) {
        outsideResults.push(outsideResult);
      }
    });
    const totalGamesOutside = _.find(this.totalGames.externalScores, (score) => score.sourceId === sourceId);
    const totalSetsOutside = _.find(this.totalSets.externalScores.slice(3), (score) => score.sourceId === sourceId);
    if (totalGamesOutside) {
      this.verificationService.sumTotalScores(outsideResults, ResourcesIds.setOne, totalGamesOutside);
      this.verifyAndAutoFillScore(this.totalGames, false);
    }
    if (totalSetsOutside &&
      (IsOnLoad && !this.verificationService.isExistedHomeAwayScore(totalSetsOutside.homeValue, totalSetsOutside.awayValue))
      || (!IsOnLoad && !this.match.isScoreDirect)) {
      this.verificationService.sumTotalResultWin(outsideResults, ResourcesIds.setOne, totalSetsOutside);
      this.verifyAndAutoFillScore(this.totalSets, true);
    }
  }

  public getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }
}
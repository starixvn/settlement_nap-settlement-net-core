import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { CalculateCommonModule } from './../../shared/modules/calculate-common.module';
import { BlockUIService } from './../../shared/services/block-ui.service';
import { Component, ViewChild, Injector } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, AioService, IntervalCalculationService } from '../../shared/services';
import { MatchResource, ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { SettlementStatusId, CalculateAction, SportType, ResultStatusId } from '../../shared/constants';
import { Match, HedgeMatchDetail, SettleQuery, ChildMatch, SettleChildMatchQuery } from '../models';
import { ResourceNameByIdPipe } from '../pipes';
import { BadmintonService, VerificationService } from '../services';
import { BadmintonApiKeys, KickOffTime, ResourcesIds, Resources, VolleyballApiKeys } from '../constants';
import { ExternalResultDetail, Permission, ResultDetail, SaveScoreQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { UrlHelper } from '../../helper';
import { ResultPipe } from '../../shared/pipes/result.pipe';
@Component({
  selector: 'calculation-actions',
  templateUrl: './calculate-actions.component.html',
  standalone: true,
  imports: [CalculateCommonModule, ResultPipe, ResourceNameByIdPipe, CalculateMatchDetailComponent],
  providers: [BadmintonService, VerificationService, IntervalCalculationService]
})
export class CalculateActionsComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private aioService: AioService;
  private messageBoxService: MessageBoxService;
  private badmintonService: BadmintonService;
  private verificationService: VerificationService;
  private toastrService: ToastrService;
  public match: Match;
  public hedgeMatchDetail: HedgeMatchDetail;
  public isReSettledTickets: boolean;
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public applyHedgeMatch: boolean;
  public enableUncalculate: boolean;
  public isLeader: boolean;
  public disableScoreDirect: boolean;
  public isReadyMatch: boolean;
  public readonly totalPointsId = ResourcesIds.totalPoints;
  public permission: Permission;
  public apiKeys = null;
  public collapse = false;
  public blockUI = true;

  constructor(private readonly injector: Injector) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    this.initService();
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.apiKeys = sportType === SportType.volleyBall ? VolleyballApiKeys : BadmintonApiKeys;
    const matchQuery = {
      matchId,
      apikey: this.apiKeys.NormalMatch,
      sportType,
      settleType: "MNL"
    };
    this.match = await this.aioService.getMatch(matchQuery) as Match;
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.cloneResultDetail();
    this.init();
  }

  public initService() {
    this.aioService = this.injector.get(AioService);
    this.messageBoxService = this.injector.get(MessageBoxService);
    this.badmintonService = this.injector.get(BadmintonService);
    this.verificationService = this.injector.get(VerificationService);
    this.toastrService = this.injector.get(ToastrService);
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
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

  public init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.permission = this.match.permission;
    this.match.resultDetails = this.badmintonService.getResultDetail(this.match.resultDetails);
    this.verificationService.generateExternalScores(this.match, this.match.resultDetails, this.match.matchDetail.sportType);
    this.resetHomeAway(this.noTotalPoints);
    this.enableUncalculate = this.enableUncalculateButton();
    this.disableScoreDirect = this.verificationService.isTicketOnGame(
      this.match.resultDetails, ResourcesIds.totalPoints, ResourcesIds.totalGames);
    this.isLeader = this.match.permission.isLeader;
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.autoFillScoreOnLoad(this.match.resultDetails);
    this.generateOutsideTotalPoints();
    this.checkConsistent();
  }

  public get noTotalPoints(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.totalPoints));
  }

  public get selectedResources(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => map.checked);
  }

  public get totalPoints(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalPoints));
  }

  public get totalGames(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalGames));
  }

  private resetHomeAway(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      const hideScore = map.settlementStatusId === SettlementStatusId.Refund
        || (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted);
      map.homeValue = hideScore ? "" : map.homeValue;
      map.awayValue = hideScore ? "" : map.awayValue;
    });
  }

  public selectedOnLastMap() {
    this.totalPoints.checked = this.totalGames.checked;
    const newFullTimeScore = this.verificationService.getNewFinalResource(this.noTotalPoints, ResourcesIds.totalGames, false);
    const confirmMessage = this.verificationService.verifyFinalResource(this.noTotalPoints,
      ResourcesIds.totalGames, newFullTimeScore, "Total Game");
    if (!_.isEmpty(confirmMessage) && !this.match.isScoreDirect) {
      this.confirmationDialogMessage.message = confirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.verificationService.changeToNewFinalResource(this.totalGames, newFullTimeScore);
      });
    }
    this.selectedOnMap();
  }

  public async calculate() {
    this.toastrService.clear();
    this.match.isClickOnCalculate = true;
    const existResultConfirmed = _.find(this.selectedResources, item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints)
      && item.resultSettingData.isConfirmedRefund);
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Resources.UnSelectedMapForCalculation);
    } else if (!_.isNil(existResultConfirmed)) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (this.verificationService.invalidInputScore(this.selectedResources, this.match.isScoreDirect, ResourcesIds.totalGames)) {
      this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
    } else if (this.childMatchSelected.length > 0) {
      this.verifyChildMatch();
    } else {
      await this.verifyRunningOdds();
    }
  }

  private verifyChildMatch() {
    if (this.match.isScoreDirect) {
      this.toastrService.error(Language.directlyWithChildMAtch);
    } else if (this.verificationService.verifyConsistentChildMatch(this.match.resultDetails, this.childMatchSelected)) {
      this.toastrService.error(Language.consistentRelatedMatch);
    } else {
      this.confirmationDialogMessage.message = Language.confirmChildMatch;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.verifyRunningOdds();
      });
    }
  }

  private async verifyRunningOdds() {
    const selectedGames = this.selectedResources.filter(item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints))
      .map(item => item.resourceId);
    const matchResource = this.createMatchResource();
    const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId,
      selectedGames, CalculateAction.calculate, matchResource);
    if (_.isNil(errorMessage)) {
      this.verifyScoreSourcesAndCalculate();
    } else {
      this.toastrService.error(errorMessage);
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

  private verifyScoreSourcesAndCalculate() {
    if (this.verificationService.allMapHaveScoreSources(this.selectedResources)) {
      this.confirmFinalScreenshotScore();
    } else {
      // if (this.isLeader) {
      //   this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
      //   this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      //     this.confirmCalculateMismatchScores();
      //   });
      // } else {
        this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
      // }
    }
  }

  private confirmFinalScreenshotScore() {
    if (this.verificationService.isExistMismatchedScoreScreenshot(this.selectedResources)) {
        // if (this.isLeader) {
            this.toastrService.error(Language.sop.leader.mismatchedScreenshot);
        // }
    } else {
        this.confirmCalculateMismatchScores();
    }
}

  private confirmCalculateMismatchScores() {
    if (this.verificationService.isExistMismatchScore(this.match.resultDetails)) {
      if (this.isLeader) {
        this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmIntervalConsistency();
        });
      } else {
        this.toastrService.error(Language.eSports.nonLeader.mismatchedScore);
      }
    } else {
      this.confirmIntervalConsistency();
    }
  }

  private confirmIntervalConsistency() {
    if (this.verificationService.verifyMatchScoreOnCalculation(this.match.resultDetails)) {
      this.confirmationDialogMessage.message = Language.intervalsAndMatch.matchNotSelected;
      this.confirmationDialogMessage.hasActionOnNoBtn = true;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.totalGames.checked = true;
        this.isReSettledTickets = true;
      }, () => {
        this.confirmCalculationResults();
      });
    } else {
      this.confirmCalculationResults();
    }
  }

  private confirmCalculationResults() {
    const errorMessage = this.verificationService.verifyIntervalsOnCalculation(this.match.resultDetails, this.match.isScoreDirect);
    if (_.isEmpty(errorMessage)) {
      this.confirmChangedResults();
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  public selectedOnMap() {
    this.enableUncalculate = this.enableUncalculateButton();
    this.match.isClickOnCalculate = false;
  }

  private async confirmChangedResults() {
    const badmintonResultDetails = _.filter(this.match.resultDetails, { checked: true });
    if (this.isReSettledTickets) {
      this.confirmCalculation(badmintonResultDetails);
    } else {
      const getBadmintonResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: this.apiKeys.NormalMatch,
        sportType: this.match.matchDetail.sportType,
      };
      const needConfirm = await this.aioService.verifyChangedSettledTickets(badmintonResultDetails, getBadmintonResultQuery);
      if (needConfirm) {
        this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(badmintonResultDetails);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    const confirmMessage = this.verificationService.getCalculationConfirmMessage(resultDetails, new ResourceNameByIdPipe());
    this.confirmationDialogMessage.message = confirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doCalculation(this.selectedResources);
    });
  }

  private doCalculation(selectedResources: ResultDetail[]) {
    selectedResources.forEach((item) => {
      item.homeValue = (Number(item.homeValue)).toString();
      item.awayValue = (Number(item.awayValue)).toString();
    });

    const betStatus = this.badmintonService.getBetStatus(false, this.match);
    const childMatchIds = this.childMatchSelected.map(item => item.matchId).join(',');
    this.doSaveScoreAndCalculate(CalculateAction.calculate, selectedResources, betStatus, childMatchIds);
  }

  private async doSaveScoreAndCalculate(type: string, resource: ResultDetail[], betStatus: string, childMatchIds: string) {
    const resultWithoutTotalPoints = this.noTotalPoints;
    const scoresToSave = this.verificationService.getChangedScores(resultWithoutTotalPoints, this.match.originalResultDetail);
    const checkedScores = this.verificationService.getOutsideScores(resultWithoutTotalPoints);
    const saveScoreQuery: SaveScoreQuery = {
      matchId: this.match.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: this.apiKeys.NormalMatch
    };

    const result = await this.aioService.saveScore(saveScoreQuery);
    if (result.isSuccessful) {
      resource = _.filter(resource, item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints));
      const query = new SettleQuery(this.match.matchDetail.matchId, resource, type, this.isReSettledTickets, this.match.matchDetail.sportType, this.match.isScoreDirect);
      query.isLeader = this.isLeader;
      query.betStatus = betStatus;
      query.childMatchIds = childMatchIds;
      const pushResult = await this.aioService.push(query);
      if (pushResult.isSuccessful) {
        await this.handleChildMatch(query, type);
        this.settleHedgeMatch(query);
      } else {
        this.toastrService.error(pushResult.errMsg);
      }
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public saveScore() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.eSports.saveScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveScore();
    });
  }

  private async doSaveScore() {
    const resultWithoutTotalPoints = this.match.resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.totalPoints));
    const scoresToSave = this.verificationService.getChangedScores(resultWithoutTotalPoints, this.match.originalResultDetail);
    const checkedScores = this.verificationService.getOutsideScores(resultWithoutTotalPoints);
    const query: SaveScoreQuery = {
      matchId: this.match.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: this.apiKeys.NormalMatch
    };

    const result = await this.aioService.saveScore(query);
    if (result.isSuccessful) {
      this.match.resultDetails.forEach((map) => {
        map.checked = false;
      });
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private confirmUncalculation() {
    this.match.isClickOnCalculate = false;
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doUncalculation(this.selectedResources);
    });
  }

  private doUncalculation(selectedResources: ResultDetail[]) {
    selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });

    const betStatus = this.badmintonService.getBetStatus(true, this.match);
    const childMatchIds = this.childMatchSelected.map(item => item.matchId).join(',');
    this.sendRequest(CalculateAction.unCalculate, selectedResources, betStatus, childMatchIds);
  }

  private async sendRequest(type: string, resource: ResultDetail[], betStatus: string, childMatchIds: string): Promise<void> {
    resource = _.filter(resource, item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints));
    const query = new SettleQuery(this.match.matchDetail.matchId, resource, type, this.isReSettledTickets, this.match.matchDetail.sportType, this.match.isScoreDirect);
    query.isLeader = this.isLeader;
    query.betStatus = betStatus;
    query.childMatchIds = childMatchIds;
    const result = await this.aioService.push(query);
    if (result.errCode === 0) {
      await this.handleChildMatch(query, type);
      this.settleHedgeMatch(query);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private settleHedgeMatch(query: SettleQuery) {
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      query.isHedgeMatch = true;
      this.aioService.push(query).then(() => {
        this.messageBoxService.closePopup();
      });
    } else {
      this.messageBoxService.closePopup();
    }
  }

  private enableUncalculateButton() {
    return this.match.resultDetails.filter((map) => map.checked).length > 0;
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
    const intervals = resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.totalGames)
      && !_.isEqual(map.resourceId, ResourcesIds.totalPoints));
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
    if ((_.isEmpty(this.totalGames.homeValue) && _.isEmpty(this.totalGames.awayValue))
      && (isOnload && this.totalGames.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
      this.verificationService.autoFillScore(this.totalGames);
    }
  }

  public changeScore() {
    const maps = this.match.resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourcesIds.totalGames)
      && !_.isEqual(item.resourceId, ResourcesIds.totalPoints)
      && this.verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));
      
    if (!this.match.isScoreDirect) {
      this.verificationService.sumTotalResultWin(maps, ResourcesIds.GameOne, this.totalGames);
      this.verificationService.sumTotalScores(maps, ResourcesIds.GameOne, this.totalPoints);
    }
    this.checkConsistent();
    this.totalGames.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalGames);
    this.totalPoints.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalPoints);
  }

  public verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    const originalGame = _.cloneDeep(map);
    this.verificationService.autoFillScore(map);
    if (isOnLoad) {
      if (this.totalGames.settlementStatusId === SettlementStatusId.Calculated
        || this.totalGames.settlementStatusId === SettlementStatusId.Refund) {
        this.totalGames.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalGames);
      } else {
        this.adjustFinalScoreOnChange(isOnLoad);
      }
    } else {
      map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
      if (!_.isEqual(originalGame.homeValue, map.homeValue) || !_.isEqual(originalGame.awayValue, map.awayValue)) {
        this.adjustFinalScoreOnChange();
      }
    }
  }

  public generateOutsideTotalPoints() {
    const firstSet = this.match.resultDetails[0];
    _.forEach(firstSet.externalScores, (score) => {
      this.updateOutsideScore(score.sourceId, true);
    });
    this.totalPoints.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalPoints);
  }

  public updateOutsideScore(sourceId: number, IsOnLoad = false) {
    const outsideResults: ExternalResultDetail[] = [];
    this.match.resultDetails.forEach((item) => {
      const outsideResult = _.find(item.externalScores, (score) => score.sourceId === sourceId);
      if (outsideResult && !_.isEqual(item.resourceId, ResourcesIds.totalGames)
        && !_.isEqual(item.resourceId, ResourcesIds.totalPoints)
        && this.verificationService.isExistedHomeAwayScore(outsideResult.homeValue, outsideResult.awayValue)) {
        outsideResults.push(outsideResult);
      }
    });
    const totalPointsOutside = _.find(this.totalPoints.externalScores, (score) => score.sourceId === sourceId);
    const totalGameOutside = _.find(this.totalGames.externalScores.slice(3), (score) => score.sourceId === sourceId);
    if (totalPointsOutside) {
      this.verificationService.sumTotalScores(outsideResults, ResourcesIds.GameOne, totalPointsOutside);
      this.verifyAndAutoFillScore(this.totalPoints, false);
    }

    if (totalGameOutside && (IsOnLoad &&
      !this.verificationService.isExistedHomeAwayScore(totalGameOutside.homeValue, totalGameOutside.awayValue))
      || (!IsOnLoad && !this.match.isScoreDirect)) {
      this.verificationService.sumTotalResultWin(outsideResults, ResourcesIds.GameOne, totalGameOutside);
      this.verifyAndAutoFillScore(this.totalGames, true);
    }
  }

  public checkMapIsMatched(map: ResultDetail) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    this.changeScore();
  }

  public getClass(resultDetail: ResultDetail) {
    const className = this.verificationService.isFullTimeMismatched(this.noTotalPoints, this.match.isScoreDirect,
      ResourcesIds.totalGames, false)
      ? 'col-mismatched ' : '';

    return className + this.badmintonService.getIntervalBackground(resultDetail.settlementStatusId);
  }

  public isFinalScoreDisabled(set: ResultDetail, outsideSource = false) {
    if (_.isEqual(set.resourceId, ResourcesIds.totalPoints)) {
      return true;
    }

    return this.isLeader || outsideSource ? _.isEqual(set.resourceId, ResourcesIds.totalGames)
      ? !this.match.isScoreDirect : this.match.isScoreDirect : true;
  }

  public isErrorOnVerification(resultDetail: ResultDetail, score: string) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourcesIds.totalGames) {
      disabled = !this.match.isScoreDirect;
    }
    return this.match.isClickOnCalculate && !disabled && resultDetail.checked && _.isEmpty(score);
  }

  public changeInputDirectly() {
    this.match.resultDetails.forEach((map) => {
      map.checked = this.match.isScoreDirect && _.isEqual(map.resourceId, ResourcesIds.totalGames);
    });
    this.checkConsistent();
    this.enableUncalculate = this.enableUncalculateButton();
  }

  public getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  public isSaveScoreDisabled() {
    return !this.match.resultDetails.find((map) => map.checked);
  }

  public isConfirmed(resultDetail: ResultDetail) {
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalPoints)) {
      return this.match.permission.isLeader && this.totalGames.resultSettingData.isConfirmedRefund;
    } else {
      return this.match.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    } 
  }

  private checkConsistent() {
    this.match.childMatches.forEach(item =>
      item.isNotConsistent = this.verificationService.isChildMatchNotConsistent(this.match.resultDetails, item));
  }

  private get childMatchSelected(): ChildMatch[] {
    return _.filter(this.match.childMatches, item => item.checked);
  }

  public getChildMatchesClass(child: ChildMatch) {
    if (child.isNotConsistent) {
      return "not-consistent";
    } else {
      return child.resultStatusId === ResultStatusId.RunningThree ||
        (child.confirmFT > 0 && !_.isNil(child.betStatus) && !_.isEmpty(child.betStatus)) ? "consistent" : "";
    }
  }

  public collapseChildMatch() {
    this.collapse = !this.collapse;
  }

  private createMatchResource() {
    if (this.match.matchDetail.sportType === SportType.volleyBall) {
      const list = [];
      this.childMatchSelected.forEach(item => {
        const childMatch = new MatchResource();
        childMatch.matchId = item.matchId;
        childMatch.resourceIds = [item.resourceId];
        list.push(childMatch);
      });
      return list;
    }
    return [];
  }

  private async handleChildMatch(settleQuery: SettleQuery, type: string) {
    if (this.childMatchSelected.length > 0 && type === CalculateAction.calculate) {
      const settleChildMatchQuery = new SettleChildMatchQuery(this.childMatchSelected,
        settleQuery.actionName, settleQuery.isReSettledTickets, settleQuery.selectedResources);
      await this.aioService.pushChildMatch(settleChildMatchQuery);
    }
  }
}

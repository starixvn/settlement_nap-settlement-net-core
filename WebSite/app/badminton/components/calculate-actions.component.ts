import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { CalculateCommonModule } from './../../shared/modules/calculate-common.module';
import { BlockUIService } from './../../shared/services/block-ui.service';
import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, AioService, IntervalCalculationService } from '../../shared/services';
import { MatchResource, ModalDialogMessage, Result, Sport } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { SettlementStatusId, CalculateAction, SportType, ResultStatusId, ScoreSourceType, TicketStatusText, ResultStatus, EventStatus } from '../../shared/constants';
import { Match, HedgeMatchDetail, SettleQuery, ChildMatch, SettleChildMatchQuery } from '../models';
import { ResourceNameByIdPipe } from '../pipes';
import { BadmintonService, VerificationService } from '../services';
import { BadmintonApiKeys, KickOffTime, ResourcesIds, Resources, VolleyballApiKeys, TableTennisApiKeys, BeachVolleyballApiKeys } from '../constants';
import { ExternalResultDetail, Permission, ResultDetail, SaveScoreQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { UrlHelper } from '../../helper';
import { ResultPipe } from '../../shared/pipes/result.pipe';
import { SourceIds } from '../../basketball/constants/source-ids';
import { ChildMatchComponent } from './child-match/child-match.component';
import { UpdateSettlementResultHistoryStatus } from '../../shared/models/update-settle-result-history-status';
import { OverStatus } from '../../shared/constants/over-status.native';
import { AutoSelectResultsService } from '../../shared/services/auto-select-results.service.native';

@Component({
  selector: 'calculation-actions',
  templateUrl: './calculate-actions.component.html',
  standalone: true,
  imports: [CalculateCommonModule, ResultPipe, ResourceNameByIdPipe, CalculateMatchDetailComponent, ChildMatchComponent],
  providers: [BadmintonService, VerificationService, IntervalCalculationService]
})
export class CalculateActionsComponent implements SportTemplate, OnInit {

  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;
  private readonly aioService = inject(AioService);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly badmintonService = inject(BadmintonService);
  private readonly verificationService = inject(VerificationService);
  private readonly toastrService = inject(ToastrService);
  private readonly blockUIService = inject(BlockUIService);
  private readonly autoSelectResultsService = inject(AutoSelectResultsService);

  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  readonly confirmDialogWithActionOnNoBtn: ModalDialogMessage = new ModalDialogMessage();
  readonly totalPointsId = ResourcesIds.totalPoints;
  match: Match;
  hedgeMatchDetail: HedgeMatchDetail;
  isReSettledTickets: boolean;
  applyHedgeMatch: boolean;
  enableUncalculate: boolean;
  isLeader: boolean;
  disableScoreDirect: boolean;
  isReadyMatch: boolean;
  permission: Permission;
  apiKeys = null;
  collapse = false;
  blockUI = true;
  SOURCE_ID = SourceIds;
  public isSettleRelated = true;
  public sportTypes = SportType;
  sportWithPassiveChildMatch = [SportType.tableTennis, SportType.beachVolleyball];
  private settleRunningChildMatchOnly = false;
  filterOverStatus = '';

  constructor() {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
  }

  ngOnInit(): void {
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.confirmDialogWithActionOnNoBtn.title = Language.confirmationBox;
    this.confirmDialogWithActionOnNoBtn.hasActionOnNoBtn = true;
    this.toastrService.overlayContainer = this.toastContainer;
  }

  async getMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.filterOverStatus = UrlHelper.getUrlParameter('overStatus');

    this.getApiKeys(sportType);

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

  private getApiKeys(sportType: number) {
    switch (sportType) {
      case SportType.tableTennis:
        this.apiKeys = TableTennisApiKeys;
        break;
      case SportType.volleyBall:
        this.apiKeys = VolleyballApiKeys;
        break;
      case SportType.beachVolleyball:
        this.apiKeys = BeachVolleyballApiKeys;
        break;
      default:
        this.apiKeys = BadmintonApiKeys;
    }
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

  init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.permission = this.match.permission;
    this.match.resultDetails = this.badmintonService.getResultDetail(this.match.resultDetails);


    this.verificationService.generateExternalScores(this.match, this.match.resultDetails, this.match.matchDetail.sportType, this.maxProviderCol);
    this.resetHomeAway(this.noTotalPoints);
    this.enableUncalculate = this.enableUncalculateButton();
    this.disableScoreDirect = this.verificationService.isTicketOnGame(
      this.match.resultDetails, ResourcesIds.totalPoints, ResourcesIds.totalGames);
    this.isLeader = this.match.permission.isLeader;
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.autoFillScoreOnLoad(this.match.resultDetails);
    this.generateOutsideTotalPoints();
    this.checkChildrenMatchesConsistent();
    this.autoInputDirectly();
    this.match.childMatches.forEach(item => item.resourceId = ResourcesIds.totalGames);

    this.autoSelectResultsService.selectByOverStatus(this.match.resultDetails, this.totalGames, this.filterOverStatus);

    // this.autoSelectResultsByOverStatus();
  }
  
  private autoSelectResultsByOverStatus() {
    const finalResult = this.match.resultDetails.find(item => item.resourceId === ResourcesIds.totalGames);
    const settledResultStatusIds = [ResultStatusId.ManualCompleted, ResultStatusId.AutoCompleted];
    const isFinalSettledResult = finalResult && !settledResultStatusIds.includes(finalResult.resultStatusId);

    const overStatusArray = this.filterOverStatus.split(',');

    if (overStatusArray.includes(OverStatus.MainOver)) {
      this.match.resultDetails.forEach(item => {
        item.checked = item.checked 
          || isFinalSettledResult
          || item.resultStatusId === ResultStatusId.TraderConfirm;
      });
    }

    if (overStatusArray.includes(OverStatus.Over)) {
      this.match.resultDetails.forEach(item => {
        item.checked = item.checked || !settledResultStatusIds.includes(item.resultStatusId);
      });
    }

    if (overStatusArray.includes(OverStatus.SettledWithRunningTicket)) {
      this.match.resultDetails.forEach(item => {
        item.checked = item.checked 
          || item.settlementStatusId === SettlementStatusId.Calculated && item.ticketStatus === TicketStatusText.running;
      });
    }
  }

  get noTotalPoints(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.totalPoints));
  }

  get selectedResources(): ResultDetail[] {
    return _.filter(this.match.resultDetails, (map: ResultDetail) => map.checked);
  }

  get totalPoints(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalPoints));
  }

  get totalGames(): ResultDetail {
    return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalGames));
  }

  get outSideCount() {
    return this.match.resultDetails[0].externalScores.filter(x =>
      x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
  }

  get maxProviderCol() {
    return this.match.matchDetail.providerCount > 2 ? 3 : 2;
  }

  get sportType() {
    return this.match.matchDetail.sportType;
  }

  private autoInputDirectly() {
    if (this.disableScoreDirect) {
      return;
    }
    const { parentId, sportType } = this.match.matchDetail;

    if (parentId !== 0 && this.sportWithPassiveChildMatch.includes(sportType)) {
      this.match.isScoreDirect = true;
      this.changeInputDirectly();
    }

  }

  private resetHomeAway(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      const hideScore = map.settlementStatusId === SettlementStatusId.Refund
        || (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted);
      map.homeValue = hideScore ? "" : map.homeValue;
      map.awayValue = hideScore ? "" : map.awayValue;
    });
  }

  public selectedOnLastMap(map: ResultDetail) {
    this.totalPoints.checked = !this.match.isScoreDirect && this.totalGames.checked;
    const newFullTimeScore = this.verificationService.getNewFinalResource(this.noTotalPoints, ResourcesIds.totalGames, false)

    const confirmMessage = this.verificationService.verifyFinalResource(
      this.noTotalPoints,
      ResourcesIds.totalGames,
      newFullTimeScore,
      this.sportType === SportType.tableTennis ? "Total Set" : "Total Game");

    if (!_.isEmpty(confirmMessage) && !this.match.isScoreDirect) {
      this.confirmationDialogMessage.message = confirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.verificationService.changeToNewFinalResource(this.totalGames, newFullTimeScore);
      });
    }
    this.selectedOnMap(map);
  }

  async calculate() {
    this.toastrService.clear();
    this.match.isClickOnCalculate = true;
    const existResultConfirmed = _.find(this.selectedResources, item => !_.isEqual(item.resourceId, ResourcesIds.totalPoints)
      && item.resultSettingData.isConfirmedRefund);
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Resources.UnSelectedMapForCalculation);
      return;
    }
    if (!_.isNil(existResultConfirmed)) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
      return;
    }

    if (this.verificationService.invalidInputScore(this.selectedResources, this.match.isScoreDirect, ResourcesIds.totalGames)) {
      this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
      return;
    }

    if (this.verificationService.isFTDrawWithInputNormal(this.totalGames, this.match.isScoreDirect)) {
      this.verifyScenarioWhenFTDraw();
      return;
    }

    await this.ProcessBasedOnChildMatchSelected();
  }

  private verifyScenarioWhenFTDraw() {
    if (this.permission.isLeader) {
      this.confirmationDialogMessage.message = Language.sop.leader.finalIsDraw;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
        await this.ProcessBasedOnChildMatchSelected();
      });
    } else {
      this.toastrService.error(Language.sop.nonLeader.finalIsDraw);
    }
  }

  private async ProcessBasedOnChildMatchSelected() {
    if (this.childMatchSelected.length > 0) {
      this.verifyChildMatch();
    } else {
      await this.verifyRunningOdds();
    }
  }


  private verifyChildMatch() {
    if (this.match.isScoreDirect) {
      this.toastrService.error(Language.directlyWithChildMAtch);
      return;
    }

    const existConsistentChildMatch = this.verificationService.verifyConsistentChildMatch(this.match.resultDetails, this.childMatchSelected);

    if (existConsistentChildMatch && this.sportType == SportType.volleyBall) {
      this.toastrService.error(Language.consistentRelatedMatch);
      return;
    }

    if (this.verificationService.verifyCannotSettleChildMatch(this.childMatchSelected, this.sportType)) {
      this.toastrService.error(Language.cannotSettleChildMatch);
      return;
    }

    if (this.sportType == SportType.volleyBall) {
      this.confirmationDialogMessage.message = Language.confirmChildMatch;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.verifyRunningOdds();
      });
    }

    this.verifyRunningOdds();
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

  uncalculate() {
    this.toastrService.clear();
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Language.NotSelectUncalculationTypeMessage);
    } else {
      this.confirmUncalculation();
    }
  }

  private verifyScoreSourcesAndCalculate() {
    if (!this.verificationService.allMapHaveScreenshotSource(this.selectedResources)) {
      this.toastrService.error(Language.sop.notScreenshot);
      return;
    }

    if (this.verificationService.isExistMismatchedScoreScreenshot(this.selectedResources)) {
      this.toastrService.error(Language.sop.mismatchedScreenshot);
      return;
    }

    if (this.verificationService.allMapHaveScoreSources(this.selectedResources)) {
      this.confirmCalculateMismatchScores();
    } else if (this.isLeader) {
      this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.confirmCalculateMismatchScores();
      });
    } else {
      this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
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

  public selectedOnMap(map: ResultDetail) {
    this.enableUncalculate = this.enableUncalculateButton();
    this.match.isClickOnCalculate = false;
    this.autoSelectChildMatch(map);
  }

  private async confirmChangedResults() {
    const badmintonResultDetails = _.filter(this.match.resultDetails, { checked: true });
    if (this.isReSettledTickets) {
      this.confirmChildMatchCalculation(badmintonResultDetails);
      return;
    }

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
      return;
    }

    this.confirmChildMatchCalculation(badmintonResultDetails);
  }

  private confirmChildMatchCalculation(resultDetails: ResultDetail[]) {
    const { sportType } = this.match.matchDetail;
    const sportApplied = this.sportWithPassiveChildMatch.includes(sportType);
    if (!sportApplied || this.childMatchSelected.length == 0 || !this.isSettleRelated) {
      this.confirmCalculation(resultDetails);
      return;
    }

    const existConsistentChildMatch = this.verificationService.verifyConsistentChildMatch(this.match.resultDetails, this.childMatchSelected);
    const existCalculatedChildMatch = this.childMatchSelected.some(item => item.eventStatus.toLowerCase() == EventStatus.completed.toLowerCase());
    if (existConsistentChildMatch) {
      this.confirmationDialogMessage.message = Language.confirmOverwriteChildMatch;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        existCalculatedChildMatch ? this.confirmSettleAndRunningChildMatch(resultDetails) : this.confirmSettleOnlyRunningChildMatch(resultDetails);
      });
    } else {
      existCalculatedChildMatch ? this.confirmSettleAndRunningChildMatch(resultDetails) : this.confirmSettleOnlyRunningChildMatch(resultDetails);
    }
  }

  private confirmSettleAndRunningChildMatch(resultDetails: ResultDetail[]) {
      this.confirmDialogWithActionOnNoBtn.message = Language.confirmReCalcChildMatch;
      this.confirmDialogWithActionOnNoBtn.hasActionOnNoBtn = true;
      this.messageBoxService.confirm(this.confirmDialogWithActionOnNoBtn, () => {
        this.confirmCalculation(resultDetails);
        this.settleRunningChildMatchOnly = false;
      }, () => {
        this.confirmCalculation(resultDetails);
        this.settleRunningChildMatchOnly = true;
      });
  }

  private confirmSettleOnlyRunningChildMatch(resultDetails: ResultDetail[]) {
    this.confirmationDialogMessage.message = Language.confirmRelatedChildMatch;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmCalculation(resultDetails);
    });
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
    const childMatchIds = this.childMatchSelected.filter(item => this.settleRunningChildMatchOnly ? item.eventStatus.toLowerCase() !== EventStatus.completed.toLowerCase() : true)
      .map(item => item.matchId).join(',');
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
      query.isSettleRelated = this.isSettleRelated;

      const pushResult = await this.aioService.push(query);
      if (pushResult.isSuccessful) {
        await this.handleChildMatch(query, type);
        await this.updateStatusResultAmendments(this.match, pushResult);
        this.settleHedgeMatch(query);
      } else {
        this.toastrService.error(pushResult.errMsg);
      }
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async updateStatusResultAmendments(match: Match, settledResult: Result) {
    const request = new UpdateSettlementResultHistoryStatus(
      match.matchDetail.matchId, 
      settledResult.settledSessionId, 
      match.matchDetail.sportType, 
      settledResult.isOrg);    

      if(settledResult.hasResultAmendment) {
        await this.aioService.updateSettlementResultHistoryStatus(request);
      }
  }


  saveScore() {
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
      this.changeIsSettleRelated(false);
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

  onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
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

  changeScore() {
    const maps = this.match.resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourcesIds.totalGames)
      && !_.isEqual(item.resourceId, ResourcesIds.totalPoints)
      && this.verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));

    if (!this.match.isScoreDirect) {
      this.verificationService.sumTotalResultWin(maps, ResourcesIds.GameOne, this.totalGames);
      this.verificationService.sumTotalScores(maps, ResourcesIds.GameOne, this.totalPoints);
    }
    this.checkChildrenMatchesConsistent();
    this.totalGames.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalGames);
    this.totalPoints.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalPoints);
  }

  verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
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

  generateOutsideTotalPoints() {
    const firstSet = this.match.resultDetails[0];
    _.forEach(firstSet.externalScores, (score) => {
      this.updateOutsideScore(score.sourceId, true);
    });
    this.totalPoints.isScoreMismatched = this.verificationService.isMismatchedWarning(this.totalPoints);
  }

  updateOutsideScore(sourceId: number, IsOnLoad = false) {
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
    const totalGameOutside = _.find(this.totalGames.externalScores.slice(this.maxProviderCol + 1), (score) => score.sourceId === sourceId);
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

  checkMapIsMatched(map: ResultDetail) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    this.changeScore();
  }

  getClass(resultDetail: ResultDetail) {
    const className = this.verificationService.isFullTimeMismatched(this.noTotalPoints, this.match.isScoreDirect,
      ResourcesIds.totalGames, false)
      ? 'col-mismatched ' : '';

    return className + this.badmintonService.getIntervalBackground(resultDetail.settlementStatusId);
  }

  isFinalScoreDisabled(set: ResultDetail, outsideSource = false) {
    if (_.isEqual(set.resourceId, ResourcesIds.totalPoints)) {
      return true;
    }

    return this.isLeader || outsideSource ? _.isEqual(set.resourceId, ResourcesIds.totalGames)
      ? !this.match.isScoreDirect : this.match.isScoreDirect : true;
  }

  isErrorOnVerification(resultDetail: ResultDetail, score: string) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourcesIds.totalGames) {
      disabled = !this.match.isScoreDirect;
    }
    return this.match.isClickOnCalculate && !disabled && resultDetail.checked && _.isEmpty(score);
  }

  changeInputDirectly() {
    this.match.resultDetails.forEach((map) => {
      map.checked = this.match.isScoreDirect && _.isEqual(map.resourceId, ResourcesIds.totalGames);
    });
    this.match.childMatches.forEach(item => {
      item.checked = this.match.isScoreDirect
        && _.isEqual(item.relatedResourceId, ResourcesIds.totalPoints)
        && this.isSettleRelated
        && this.isSupportSettleRelated;
    });
    this.checkChildrenMatchesConsistent();
    this.enableUncalculate = this.enableUncalculateButton();
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  isSaveScoreDisabled() {
    return !this.match.resultDetails.find((map) => map.checked);
  }

  isConfirmed(resultDetail: ResultDetail) {
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalPoints)) {
      return this.match.permission.isLeader && this.totalGames.resultSettingData.isConfirmedRefund;
    } else {
      return this.match.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }
  }

  private checkChildrenMatchesConsistent() {
    this.match.childMatches.forEach(item =>
      item.isNotConsistent = this.verificationService.isChildMatchNotConsistent(this.match.resultDetails, item)
    );
  }

  private get childMatchSelected(): ChildMatch[] {
    return _.filter(this.match.childMatches, item => item.checked);
  }

  public get isSupportSettleRelated() {
    return this.sportWithPassiveChildMatch.includes(this.match.matchDetail.sportType)
      && this.match.matchDetail.parentId === 0;
  }

  collapseChildMatch() {
    this.collapse = !this.collapse;
  }

  getChildMatchesClass(child: ChildMatch) {
    if (child.isNotConsistent) {
      return "not-consistent";
    } else {
      return child.resultStatusId === ResultStatusId.RunningThree ||
        (child.confirmFT > 0 && !_.isNil(child.betStatus) && !_.isEmpty(child.betStatus)) ? "consistent" : "";
    }
  }


  private createMatchResource() {
    const { sportType } = this.match.matchDetail;
    const sportHasChildMatch = [SportType.tableTennis, SportType.volleyBall, SportType.beachVolleyball];
    if (sportHasChildMatch.includes(sportType)) {
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
    const validatedChildMatches = this.settleRunningChildMatchOnly ? this.childMatchSelected.filter(x => x.newEventStatus.toLowerCase() !== EventStatus.completed.toLowerCase()) : this.childMatchSelected;
    if (validatedChildMatches.length > 0 && type === CalculateAction.calculate) {
      this.mapScoreChildMatch(validatedChildMatches);
      const settleChildMatchQuery = new SettleChildMatchQuery(validatedChildMatches,
        settleQuery.actionName, settleQuery.isReSettledTickets, settleQuery.selectedResources);
      settleChildMatchQuery.parentMatchId = settleQuery.matchId;
      settleChildMatchQuery.sportType = settleQuery.sportType;
      await this.aioService.pushChildMatch(settleChildMatchQuery);
    }
  }

  private mapScoreChildMatch(validatedChildMatches: ChildMatch[]){
    validatedChildMatches.forEach(item => {
      const relatedResource = this.match.resultDetails.filter(i => item.relatedResourceId == i.resourceId);
      item.homeValue = relatedResource[0].homeValue;
      item.awayValue = relatedResource[0].awayValue;
    })
  }

  public canSettleResult(result: ResultDetail) {
    const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
      || _.isEqual(result.resultStatus, ResultStatus.noResult)
      || _.isEqual(result.resultStatus, ResultStatus.running);


    return isRunning
      && !result.isScoreMismatched
      && this.verificationService.isValidTraderConfirmScore(result);
  }
  private autoSelectChildMatch(result: ResultDetail) {
    if (!this.isSupportSettleRelated || !this.isSettleRelated) {
      return;
    }

    const childMatch = this.match.childMatches.find(x => x.relatedResourceId === result.resourceId);
    if (childMatch) {
      childMatch.checked = result.checked;
    }
  }

  public openInfo() {
    this.confirmationDialogMessage.title = Language.information;
    this.confirmationDialogMessage.message = Language.childMatchTableTennisInfo;
    this.messageBoxService.alert(this.confirmationDialogMessage);
  }

  changeIsSettleRelated($event: boolean) {
    if ($event) {
      this.selectedResources.forEach(item => {
        this.autoSelectChildMatch(item);
      })
      return;
    }

    this.match.childMatches.forEach(item => {
      item.checked = false;
    })
  }
}

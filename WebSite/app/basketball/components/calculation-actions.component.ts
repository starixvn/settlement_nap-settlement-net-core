import { Component, Injector, ViewChild, inject } from "@angular/core";
import * as _ from "lodash";
import {
  MessageBoxService,
  AioService,
  BlockUIService,
} from "../../shared/services";
import { ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language.native";
import {
  CalculateAction,
  SettingPosition,
  SettlementStatusId,
  SportType,
} from "../../shared/constants";
import {
  BasketballService,
  BetStatusService,
  VerificationService,
  CashOutService,
  GenerateCashOutService,
} from "../services";
import { BasketballApiKeys, KickOffTime, ResourcesIds } from "../constants";
import {
  GetTicketInfoQuery,
  Match,
  VoidBetInfo,
  VoidBetQuery,
  CashOutResultUpdateQuery,
} from "../models";
import {
  MatchDetail,
  HedgeMatchDetail,
  ResultDetail,
  SaveScoreQuery,
  SportTemplate,
  ExternalResultDetail,
  SettleQuery,
} from "../../shared/models/sportsbook-sop";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { ExternalSourceNamePipe } from "../../shared/pipes/external-source-name.pipe";
import { ResourceNameByIdPipe } from "../pipes/resource-name-by-id.pipe";
import { CalculationMatchDetailComponent } from "./calculation-match-detail.component";
import { CalculateCommonModule } from "../../shared/modules/calculate-common.module";
import { RelatedMatchesComponent } from "./fantasy/related-matches.compoment";
import { FantasyMatch } from "../models/fantasy.model";

@Component({
  selector: "calculation-actions",
  templateUrl: "./calculation-actions.component.html",
  standalone: true,
  imports: [
    CalculateCommonModule,
    CalculationMatchDetailComponent,
    ExternalSourceNamePipe,
    ResourceNameByIdPipe,
    RelatedMatchesComponent,
  ],
  providers: [
    BasketballService,
    ResourceNameByIdPipe,
    BetStatusService,
    VerificationService,
    CashOutService,
    GenerateCashOutService,
  ],
})
export class CalculationActionsComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;
  private basketballService = inject(BasketballService);
  private messageBoxService = inject(MessageBoxService);
  private betStatusService = inject(BetStatusService);
  private aioService = inject(AioService);
  private cashOutService = inject(CashOutService);
  private verificationService = inject(VerificationService);
  private toastrService = inject(ToastrService);
  private blockUiService = inject(BlockUIService);
  readonly overTimeId = ResourcesIds.ot;
  blockUI = false;
  match: Match;
  matchDetail: MatchDetail;
  fantasyMatch: FantasyMatch;
  hedgeMatchDetail: HedgeMatchDetail;
  applyHedgeMatch: boolean;
  isDisabledUndo: boolean;
  isReSettledTickets: boolean;
  resultDetails: ResultDetail[];
  isLeader: boolean;
  disableScoreDirect: boolean;
  isReadyMatch: boolean;
  readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

  async getMatch(matchId: number) {
    this.initService();
    const matchQuery = {
      matchId,
      apikey: BasketballApiKeys.normalMatch,
      sportType: SportType.basketBall,
      settleType: "MNL",
    };
    this.match = (await this.aioService.getMatch(matchQuery)) as Match;
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.cloneResultDetail();
    this.init();
  }

  initService() {
    this.toastrService.overlayContainer = this.toastContainer;
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.blockUiService.blockUIEvent.subscribe(
      (event: boolean) => (this.blockUI = event)
    );
  }

  private cloneResultDetail() {
    this.match.resultDetails.forEach((map) => {
      if (map.settlementStatusId === SettlementStatusId.Calculated) {
        map.originalHomeValue = _.clone(map.homeValue);
        map.originalAwayValue = _.clone(map.awayValue);
      } else {
        map.originalHomeValue = "0";
        map.originalAwayValue = "0";
      }
    });
  }

  init() {
    this.resultDetails = this.basketballService.getResultDetail(
      this.match.resultDetails
    );
    this.verificationService.generateExternalScores(
      this.match,
      this.resultDetails,
      SportType.cricket
    );
    this.resetHomeAway(this.resultDetails);
    this.matchDetail = this.match.matchDetail;
    this.fantasyMatch = (this.match as any).fantasyMatch;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.disableScoreDirect = this.verificationService.isTicketOnQuarter(
      this.resultDetails,
      this.match.resultDetails
    );
    this.overTime.ticketStatus = this.fullTime.ticketStatus;
    this.isLeader = this.match.permission.isLeader;
    this.isDisabledUndo = this.basketballService.isDisabledUndoButton(
      this.resultDetails
    );
    this.match.originalResultDetail = _.cloneDeep(this.resultDetails);
    this.autoFillScoreOnLoad(this.resultDetails);
  }

  get selectedResources(): ResultDetail[] {
    return _.filter(this.resultDetails, (map: ResultDetail) => map.checked);
  }

  get firstHalf() {
    return _.find(this.resultDetails, (map: ResultDetail) =>
      _.isEqual(map.resourceId, ResourcesIds.htScore)
    );
  }

  get fullTime() {
    return _.find(this.resultDetails, (map: ResultDetail) =>
      _.isEqual(map.resourceId, ResourcesIds.finalScore)
    );
  }

  get firstHalfResults() {
    return _.filter(
      this.resultDetails,
      (map: ResultDetail) =>
        _.isEqual(map.resourceId, ResourcesIds.quarter1) ||
        _.isEqual(map.resourceId, ResourcesIds.quarter2)
    );
  }

  get quarterResults() {
    return _.filter(
      this.resultDetails,
      (map: ResultDetail) =>
        !_.isEqual(map.resourceId, ResourcesIds.htScore) &&
        !_.isEqual(map.resourceId, ResourcesIds.finalScore)
    );
  }

  get quartersWithoutOverTime() {
    return _.filter(
      this.resultDetails,
      (map: ResultDetail) =>
        !_.isEqual(map.resourceId, ResourcesIds.htScore) &&
        !_.isEqual(map.resourceId, ResourcesIds.finalScore) &&
        !_.isEqual(map.resourceId, ResourcesIds.ot)
    );
  }

  get quartersWithoutHalfTime() {
    return _.filter(
      this.resultDetails,
      (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.htScore)
    );
  }

  get overTime() {
    return _.find(this.resultDetails, (map: ResultDetail) =>
      _.isEqual(map.resourceId, ResourcesIds.ot)
    );
  }

  autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
    const intervals = resultDetails.filter(
      (map) =>
        !_.isEqual(map.resourceId, ResourcesIds.htScore) &&
        !_.isEqual(map.resourceId, ResourcesIds.finalScore)
    );

    _.forEach(this.firstHalf.externalScores, (item) =>
      this.autofillOutsideSource(item.sourceId)
    );

    if (intervals.length > 0) {
      _.forEach(intervals, (map) => {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(
          map
        );
        if (this.statusNotRefunded(map.settlementStatusId)) {
          this.verifyAndAutoFillScore(map, true);
        }
      });
    } else {
      this.adjustHalfTimeScoreOnChange(true);
      this.adjustFinalScoreOnChange(true);
    }
  }

  private statusNotRefunded(settlementStatusId: number) {
    return (
      settlementStatusId !== SettlementStatusId.Refund &&
      settlementStatusId !== SettlementStatusId.RefundSettleDetermined
    );
  }

  private adjustFinalScoreOnChange(isOnload = false) {
    this.verificationService.sumScoreFullTime(
      this.quarterResults,
      this.fullTime
    );
    this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(
      this.fullTime
    );
    if (
      _.isEmpty(this.fullTime.homeValue) &&
      _.isEmpty(this.fullTime.awayValue) &&
      ((isOnload && this.statusNotRefunded(this.fullTime.settlementStatusId)) ||
        !isOnload)
    ) {
      this.verificationService.autoFillScore(this.fullTime);
    }
  }

  private adjustHalfTimeScoreOnChange(isOnload = false) {
    this.verificationService.sumScoreHalfTime(
      this.firstHalfResults,
      this.firstHalf
    );
    this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(
      this.firstHalf
    );
    if (
      _.isEmpty(this.firstHalf.homeValue) &&
      _.isEmpty(this.firstHalf.awayValue) &&
      ((isOnload &&
        this.statusNotRefunded(this.firstHalf.settlementStatusId)) ||
        !isOnload)
    ) {
      this.verificationService.autoFillScore(this.firstHalf);
    }
  }

  verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    const originalQuarter = _.cloneDeep(map);
    this.verificationService.autoFillScore(map);
    if (isOnLoad) {
      this.checkHalfScoreOnLoad();
    } else {
      map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
      if (
        !_.isEqual(originalQuarter.homeValue, map.homeValue) ||
        !_.isEqual(originalQuarter.awayValue, map.awayValue)
      ) {
        this.adjustHalfTimeScoreOnChange();
        this.adjustFinalScoreOnChange();
      }
    }
  }

  autofillOutsideSource(externalSourceId: number, isChange = false) {
    const firstHalfResult = this.basketballService.getExternalResults(
      this.firstHalfResults,
      externalSourceId
    );
    const fullTimeResults = this.basketballService.getExternalResults(
      this.quarterResults,
      externalSourceId
    );
    const firstHalf = _.find(
      this.firstHalf.externalScores.slice(3),
      (item) => item.sourceId === externalSourceId
    );
    const fulltime = _.find(
      this.fullTime.externalScores.slice(3),
      (item) => item.sourceId === externalSourceId
    );

    if (
      firstHalf &&
      (this.changeScoreOnQuarter(isChange) ||
        this.onLoadAndCheckScore(isChange, firstHalf))
    ) {
      this.verificationService.sumScoreHalfTime(firstHalfResult, firstHalf);
      this.verifyAndAutoFillScore(this.firstHalf, !isChange);
    }

    if (
      fulltime &&
      (this.changeScoreOnQuarter(isChange) ||
        this.onLoadAndCheckScore(isChange, fulltime))
    ) {
      this.verificationService.sumScoreFullTime(fullTimeResults, fulltime);
      this.verifyAndAutoFillScore(this.fullTime, true);
    }
  }

  private changeScoreOnQuarter(isChange: boolean) {
    return isChange && !this.match.isScoreDirect;
  }

  private onLoadAndCheckScore(
    isChange: boolean,
    externalScores: ExternalResultDetail
  ) {
    return (
      !isChange &&
      !this.verificationService.isExistedHomeAwayScore(
        externalScores.homeValue,
        externalScores.awayValue
      )
    );
  }

  private checkHalfScoreOnLoad() {
    if (
      this.firstHalf.settlementStatusId === SettlementStatusId.Calculated ||
      this.firstHalf.settlementStatusId === SettlementStatusId.Refund ||
      this.firstHalf.settlementStatusId ===
        SettlementStatusId.RefundSettleDetermined
    ) {
      this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(
        this.firstHalf
      );
    } else {
      this.adjustHalfTimeScoreOnChange(true);
    }

    if (
      this.fullTime.settlementStatusId === SettlementStatusId.Calculated ||
      this.fullTime.settlementStatusId === SettlementStatusId.Refund ||
      this.fullTime.settlementStatusId ===
        SettlementStatusId.RefundSettleDetermined
    ) {
      this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(
        this.fullTime
      );
    } else {
      this.adjustFinalScoreOnChange(true);
    }
  }

  getClass(resultDetail: ResultDetail) {
    let className: string;
    className =
      this.isFullTimeMismatched() || this.isHalfTimeMismatched()
        ? "col-mismatched "
        : "";
    if (
      _.isEqual(resultDetail.resourceId, ResourcesIds.htScore) ||
      _.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)
    ) {
      className = this.verificationService.isFtScoreLowerThanHtScore(
        this.firstHalf,
        this.fullTime
      )
        ? "not-consistent "
        : className;
    }

    return (
      className +
      this.basketballService.getIntervalBackground(
        resultDetail.settlementStatusId
      )
    );
  }

  isFinalScoreDisabled(resourceId: string, outsideSource = false) {
    return this.isLeader || outsideSource
      ? _.isEqual(resourceId, ResourcesIds.finalScore) ||
        _.isEqual(resourceId, ResourcesIds.htScore)
        ? !this.match.isScoreDirect
        : this.match.isScoreDirect
      : true;
  }

  isFullTimeMismatched() {
    return this.verificationService.isFullTimeMismatched(
      this.quartersWithoutHalfTime,
      this.match.isScoreDirect,
      ResourcesIds.finalScore,
      true
    );
  }

  private isHalfTimeMismatched() {
    return this.verificationService.isHalfTimeMismatched(
      this.resultDetails,
      this.firstHalfResults,
      this.match.isScoreDirect
    );
  }

  isSaveScoreDisabled() {
    return !this.resultDetails.find((map) => map.checked);
  }

  saveScore() {
    this.confirmationDialogMessage.message = Language.eSports.saveScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveScore();
    });
  }

  private async doSaveScore() {
    const scoresToSave = this.verificationService.getChangedScores(
      this.resultDetails,
      this.match.originalResultDetail
    );
    const checkedScores = this.verificationService.getOutsideScores(
      this.resultDetails
    );
    const query: SaveScoreQuery = {
      matchId: this.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: BasketballApiKeys.normalMatch,
    };

    const result = await this.aioService.saveScore(query);
    if (!result.isSuccessful) {
      this.toastrService.error(result.errMsg);
    } else {
      this.resultDetails.forEach((map) => {
        map.checked = false;
      });
    }
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  calculate() {
    this.toastrService.clear();
    this.match.isClickOnCalculate = true;
    const existResultConfirmed = _.find(
      this.selectedResources,
      (item) =>
        (item.resultSettingData.isConfirmedRefund ||
          item.resultSettingData.isConfirmedRefundSdt) &&
        !_.isEqual(item.resourceId, ResourcesIds.ot)
    );
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Language.NotSelectCalculationTypeMessage);
    } else if (!_.isNil(existResultConfirmed)) {
      this.toastrService.error(
        Language.confirmRefund.calculateResultNotConfirmed
      );
    } else if (
      this.verificationService.isInputScoreInvalid(
        this.selectedResources,
        this.match.isScoreDirect
      )
    ) {
      this.toastrService.error(
        this.isLeader
          ? Language.sop.leader.blankScore
          : Language.sop.nonLeader.blankScore
      );
    } else if (
      this.verificationService.isFtScoreLowerThanHtScore(
        this.firstHalf,
        this.fullTime,
        false
      )
    ) {
      this.toastrService.error(Language.inconsistentValues);
    } else if (
      this.verificationService.verifyIntervalsCalculated(
        this.firstHalf,
        this.firstHalfResults,
        this.match.isScoreDirect
      ) ||
      this.verificationService.verifyIntervalsCalculated(
        this.fullTime,
        this.quartersWithoutOverTime,
        this.match.isScoreDirect
      )
    ) {
      this.toastrService.error(Language.IntervalWarning);
    } else {
      this.verifyRunningOdds();
    }
  }

  private async verifyRunningOdds() {
    const selectedResourceIds = this.getOddResources();
    const errorMessage = await this.aioService.checkingNoRunningOdds(
      this.matchDetail.matchId,
      selectedResourceIds,
      CalculateAction.calculate
    );
    if (_.isNil(errorMessage)) {
      this.verifyScoreSourcesAndCalculate();
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private getOddResources() {
    return this.selectedResources
      .filter((item) => !_.isEqual(item.resourceId, ResourcesIds.ot))
      .map((item) => item.resourceId);
  }

  private verifyScoreSourcesAndCalculate() {
    if (this.verificationService.allMapHaveScoreSources(this.resultDetails)) {
      this.confirmCalculateMismatchScores();
    } else {
      if (!this.isLeader) {
        this.toastrService.error(
          Language.eSports.nonLeader.insufficientSources
        );
      } else {
        this.confirmationDialogMessage.message =
          Language.eSports.leader.insufficientSources;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmCalculateMismatchScores();
        });
      }
    }
  }

  private confirmCalculateMismatchScores() {
    if (this.verificationService.isExistMismatchScore(this.resultDetails)) {
      if (!this.isLeader) {
        this.toastrService.error(Language.eSports.nonLeader.mismatchedScore);
      } else {
        this.confirmationDialogMessage.message =
          Language.eSports.leader.mismatchedScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmChangedResults();
        });
      }
    } else {
      this.confirmChangedResults();
    }
  }

  private async confirmChangedResults() {
    if (this.isReSettledTickets) {
      this.confirmCalculation(this.selectedResources);
    } else {
      const getBasketballResultQuery = {
        matchId: this.matchDetail.matchId,
        apikey: BasketballApiKeys.normalMatch,
        sportType: SportType.basketBall,
      };
      const noOverTime = this.selectedResources.filter(
        (quarter) => !_.isEqual(quarter.resourceId, ResourcesIds.ot)
      );
      const needConfirm = await this.aioService.verifyChangedSettledTickets(
        noOverTime,
        getBasketballResultQuery
      );
      if (needConfirm) {
        this.confirmationDialogMessage.message =
          Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(this.selectedResources);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    this.confirmationDialogMessage.message = this.basketballService.confirmationMessage(
      resultDetails
    );
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doCalculation(this.selectedResources);
    });
  }

  private doCalculation(selectedResources: ResultDetail[]) {
    selectedResources.forEach((item) => {
      item.homeValue = Number(item.homeValue).toString();
      item.awayValue = Number(item.awayValue).toString();
    });

    const betStatus = this.betStatusService.getBetStatus(
      false,
      this.match,
      this.resultDetails
    );
    this.doSaveScoreAndCalculate(
      CalculateAction.calculate,
      selectedResources,
      betStatus
    );
  }

  private async doSaveScoreAndCalculate(
    actionName: string,
    selectedResources: ResultDetail[],
    betStatus: string
  ) {
    const scoresToSave = this.verificationService.getChangedScores(
      this.resultDetails,
      this.match.originalResultDetail
    );
    const checkedScores = this.verificationService.getOutsideScores(
      this.resultDetails
    );
    const saveScoreQuery: SaveScoreQuery = {
      matchId: this.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: BasketballApiKeys.normalMatch,
    };

    const saveScoreResult = await this.aioService.saveScore(saveScoreQuery);
    if (!saveScoreResult.isSuccessful) {
      this.toastrService.error(saveScoreResult.errMsg);
    } else {
      const query = this.createRequestQuery(
        actionName,
        selectedResources,
        betStatus
      );
      const getTicketInfos = await this.getTicketInfo(query);
      const result = await this.aioService.push(query);
      if (result.isSuccessful) {
        await this.voidBet(getTicketInfos, actionName);
        await this.cashOutResultUpdate(selectedResources, betStatus);
        this.calculateHedgeMatch(query);
      } else {
        this.toastrService.error(result.errMsg);
      }
    }
  }

  private createRequestQuery(
    actionName: string,
    resource: ResultDetail[],
    betStatus
  ) {
    const query = new SettleQuery(
      this.matchDetail,
      resource,
      actionName,
      this.isReSettledTickets,
      betStatus,
      BasketballApiKeys.settle,
      this.match.permission.isLeader
    );
    query.isDirectly = this.match.isScoreDirect;
    query.determinedType = this.setDeterminedType(actionName);
    return query;
  }

  private setDeterminedType(actionName: string) {
    const isInstant =
      this.matchDetail.autoSetting > 1
        ? this.matchDetail.autoSetting.toString(2).split("").reverse()[
            SettingPosition.instant
          ] === "1"
        : false;
    return _.isEqual(actionName, CalculateAction.calculate) && isInstant
      ? this.aioService.generateDeterminedType(this.resultDetails)
      : 0;
  }

  changeScore(map: ResultDetail) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    if (!this.match.isScoreDirect) {
      this.verificationService.sumScoreHalfTime(
        this.firstHalfResults,
        this.firstHalf
      );
      this.verificationService.sumScoreFullTime(
        this.quarterResults,
        this.fullTime
      );
      this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(
        this.fullTime
      );
      this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(
        this.firstHalf
      );
    }
  }

  private async sendRequest(
    actionName: string,
    resource: ResultDetail[],
    betStatus: string
  ): Promise<void> {
    const query = this.createRequestQuery(actionName, resource, betStatus);
    const getTicketInfos = await this.getTicketInfo(query);
    const result = await this.aioService.push(query);
    if (result.isSuccessful) {
      await this.voidBet(getTicketInfos, actionName);
      this.calculateHedgeMatch(query);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async getTicketInfo(query: SettleQuery) {
    const getTicketQuery = new GetTicketInfoQuery(
      query.matchId,
      query.selectedResources as ResultDetail[],
      query.actionName,
      query.determinedType
    );
    return (await this.cashOutService.getTicketInfo(
      getTicketQuery
    )) as VoidBetInfo[];
  }

  private async voidBet(voidBetInfos: VoidBetInfo[], actionName: string) {
    if (voidBetInfos.length > 0) {
      const voidBetQuery = new VoidBetQuery(
        this.matchDetail,
        actionName,
        voidBetInfos
      );
      await this.cashOutService.voidBet(voidBetQuery);
    }
  }

  private async cashOutResultUpdate(
    resource: ResultDetail[],
    betStatus: string
  ) {
    const isVirtualMatch =
      this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) ||
      this.verificationService.isSabaMatch(this.matchDetail.leagueGroupId);
    const final = resource.filter(
      (map) => _.isEqual(map.resourceId, ResourcesIds.finalScore) && map.checked
    );
    if (
      final.length > 0 &&
      !isVirtualMatch &&
      this.matchDetail.parentId === 0
    ) {
      if (this.match.isScoreDirect) {
        betStatus = this.cashOutService.getDirectBetStatusOnCalc(
          this.firstHalf,
          this.fullTime
        );
      }

      const query = new CashOutResultUpdateQuery(
        this.matchDetail.matchId,
        betStatus
      );
      await this.cashOutService.calc(query);
    }
  }

  private calculateHedgeMatch(query: SettleQuery) {
    const hedgeMatchId = this.applyHedgeMatch
      ? this.match.hedgeMatchDetail.matchId
      : 0;
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

  uncalculate() {
    this.toastrService.clear();
    if (_.isEmpty(this.selectedResources)) {
      this.toastrService.error(Language.NotSelectUncalculationTypeMessage);
    } else {
      this.confirmUncalculation();
    }
  }

  private confirmUncalculation() {
    this.match.isClickOnCalculate = false;
    this.confirmationDialogMessage.message =
      Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doUncalculation();
    });
  }

  private doUncalculation() {
    this.selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });
    const betStatus = this.betStatusService.getBetStatus(
      true,
      this.match,
      this.resultDetails
    );

    this.sendRequest(
      CalculateAction.unCalculate,
      this.selectedResources,
      betStatus
    );
  }

  selectedOnMap(quarter: ResultDetail) {
    this.match.isClickOnCalculate = false;
    this.isDisabledUndo = this.basketballService.isDisabledUndoButton(
      this.resultDetails
    );
    if (quarter.resourceId === ResourcesIds.htScore && quarter.checked) {
      this.verificationService.verifyScore(
        quarter,
        true,
        this.match.isScoreDirect,
        this.resultDetails
      );
    }

    if (quarter.resourceId === ResourcesIds.finalScore) {
      if (quarter.checked) {
        this.verificationService.verifyScore(
          quarter,
          false,
          this.match.isScoreDirect,
          this.resultDetails
        );
      }
      if (!this.match.isScoreDirect) {
        this.overTime.checked = quarter.checked;
      }
    }
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  disableCheckbox(resultDetail: ResultDetail) {
    return (
      this.match.isScoreDirect &&
      !_.isEqual(resultDetail.resourceId, ResourcesIds.htScore) &&
      !_.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)
    );
  }

  private resetHomeAway(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      const needReset =
        this.basketballService.isFinalSdt(map, this.quarterResults) ||
        map.settlementStatusId === SettlementStatusId.Refund;
      map.homeValue = needReset ? "" : map.homeValue;
      map.awayValue = needReset ? "" : map.awayValue;
    });
  }

  changeInputDirectly() {
    this.quarterResults.forEach((map) => {
      map.checked = false;
    });

    if (!this.match.isScoreDirect) {
      this.overTime.checked = this.fullTime.checked;
    }
  }

  isErrorOnVerification(
    resultDetail: ResultDetail,
    score: string,
    remainingScore: string
  ) {
    let disabled = this.match.isScoreDirect;
    let isScoreEmpty = _.isEmpty(score);
    if (
      _.isEqual(resultDetail.resourceId, ResourcesIds.htScore) ||
      _.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)
    ) {
      disabled = !this.match.isScoreDirect;
    }

    if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
      isScoreEmpty = _.isEmpty(score) && !_.isEmpty(remainingScore);
    }

    return (
      this.match.isClickOnCalculate &&
      !disabled &&
      resultDetail.checked &&
      isScoreEmpty
    );
  }

  disableTextBox(resourceId: string) {
    if (this.match.isScoreDirect) {
      return (
        !_.isEqual(resourceId, ResourcesIds.htScore) &&
        !_.isEqual(resourceId, ResourcesIds.finalScore)
      );
    }

    return (
      _.isEqual(resourceId, ResourcesIds.finalScore) ||
      _.isEqual(resourceId, ResourcesIds.htScore)
    );
  }

  getTextBoxClass(resourceId: string) {
    if (resourceId === ResourcesIds.finalScore) {
      return "final-score-input";
    }

    if (resourceId === ResourcesIds.htScore) {
      return "ht-score-input";
    }

    return "quarter-input";
  }

  getTextBoxMaxLength(resourceId: string) {
    return resourceId === ResourcesIds.finalScore ||
      resourceId === ResourcesIds.htScore
      ? 3
      : 2;
  }

  isConfirmed(resultDetail: ResultDetail) {
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
      return (
        this.match.permission.isLeader &&
        (this.fullTime.resultSettingData.isConfirmedRefund ||
          this.fullTime.resultSettingData.isConfirmedRefundSdt)
      );
    } else {
      return (
        this.match.permission.isLeader &&
        (resultDetail.resultSettingData.isConfirmedRefund ||
          resultDetail.resultSettingData.isConfirmedRefundSdt)
      );
    }
  }

  public getErrorMsg(value: string) {
    if (!_.isEmpty(value)) {
      this.toastrService.error(value);
    } else {
      this.toastrService.clear();
    }
  }

  public autoFillFantasyMatch(score) {
    this.resultDetails = this.resultDetails.map((result) => {
      const findScore = score.find(
        (score) => score.resourceId == result.resourceId
      );

      return findScore
        ? {
            ...result,
            homeValue: (findScore.homeValue ?? "0").toString(),
            awayValue: (findScore.awayValue ?? "0").toString(),
          }
        : { ...result };
    });

    this.resultDetails.forEach(map => {
      map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    })
  }
}

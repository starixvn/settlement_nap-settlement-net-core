import { Injector } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import { Match, SettleQuery, SettleChildMatchQuery } from '../models';
import * as _ from 'lodash';
import { Language } from '../../shared/language';
import { ItemsSelect } from '../../shared/models';
import { ResultStatusId, CalculateAction, SportType } from '../../shared/constants';
import { EarlyConstraintService, VerificationService } from '../services';
import { ApiKeys, KickOffTime, ResourcesIds, ResultControlGroup, ResultStatus, TicketStatus } from '../constants';
import { ExternalResultDetail, ResultDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { EarlyCommonModule } from '../../shared/modules/early-common.module';
import { MatchDetailComponent } from './match-detail.component';
import { ResultValuePipe, ResultByPlayerNamePipe } from '../pipes';
import { BlockUIService } from '../../shared/services/block-ui.service';

@Component({
  selector: 'early-settlement',
  templateUrl: './early-settlement.component.html',
  standalone: true,
  imports: [EarlyCommonModule, MatchDetailComponent, ResultValuePipe, ResultByPlayerNamePipe],
  providers: [EarlyConstraintService, ResultValuePipe, ResultByPlayerNamePipe, VerificationService]
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private earlyConstraintService: EarlyConstraintService;
  private verificationService: VerificationService;
  public match: Match;
  public matchClone: Match;
  public isShowRefundButton = false;
  public isReadyMatch: boolean;
  constructor(
    protected injector: Injector,
    protected verificationBaseService: VerificationBaseService) {
    super(injector, verificationBaseService);
  }

  async getMatch(matchId: number): Promise<void> {
    this.initService();
    const matchQuery = {
      matchId,
      settleType: "EAR",
      apiKey: ApiKeys.NormalMatch
    };
    const match$ = this.aioService.getMatch(matchQuery);
    this.match = await lastValueFrom(match$) as Match;
    this.init();
  }

  private initService() {
    this.earlyConstraintService = this.injector.get(EarlyConstraintService);
    this.verificationService = this.injector.get(VerificationService);
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
  }

  private init() {
    const maxLength = 2;
    this.matchClone = _.cloneDeep(this.match);
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.permission = this.match.permission;
    this.matchId = this.match.matchDetail.matchId;
    this.matchDetail = this.match.matchDetail;
    this.match.resultDetails = this.match.resultDetails.filter((map) => map.resourceId.length > maxLength);
    this.verificationBaseService.generateExternalScores(this.match, this.match.resultDetails, SportType.cricket);
    this.resetResult(this.match.resultDetails);
    this.resultDetails = this.match.resultDetails;
    this.earlyConstraintService.generateMultipleResultSelect(this.resultDetails);
    this.autoFillResultOnLoad(this.match.resultDetails);
    this.groupMap = this.earlyConstraintService.getGroupMap(this.match.resultDetails, this.match.matchDetail);
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.hideTicketWaiting(this.groupMap);
    this.renderFilterSelect();
  }

  private renderFilterSelect() {
    this.ticketsStatusSelect.items = this.earlyConstraintService.renderTicketStatus();
    this.resultStatusSelect.items = this.earlyConstraintService.renderResultStatus(this.match.permission);
    this.resultTypeSelect.items = this.earlyConstraintService.renderResultType(this.groupMap);
    this.resultTypeSelect.maxWidth = '210px';
    this.ticketsStatusSelect.maxWidth = '92px';
    this.resultStatusSelect.maxWidth = '120px';
  }

  private resetResult(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      map.homeValue = map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted
        ? "" : map.homeValue;
      map.awayValue = map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted
        ? "" : map.awayValue;

      this.upperCaseResult(map);
    });
  }

  private upperCaseResult(map: ResultDetail) {
    map.homeValue = map.homeValue?.toUpperCase();
    map.externalScores.forEach(result => {
      result.homeValue = result.homeValue?.toUpperCase();
    });
  }

  public async calculate() {
    this.toastrService.clear();
    const errorMessage = await this.earlyConstraintService.verifyBeforeCalculation(this.selectedResources, this.permission.isLeader);
    this.earlyConstraintService.getOtherInfo(this.selectedResources);
    if (_.isEmpty(errorMessage)) {
      const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
      this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSources());
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private verifyScoreSources() {
    if (this.verificationService.allResultsHaveScoreSources(this.match.resultDetails)) {
      this.confirmCalculateMismatchScores(() => this.confirmChangedResults());
    } else {
      if (!this.permission.isLeader) {
        this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
      } else {
        this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.confirmCalculateMismatchScores(() => this.confirmChangedResults());
        });
      }
    }
  }

  private getConfirmMessage(resultDetails: ResultDetail[]) {
    let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      let value: string;
      if (x.inputType === ResultControlGroup.HomeAway) {
        value = _.isEqual(x.homeValue, "H") ? this.match.matchDetail.homeName :
          _.isEqual(x.homeValue, "A") ? this.match.matchDetail.awayName : "None";
      } else if (x.inputType === ResultControlGroup.CoupleScores) {
        value = `${x.homeValue}-${x.awayValue}`;
      } else if (x.inputType === ResultControlGroup.PlayerSelect || x.inputType === ResultControlGroup.PlayerMultipleSelect) {
        value = this.earlyConstraintService.getPlayerResultName(x);
      } else if (x.inputType === ResultControlGroup.ScoreWithLabel) {
        value = `${x.homeName}: ${x.homeValue}`;
      } else {
        value = this.earlyConstraintService.getResultNameByValue(x);
      }
      confirmMessage += `${x.betTypeName}: ${value}<br/>`;
    });

    return confirmMessage;
  }

  private async confirmChangedResults() {
    if (this.isReSettledTickets) {
      this.confirmCalculation(this.selectedResources);
    } else {
      const getEarlyResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: ApiKeys.NormalMatch,
        sportType: SportType.cricket,
      };
      const needConfirm = await this.aioService.verifyChangedSettledTickets(this.selectedResources, getEarlyResultQuery);
      if (needConfirm) {
        this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(this.selectedResources);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    this.confirmationDialogMessage.message = this.getConfirmMessage(resultDetails);
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      const query = new SettleQuery(this.match.matchDetail.matchId,
        this.selectedResources,
        CalculateAction.earlyCalculate,
        this.isReSettledTickets,
        this.permission.isLeader, false);

      this.doSaveResult(CalculateAction.calculate,
        this.match.originalResultDetail,
        this.match.resultDetails,
        ApiKeys.NormalMatch, () => {
          this.push(query);
        });
    });
  }

  public unCalculate() {
    this.toastrService.clear();
    this.getUncalculateMessage();
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.selectedResources.forEach((map) => {
        map.homeValue = "";
        map.awayValue = "";
      });
      const query = new SettleQuery(this.match.matchDetail.matchId,
        this.selectedResources,
        CalculateAction.earlyUnCalculate,
        this.isReSettledTickets,
        this.permission.isLeader, false);
      this.push(query);
    });
  }

  public async refund() {
    this.toastrService.clear();
    if (this.allResultConfirmed()) {
      this.checkMarkedTickets(this.selectedResources, () => this.createQueryRefundAndPush());
    } else {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    }
  }

  private createQueryRefundAndPush() {
    const query = new SettleQuery(this.match.matchDetail.matchId,
      this.selectedResources,
      CalculateAction.earlyRefund,
      this.isReSettledTickets,
      this.permission.isLeader, false);
    this.push(query);
  }

  private async push(query: SettleQuery) {
    const result = await this.aioService.push(query);
    if (result.isSuccessful) {
      this.handleChildMatch(result.childMatchIds, query);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async handleChildMatch(childMatchIds: string, settleQuery: SettleQuery) {
    if (!_.isEmpty(childMatchIds)) {
      const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
        settleQuery.actionName, settleQuery.isReSettledTickets);
      await this.aioService.pushChildMatch(settleChildMatchQuery);
    }
  }

  public saveScore() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.eSports.saveScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveResult('', this.match.originalResultDetail, this.match.resultDetails,
        ApiKeys.NormalMatch, () => { });
    });
  }

  public canSettleResult(result: ResultDetail) {
    const isRunning = _.isEqual(result.ticketStatus, TicketStatus.running)
      || _.isEqual(result.resultStatus, ResultStatus.noResult) || _.isEqual(result.resultStatus, ResultStatus.running);
    return isRunning && !result.isScoreMismatched && !_.isNil(this.verificationService.isExistInhouseResult(result));
  }

  public checkResultIsMatched(resultDetail: ResultDetail) {
    const isExistedCoupleResult = resultDetail.inputType === ResultControlGroup.CoupleScores;
    const valueIsString = this.valueIsString(resultDetail.inputType);
    resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail, isExistedCoupleResult, valueIsString);
  }


  public autoFillResultOnLoad(resultDetails: ResultDetail[]) {
    _.forEach(resultDetails, (resultDetail) => {
      this.verifyAndAutoFillResult(resultDetail);
    });
  }

  public verifyAndAutoFillResult(resultDetail: ResultDetail) {
    this.match.matchDetail.isSavedScore = false;
    if (resultDetail.resultStatusId !== ResultStatusId.ManualCompleted && resultDetail.resultStatusId !== ResultStatusId.AutoCompleted) {
      resultDetail.homeValue = '';
      resultDetail.awayValue = '';
      this.verificationService.autoFillItemSelect(resultDetail);
    }
    const isExistedCoupleResult = resultDetail.inputType === ResultControlGroup.CoupleScores;
    const valueIsString = this.valueIsString(resultDetail.inputType);
    resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail, isExistedCoupleResult, valueIsString);
    this.verificationService.autoFillScore(resultDetail, isExistedCoupleResult);
    resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail, isExistedCoupleResult, valueIsString);
  }

  public getColSpanGroupMap() {
    if (this.permission.canUncalculate || this.permission.canCalculate || this.permission.canRefund) {
      return this.permission.isLeader ? this.match.resultDetails[0].externalScores.length + 4
        : this.permission.isTrader ? this.match.resultDetails[0].externalScores.length + 2
          : this.match.resultDetails[0].externalScores.length + 1;
    } else if (this.permission.isTrader) {
      return 4;
    }
    return 0;
  }

  public saveTraderScore() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.eSports.traderScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveTraderScore();
    });
  }

  private async doSaveTraderScore() {
    const scoresToSave = this.verificationBaseService.getChangedTraderScores(this.match.resultDetails, this.match.originalResultDetail);
    const checkedScores = this.verificationBaseService.getTraderScores(this.match.resultDetails);
    const query = {
      matchId: this.match.matchDetail.matchId,
      scoresToSave,
      checkedScores,
      apiKey: ApiKeys.NormalMatch,
      isTrader: true
    };

    const result = await this.aioService.saveScore(query);
    if (result.isSuccessful) {
      this.autoUncheckAfterFilter();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public changeTraderScore(resultDetail: ResultDetail) {
    const isExistedCoupleResult = resultDetail.inputType === ResultControlGroup.CoupleScores;
    const valueIsString = this.valueIsString(resultDetail.inputType);
    if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
      if (resultDetail.resultStatusId !== ResultStatusId.ManualCompleted && resultDetail.resultStatusId !== ResultStatusId.AutoCompleted) {
        resultDetail.homeValue = '';
        resultDetail.awayValue = '';
        this.verificationService.autoFillItemSelect(resultDetail);
      }
      resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail, isExistedCoupleResult, valueIsString);
      this.verificationService.autoFillScore(resultDetail, isExistedCoupleResult);
      resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail, isExistedCoupleResult, valueIsString);
    }
  }

  public hasNoneOption(resultDetail: ResultDetail) {
    return ResourcesIds.hasNoneOption.includes(resultDetail.resourceId);
  }

  public onSelectPlayerResult(value: ItemsSelect[], resultDetail: ResultDetail) {
    const result = value.length > 0 ? value.map(item => item.value).join(',') : '';
    resultDetail.homeValue = result;
    this.checkResultIsMatched(resultDetail);
  }

  public onTraderSelectPlayerResult(value: ItemsSelect[], resultDetail: ResultDetail, traderResult: ExternalResultDetail) {
    const result = value.length > 0 ? value.map(item => item.value).join(',') : '';
    traderResult.homeValue = result;
    this.changeTraderScore(resultDetail);
  }

  public onOutsideSelectPlayerResult(value: ItemsSelect[], resultDetail: ResultDetail, externalResultDetail: ExternalResultDetail) {
    const result = value.length > 0 ? value.map(item => item.value).join(',') : '';
    externalResultDetail.homeValue = result;
    this.verifyAndAutoFillResult(resultDetail);
  }

  private valueIsString(inputType: number) {
    return inputType === ResultControlGroup.HomeAway ||
      inputType === ResultControlGroup.CaughtOrNot ||
      inputType === ResultControlGroup.PlayerSelect ||
      inputType === ResultControlGroup.PlayerMultipleSelect ||
      inputType === ResultControlGroup.SixWay ||
      inputType === ResultControlGroup.YesNo;
  }
}
import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Match, SettleQuery } from '../models';
import * as _ from 'lodash';
import { Language } from '../../shared/language';
import { MessageBoxService, AioService } from '../../shared/services';
import { Result } from '../../shared/models';
import {
  ResultStatusId, CalculateAction, SportType, TicketStatusText
} from '../../shared/constants';
import { EarlyConstraintService, VerificationService } from '../services';
import { BadmintonApiKeys, InputType, KickOffTime, ResultStatus, VolleyballApiKeys, VolleyballBetTypes } from '../constants';
import { ResultDetail, HedgeMatchDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { UrlHelper } from '../../helper';

@Component({
  selector: 'early-settlement',
  templateUrl: './early-settlement.component.html',
  providers: [
    EarlyConstraintService,
    EarlyBaseService,
  ],
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: Match;
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  public isShowRefundButton = false;
  public isReadyMatch: boolean;
  public originalMatch: Match;
  public apiKeys = null;

  constructor(
    private readonly earlyConstraintService: EarlyConstraintService,
    protected verificationService: VerificationService,
    protected messageBoxService: MessageBoxService,
    protected aioService: AioService,
    protected toastrService: ToastrService) {
    super(messageBoxService, verificationService, aioService, toastrService);
  }

  async getMatch(matchId: number): Promise<void> {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.apiKeys = sportType === SportType.volleyBall ? VolleyballApiKeys : BadmintonApiKeys;
    this.toastrService.overlayContainer = this.toastContainer;
    const matchQuery = {
      matchId,
      sportType,
      settleType: "EAR",
      apiKey: this.apiKeys.NormalMatch
    };

    this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
    this.originalMatch = _.cloneDeep(this.match);
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.init();
  }

  public init() {
    const maxLength = 5;
    this.matchDetail = this.match.matchDetail;
    this.matchId = this.matchDetail.matchId;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.permission = this.match.permission;
    this.match.resultDetails = this.earlyConstraintService.getEarlyResultDetails(this.match.resultDetails,
      this.matchDetail.sportType, maxLength);
    this.verificationBaseService.generateExternalScores(this.match, this.match.resultDetails, this.matchDetail.sportType);
    this.resetResult(this.match.resultDetails);
    this.autoFillResultOnLoad(this.match.resultDetails);
    this.groupMap = this.getGroupMap();
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.resultDetails = this.match.resultDetails;
    this.hideTicketWaiting(this.groupMap);
    this.renderFilterSelect();
  }

  private getGroupMap() {
    return this.matchDetail.sportType === SportType.volleyBall
      ? this.earlyConstraintService.getGroupMapByGroupName(this.match.resultDetails)
      : this.earlyConstraintService.getGroupMapBySets(this.match.resultDetails);
  }

  private renderFilterSelect() {
    this.resultTypeSelect.items = this.earlyConstraintService.renderResultType(this.groupMap);
    this.resultStatusSelect.items = this.earlyConstraintService.renderResultStatus(this.match.permission);
    this.ticketsStatusSelect.items = this.earlyConstraintService.renderTicketStatus();
    this.resultTypeSelect.maxWidth = '150px';
    this.ticketsStatusSelect.maxWidth = '92px';
    this.resultStatusSelect.maxWidth = '120px';
  }

  private resetResult(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      map.awayValue = map.resultStatusId !== ResultStatusId.ManualCompleted
      && map.resultStatusId !== ResultStatusId.AutoCompleted ? "" : map.awayValue;
      map.homeValue = map.resultStatusId !== ResultStatusId.ManualCompleted
      && map.resultStatusId !== ResultStatusId.AutoCompleted ? "" : map.homeValue;
    });
  }

  public async calculate() {
    this.toastrService.clear();
    const errorMessage = await this.earlyConstraintService.verifyBeforeCalculation(this.selectedResources, this.permission.isLeader);

    if (_.isEmpty(errorMessage)) {
      const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
      this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSourcesAndCalculate(() => this.confirmChangedResults()));
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private async confirmChangedResults() {
    if (this.isReSettledTickets) {
      this.confirmCalculation(this.selectedResources, this.permission.isLeader);
    } else {
      const getEarlyResultQuery = {
        matchId: this.matchId,
        apikey: this.apiKeys.NormalMatch,
        sportType: this.matchDetail.sportType,
      };
      const needConfirm = await this.aioService.verifyChangedSettledTickets(this.selectedResources, getEarlyResultQuery).toPromise();
      if (needConfirm) {
        this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(this.selectedResources, this.permission.isLeader);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[], isLeader: boolean) {
    this.confirmationDialogMessage.message = this.earlyConstraintService.getConfirmMessage(resultDetails, this.matchDetail);
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      const query = new SettleQuery(this.matchId,
        this.selectedResources,
        CalculateAction.earlyCalculate,
        this.isReSettledTickets);
      query.isLeader = isLeader;
      this.doSaveResult(CalculateAction.calculate, this.match.originalResultDetail, this.match.resultDetails,
        this.apiKeys.NormalMatch, () => {
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
      const query = new SettleQuery(this.matchId,
        this.selectedResources,
        CalculateAction.earlyUnCalculate,
        this.isReSettledTickets);
      query.isLeader = this.permission.isLeader;
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
    const query = new SettleQuery(this.matchId,
      this.selectedResources,
      CalculateAction.earlyRefund,
      this.isReSettledTickets);
    query.isLeader = this.permission.isLeader;
    this.push(query);
  }

  private async push(query: SettleQuery) {
    if(_.isEqual(this.matchDetail.sportType, SportType.volleyBall)){
      query.betStatus = this.matchDetail.betStatus;
    }
    const result = await this.aioService.push(query).toPromise() as Result;
    if (result.errCode === 0) {
      this.pushHedgeMatch(query);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private pushHedgeMatch(query: SettleQuery) {
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      this.aioService.push(query).toPromise().then(() => {
        this.messageBoxService.closePopup();
      });
    } else {
      this.messageBoxService.closePopup();
    }
  }

  public saveResult() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.eSports.saveScore;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.doSaveResult('', this.match.originalResultDetail, this.match.resultDetails, this.apiKeys.NormalMatch, () => { });
    });
  }

  public canSettleResult(result: ResultDetail) {
    const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
      || _.isEqual(result.resultStatus, ResultStatus.noResult) || _.isEqual(result.resultStatus, ResultStatus.running);
    return isRunning && !result.isScoreMismatched && !_.isNil(this.verificationService.isExistInhouseResult(result));
  }

  public autoFillResultOnLoad(resultDetails: ResultDetail[]) {
    _.forEach(resultDetails, (resultDetail) => {
        this.verifyAndAutoFillResult(resultDetail);
    });
  }

  public verifyAndAutoFillResult(resultDetail: ResultDetail) {
    this.match.matchDetail.isSavedScore = false;
    if (resultDetail.inputType === InputType.coupleScore) {
      resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail);
      this.verificationService.autoFillScore(resultDetail);
      resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail);
    } else {
      this.verificationService.autoFillEarlyResult(resultDetail);
      resultDetail.isScoreMismatched = this.verificationService.isEarlyMismatchedWarning(resultDetail);
    }
  }

  public checkResultIsMatched(resultDetail: ResultDetail) {
    const isExistedCoupleResult = resultDetail.inputType === InputType.coupleScore;
    resultDetail.isScoreMismatched = isExistedCoupleResult
        ? this.verificationService.isMismatchedWarning(resultDetail)
        : this.verificationService.isEarlyMismatchedWarning(resultDetail);
  }

  public verifyResultByBetType(resultDetail: ResultDetail) {
    resultDetail.isResultWarningByBetType = this.earlyConstraintService.isBetTypesResultInvalid(resultDetail);
  }
}

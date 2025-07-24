import { Component, ViewChild, Injector } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import { Match, SettleQuery } from '../models';
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { BlockUIService, IntervalCalculationService } from '../../shared/services';
import {
  ResultStatusId, CalculateAction, SportType, TicketStatusText,
  ScoreSourceType
} from '../../shared/constants';
import { BadmintonService, EarlyConstraintService, VerificationService } from '../services';
import { BadmintonApiKeys, InputType, KickOffTime, ResultStatus, VolleyballApiKeys } from '../constants';
import { ResultDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { UrlHelper } from '../../helper';
import { MatchDetailComponent } from './match-detail.component';
import { EarlyCommonModule } from '../../shared/modules/early-common.module';
import { UpdateSettlementResultHistoryStatus } from '../../shared/models/update-settle-result-history-status';
import { Result } from '../../shared/models';

@Component({
  selector: 'early-settlement',
  templateUrl: './early-settlement.component.html',
  standalone: true,
  imports: [EarlyCommonModule, MatchDetailComponent],
  providers: [
    EarlyConstraintService,
    EarlyBaseService,
    VerificationService,
    IntervalCalculationService,
    BadmintonService
  ],
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private earlyConstraintService: EarlyConstraintService
  public match: Match;
  public isShowRefundButton = false;
  public isReadyMatch: boolean;
  public originalMatch: Match;
  public apiKeys = null;

  constructor(protected injector: Injector,
    protected verificationService: VerificationService) {
    super(injector, verificationService);
  }

  async getMatch(matchId: number): Promise<void> {
    this.initService();
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.apiKeys = sportType === SportType.volleyBall ? VolleyballApiKeys : BadmintonApiKeys;
    const matchQuery = {
      matchId,
      sportType,
      settleType: "EAR",
      apiKey: this.apiKeys.NormalMatch
    };

    this.match = await this.aioService.getMatch(matchQuery) as Match;
    this.originalMatch = _.cloneDeep(this.match);
    this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
    this.init();
  }


  public get outSideCount() {
    return this.match.resultDetails[0].externalScores.filter(x => 
      x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
  }

  public get maxProviderCol() {
    return this.match.matchDetail.providerCount > 2 ? 3 : 2;
  }

  public initService() {
    this.earlyConstraintService = this.injector.get(EarlyConstraintService);
    this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public init() {
    const maxLength = 5;
    this.matchDetail = this.match.matchDetail;
    this.matchId = this.matchDetail.matchId;
    this.permission = this.match.permission;
    this.match.resultDetails = this.earlyConstraintService.getEarlyResultDetails(this.match.resultDetails,
      this.matchDetail.sportType, maxLength);
    this.verificationService.generateExternalScores(this.match, this.match.resultDetails, this.matchDetail.sportType, this.maxProviderCol);
    this.resetResult(this.match.resultDetails);
    this.autoFillResultOnLoad(this.match.resultDetails);
    this.groupMap = this.getGroupMap();
    this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
    this.resultDetails = this.match.resultDetails;
    this.hideTicketWaiting(this.groupMap);
    this.renderFilterSelect();

    if (!this.isReadyMatch) {
      this.toastrService.error(Language.minimumPlayTimeNotReached);
    }
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
    this.ticketsStatusSelect.maxWidth = '100px';
    this.resultStatusSelect.maxWidth = '160px';
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
      const needConfirm = await this.aioService.verifyChangedSettledTickets(this.selectedResources, getEarlyResultQuery);
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
      this.setTeamResultSettle(this.selectedResources);
      const query = new SettleQuery(this.matchId,
        this.selectedResources,
        CalculateAction.earlyCalculate,
        this.isReSettledTickets,
        this.matchDetail.sportType);
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
        this.isReSettledTickets,
        this.matchDetail.sportType);
      query.isLeader = this.permission.isLeader;
      this.push(query);
    });
  }

  public async refund() {
    this.toastrService.clear();
    if (this.allResultConfirmed()) {
      this.createQueryRefundAndPush();
    } else {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    }
  }

  private createQueryRefundAndPush() {
    this.setTeamResultSettle(this.selectedResources);
    const query = new SettleQuery(this.matchId,
      this.selectedResources,
      CalculateAction.earlyRefund,
      this.isReSettledTickets,
      this.matchDetail.sportType);
    query.isLeader = this.permission.isLeader;
    this.push(query);
  }

  private async push(query: SettleQuery) {
    if (_.isEqual(this.matchDetail.sportType, SportType.volleyBall)) {
      query.betStatus = this.matchDetail.betStatus;
    }
    const result = await this.aioService.push(query);
    
    if (result.errCode === 0) {
      await this.updateStatusResultAmendments(result);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

    private async updateStatusResultAmendments(settledResult: Result) {
      const request = new UpdateSettlementResultHistoryStatus(
        this.matchId, 
            settledResult.settledSessionId,
            this.matchDetail.sportType, 
            settledResult.isOrg);    
  
        if(settledResult.hasResultAmendment) {
          await this.aioService.updateSettlementResultHistoryStatus(request);
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
      || _.isEqual(result.resultStatus, ResultStatus.noResult) 
      || _.isEqual(result.resultStatus, ResultStatus.running);
    return isRunning 
      && !result.isScoreMismatched 
      && this.verificationService.isValidTraderConfirmScore(result,result.inputType === InputType.coupleScore);
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

  private setTeamResultSettle(resultDetails: ResultDetail[]) {
    resultDetails.forEach(result => {
        result.homeId = `${this.matchDetail.homeId}`;
        result.awayId = `${this.matchDetail.awayId}`;
    });
}
}

import { Component, ViewChild } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch, RequestSettleWithInterval } from '../../models';
import * as _ from 'lodash';
import { VerificationService } from './verification.service';
import { MessageBoxService } from '../../../shared/services';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { BackgroundColor, CalculateAction, TicketStatusText } from '../../../shared/constants';
import { HedgeMatchDetail, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../../constants/resource-ids.native';
@Component({
  selector: 'halftime-fulltime-calculation',
  templateUrl: './halftime-fulltime-calculation.component.html',
})
export class HalfTimeFullTimeCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = true;
  public match: Match;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public isReSettledTickets: boolean;
  public confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public scoreClass: string;
  public finalScoreAutoSum = new ResultDetail();
  public halfTimeScoreAutoSum = new ResultDetail();
  public resultDetails: ResultDetail[];
  public originalResultDetail: ResultDetail[];
  public halfTimeNode: number;
  private refResultStatus: number;
  public clickCalcHalfTime = false;
  public clickCalcFullTime = false;
  public isScoreDirect = false;
  public isScoreFTInconsistent = false;
  public isScoreHTInconsistent = false;
  public htEmpty = false;
  public ftEmpty = false;
  public hasHalfTime = false;
  public applyHedgeMatch: boolean;
  public hedgeMatchDetail: HedgeMatchDetail;
  private halfTimeOriginal: ResultDetail;
  private fullTimeOriginal: ResultDetail;

  constructor(private readonly requestService: RequestService,
    private readonly verificationService: VerificationService,
    private readonly messageBoxService: MessageBoxService,
    private readonly halfTimeFullTimeService: HalfTimeFullTimeService,
    private readonly toastrService: ToastrService) {
    this.confirmDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number): Promise<void> {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, false);
    const otherSportsMatch = await this.requestService.getMatch(query);
    this.setValue(otherSportsMatch);
    this.halfTimeFullTimeService.processScore(this.matchDetail, this.halfTime, this.fullTime, this.results,
      this.halfTimeNode, this.permission.isLeader);
    this.checkConsistentScore();
    this.getConfirmedBackground();
    this.originalResultDetail = _.cloneDeep(this.resultDetails);
    this.halfTimeFullTimeService.autoFillOnload(this.results, this.matchDetail, this.halfTime, this.fullTime, this.halfTimeNode);
    this.verificationService.isScoreMismatched(this.halfTime, this.fullTime, this.matchDetail,
      this.halfTimeOriginal, this.fullTimeOriginal);
  }

  private setValue(otherSportsMatch: OtherSportsMatch) {
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.resultDetails = this.match.resultDetails;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.hasHalfTime = _.isObject(this.halfTime);
    this.isReadyMatch = this.halfTimeFullTimeService.isReadyMatch(this.matchDetail);
    this.halfTimeNode = this.halfTimeFullTimeService.numberSetOnHalfTime(this.matchDetail.sportType);
    this.halfTimeOriginal = _.cloneDeep(this.halfTime);
    this.fullTimeOriginal = _.cloneDeep(this.fullTime);
  }

  private get halfTime() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.halfTime));
  }

  private get originalHalfTime() {
    return _.find(this.originalResultDetail, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.halfTime));
  }

  private get fullTime() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.fullTime));
  }

  private get resultWithoutOverTime() {
    return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.halfTime)
      && !_.isEqual(map.resourceId, ResourcesIds.fullTime)
      && !_.isEqual(map.resourceId, ResourcesIds.ot));
  }

  private get results() {
    return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.halfTime)
      && !_.isEqual(map.resourceId, ResourcesIds.fullTime));
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public get externalSourceName() {
    if (_.isEmpty(this.matchDetail.externalSourceName) || _.isNil(this.matchDetail.externalSourceName)) {
      return '-';
    }

    return this.matchDetail.externalSourceName;
  }

  public changeInputDirectly() {
    this.clearStatus();
    this.resultDetails = _.cloneDeep(this.originalResultDetail);
    _.forEach(this.results, item => {
      item.homeValue = this.isScoreDirect ? "" : item.homeValue;
      item.awayValue = this.isScoreDirect ? "" : item.awayValue;
    });
    this.checkConsistentScore();
    this.verificationService.isScoreMismatched(this.halfTime, this.fullTime, this.matchDetail,
      this.halfTimeOriginal, this.fullTimeOriginal);
  }

  public actionCopyScore() {
    this.toastrService.clear();
    if (!this.isScoreDirect) {
      return;
    }

    if (this.matchDetail.isFullTimeSettled) {
      this.toastrService.error(Language.scoreSettledWarning);
    } else {
      this.checkStatusHalfTime();
    }
  }

  private checkStatusHalfTime() {
    const isExtFTScoreValid = !_.isEmpty(this.matchDetail.exFTAwayScore?.toString())
      && !_.isEmpty(this.matchDetail.exFTHomeScore?.toString());
    if (this.matchDetail.isHalfTimeSettled) {
      isExtFTScoreValid ?
        this.halfTimeFullTimeService.copyScore(this.fullTime, this.matchDetail,
          Language.confirmMessageCopySBOScore, this.externalSourceName)
        : this.toastrService.error(Language.halfTimeAlreadySettled);
    } else {
      this.copyScore();
    }
  }

  private copyScore() {
    const isExtHTScoreValid = !_.isEmpty(this.matchDetail.exHTHomeScore?.toString())
      && !_.isEmpty(this.matchDetail.exHTAwayScore?.toString());
    const isExtFTScoreValid = !_.isEmpty(this.matchDetail.exFTHomeScore?.toString())
      && !_.isEmpty(this.matchDetail.exFTAwayScore?.toString());
    if (!isExtHTScoreValid && !isExtFTScoreValid) {
      this.toastrService.error(Language.missingScoreWarning);
    } else if (!isExtHTScoreValid && isExtFTScoreValid) {
      this.halfTimeFullTimeService.copyScore(this.fullTime, this.matchDetail, Language.confirmMessageCopySBOScore, this.externalSourceName);
    } else if (isExtHTScoreValid && !isExtFTScoreValid) {
      this.halfTimeFullTimeService.copyScore(this.halfTime, this.matchDetail, Language.confirmCopyHalfTimeScore, this.externalSourceName);
    } else {
      this.halfTimeFullTimeService.copyAllScore(this.halfTime, this.fullTime, this.matchDetail, this.externalSourceName);
    }
  }

  public checkConsistentScore() {
    this.halfTimeScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.halfTimeNode);
    this.finalScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.results.length);
    this.isScoreHTInconsistent = this.hasHalfTime && this.verificationService.isScoreHTInconsistent(this.matchDetail.betStatus,
      this.halfTime, this.fullTime, this.halfTimeScoreAutoSum, this.isScoreDirect);
    this.isScoreFTInconsistent = this.verificationService.isScoreFTInconsistent(this.matchDetail.betStatus, this.halfTime, this.fullTime,
      this.finalScoreAutoSum, this.isScoreDirect);
  }

  public getClass(resultDetail: ResultDetail): string {
    if (resultDetail.isScoreMismatched) {
      return resultDetail.className + " mismatched";
    }
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.halfTime)) {
      return resultDetail.className + (this.isScoreHTInconsistent ? ' not-consistent' : "");
    } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.fullTime)) {
      return resultDetail.className + (this.isScoreFTInconsistent ? ' not-consistent' : "");
    }
    return resultDetail.className ?? "";
  }

  private numberNodeChecking() {
    if (this.clickCalcFullTime) {
      return this.resultWithoutOverTime.length;
    } else if (this.clickCalcHalfTime) {
      return this.halfTimeNode;
    }
    return 0;
  }

  public isErrorOnVerification(resultDetail: ResultDetail, score: string) {
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.halfTime)) {
      return this.clickCalcHalfTime && _.isEmpty(score);
    } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.fullTime)) {
      return this.clickCalcFullTime && _.isEmpty(score);
    } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
      return this.clickCalcFullTime && _.isEmpty(score) && (!_.isEmpty(resultDetail.homeValue) || !_.isEmpty(resultDetail.awayValue));
    } else {
      const index = this.resultWithoutOverTime.indexOf(resultDetail);
      return !(this.isScoreDirect || index < 0 || index >= this.numberNodeChecking()) && _.isEmpty(score);
    }
  }

  public isFinalScoreDisabled(resourceId: string) {
    return _.isEqual(resourceId, ResourcesIds.halfTime) || _.isEqual(resourceId, ResourcesIds.fullTime)
      ? !this.isScoreDirect : this.isScoreDirect;
  }

  public changeScore() {
    if (this.isScoreDirect) {
      this.checkConsistentScore();
    } else {
      this.sumHalfTime();
      this.finalScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.results.length);
      this.fullTime.homeValue = this.finalScoreAutoSum.homeValue;
      this.fullTime.awayValue = this.finalScoreAutoSum.awayValue;
      this.isScoreFTInconsistent = false;
      this.isScoreHTInconsistent = false;
    }
    this.verificationService.isScoreMismatched(this.halfTime, this.fullTime, this.matchDetail,
      this.halfTimeOriginal, this.fullTimeOriginal);
  }

  private sumHalfTime() {
    if (!_.isNil(this.halfTime)) {
      this.halfTimeScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.halfTimeNode);
      this.halfTime.homeValue = this.halfTimeScoreAutoSum.homeValue;
      this.halfTime.awayValue = this.halfTimeScoreAutoSum.awayValue;
    }
  }

  public get halftimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.htStatus);
  }

  public get fullTimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.ftStatus);
  }

  private getTicketStatusBackground(status: string) {
    if (_.isEqual(status, TicketStatusText.calculated)) {
      return BackgroundColor.calculated;
    }

    return _.isEqual(status, TicketStatusText.marked) ? BackgroundColor.backgroundMarked : "";
  }

  public calculateHalfTime() {
    this.clearStatus();
    this.clickCalcHalfTime = true;
    if (this.verificationService.verifyHalfTimeScore(this.halfTime, this.resultDetails, this.isScoreDirect, this.halfTimeNode)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreHTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculateHalfTime);
    }
  }

  private confirmScoreSource(actionType: string) {
    const isSourceInsufficient = !this.verificationService.isSourceSufficient(actionType, this.matchDetail,
      this.fullTimeOriginal, this.halfTimeOriginal);
    const isInconsistent = this.verificationService.isConsistent(actionType, this.halfTime, this.hasHalfTime, this.fullTime);
    if (isSourceInsufficient || isInconsistent) {
      this.confirmInconsistentScore(actionType, isSourceInsufficient);
    } else {
      this.confirmChangedResult(actionType);
    }
  }

  private confirmInconsistentScore(actionType: string, isSourceInsufficient: boolean) {
    if (!this.permission.isLeader) {
      this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
    } else {
      this.confirmDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.refResultStatus = isSourceInsufficient ? 1 : 2;
        this.confirmChangedResult(actionType);
      });
    }
  }

  private async confirmChangedResult(actionType: string) {
    if (this.isReSettledTickets) {
      this.confirmCalculation(actionType);
    } else {
      const needConfirm = await this.verificationService.VerifyChangedSettledTickets(this.matchDetail.matchId,
        this.resultDetails, this.isScoreDirect, actionType, this.halfTimeNode);
      this.processAfterCheckChangedScore(needConfirm, actionType);
    }
  }

  private processAfterCheckChangedScore(needConfirm: boolean, actionType: string) {
    if (needConfirm) {
      this.confirmDialogMessage.message = Language.recalculateNotification;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.isReSettledTickets = true;
      });
    } else {
      this.confirmCalculation(actionType);
    }
  }

  private confirmCalculation(actionType: string) {
    const firstMessage = this.halfTimeFullTimeService.getFirstConfirmMessage(actionType);
    const secondMessage = this.halfTimeFullTimeService.getSecondConfirmMessage(actionType);
    this.confirmDialogMessage.message = firstMessage;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.confirmDialogMessage.message = secondMessage;
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.sendRequest(actionType);
      });
    });
  }

  private async sendRequest(type: string) {
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    const settleQuery = new RequestSettleWithInterval(this.matchDetail, this.resultDetails, type,
      this.isReSettledTickets, this.isScoreDirect, hedgeMatchId, this.refResultStatus);

    const result = await this.requestService.sendRequest(settleQuery);
    if (result.isSuccessful) {
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public calculateFullTime() {
    this.clearStatus();
    this.clickCalcFullTime = true;
    if (this.verificationService.verifyAllScore(this.halfTime, this.fullTime, this.results, this.isScoreDirect)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreFTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculateFullTime);
    }
  }

  public calculateAll() {
    this.clearStatus();
    this.clickCalcHalfTime = true;
    this.clickCalcFullTime = true;
    if (this.verificationService.verifyAllScore(this.halfTime, this.fullTime, this.results, this.isScoreDirect, true)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreFTInconsistent || this.isScoreHTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculate);
    }
  }

  private clearStatus() {
    this.toastrService.clear();
    this.clickCalcHalfTime = false;
    this.clickCalcFullTime = false;
  }

  public unCalculate() {
    this.clearStatus();
    this.confirmDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.confirmDialogMessage.message = Language.checkAgainUncalculate;
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.sendRequest(CalculateAction.unCalculate);
      });
    });
  }

  public getConfirmedBackground() {
    this.fullTime.className = this.halfTimeFullTimeService.fullTimeConfirmed(this.matchDetail, this.fullTimeOriginal) ? "bg-result-confirmed " : "";
    if (this.hasHalfTime) {
      this.halfTime.className = this.halfTimeFullTimeService.halfTimeConfirmed(this.matchDetail, this.halfTimeOriginal) ? "bg-result-confirmed " : "";
    }
  }
}

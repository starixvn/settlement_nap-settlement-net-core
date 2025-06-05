import { Component, ViewChild } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch, RequestSettleWithInterval } from '../../models';
import * as _ from 'lodash';
import { VerificationService } from './verification.service';
import { MessageBoxService } from '../../../shared/services';
import { Language } from '../../../shared/language.native';
import { League, ModalDialogMessage } from '../../../shared/models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { BackgroundColor, CalculateAction, SportType, TicketStatusText } from '../../../shared/constants';
import { HedgeMatchDetail, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../../constants/resource-ids.native';
import { ChildMatchType, LeagueType } from '../../constants';
@Component({
  selector: 'halftime-fulltime-calculation',
  templateUrl: './halftime-fulltime-calculation.component.html',
})
export class HalfTimeFullTimeCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  isReadyMatch = false;
  match: Match;
  matchDetail: MatchDetail;
  permission: Permission;
  isReSettledTickets: boolean;
  confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  scoreClass: string;
  finalScoreAutoSum = new ResultDetail();
  halfTimeScoreAutoSum = new ResultDetail();
  resultDetails: ResultDetail[];
  originalResultDetail: ResultDetail[];
  halfTimeNode: number;
  clickCalcHalfTime = false;
  clickCalcFullTime = false;
  isScoreDirect = false;
  isScoreFTInconsistent = false;
  isScoreHTInconsistent = false;
  htEmpty = false;
  ftEmpty = false;
  hasHalfTime = false;
  applyHedgeMatch: boolean;
  hedgeMatchDetail: HedgeMatchDetail;
  halfTimeOriginal: ResultDetail;
  fullTimeOriginal: ResultDetail;
  isOTInvalid = false;
  private refResultStatus: number;

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
    this.isOTInvalid = this.verifyOTValue();

    if (!this.isReadyMatch) {
      this.toastrService.error(Language.minimumPlayTimeNotReached);
    }
  }

  private setValue(otherSportsMatch: OtherSportsMatch) {
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.resultDetails = this.match.resultDetails;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.hasHalfTime = _.isObject(this.halfTime);
    this.isReadyMatch = this.halfTimeFullTimeService.isReadyMatch(this.matchDetail);
    this.halfTimeNode = this.halfTimeFullTimeService.numberSetOnHalfTime(this.matchDetail.sportType);
    this.halfTimeOriginal = _.cloneDeep(this.halfTime);
    this.fullTimeOriginal = _.cloneDeep(this.fullTime);
  }

  private get halfTime() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.halfTime));
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

  private get otResult() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.ot));
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  get externalSourceName() {
    if (_.isEmpty(this.matchDetail.externalSourceName) || _.isNil(this.matchDetail.externalSourceName)) {
      return '-';
    }

    return this.matchDetail.externalSourceName;
  }

  changeInputDirectly() {
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

  actionCopyScore() {
    this.toastrService.clear();
    if (!this.isScoreDirect) {
      return;
    }

    if (this.matchDetail.isFullTimeSettled) {
      this.toastrService.error(Language.scoreSettledWarning);
      return;
    }

    this.checkStatusHalfTime();
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

  checkConsistentScore() {
    this.halfTimeScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.halfTimeNode);
    this.finalScoreAutoSum = this.halfTimeFullTimeService.sumScore(this.results, this.results.length);
    this.isScoreHTInconsistent = this.hasHalfTime && this.verificationService.isScoreHTInconsistent(this.matchDetail.betStatus,
      this.halfTime, this.fullTime, this.halfTimeScoreAutoSum, this.isScoreDirect);
    this.isScoreFTInconsistent = this.verificationService.isScoreFTInconsistent(this.matchDetail.betStatus, this.halfTime, this.fullTime,
      this.finalScoreAutoSum, this.isScoreDirect);
  }

  getClass(resultDetail: ResultDetail): string {
    if (resultDetail.isScoreMismatched) {
      return resultDetail.className + " mismatched";
    }
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.halfTime)) {
      return resultDetail.className + (this.isScoreHTInconsistent ? ' not-consistent' : "");
    }
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.fullTime)) {
      return resultDetail.className + (this.isScoreFTInconsistent ? ' not-consistent' : "");
    }
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot) && this.isOTInvalid) {
      return resultDetail.className + ' not-consistent';
    }
    return resultDetail.className ?? "";
  }

  private numberNodeChecking() {
    if (this.clickCalcFullTime) {
      return this.resultWithoutOverTime.length;
    }

    if (this.clickCalcHalfTime) {
      return this.halfTimeNode;
    }

    return 0;
  }

  isErrorOnVerification(resultDetail: ResultDetail, score: string) {
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.halfTime)) {
      return this.isErrorOnHalfTimeVerification(score);
    }

    if (_.isEqual(resultDetail.resourceId, ResourcesIds.fullTime)) {
      return this.isErrorOnFullTimeVerification(score);
    }

    if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
      return this.isErrorOnOTVerification(resultDetail, score);
    }

    return this.isErrorOnOtherResultDetailVerification(resultDetail, score);
  }

  private isErrorOnHalfTimeVerification(score: string) {
    return this.clickCalcHalfTime && _.isEmpty(score);
  }

  private isErrorOnFullTimeVerification(score: string) {
    return this.clickCalcFullTime && _.isEmpty(score);
  }

  private isErrorOnOTVerification(resultDetail: ResultDetail, score: string) {
    return this.isErrorOnFullTimeVerification(score) && (!_.isEmpty(resultDetail.homeValue) || !_.isEmpty(resultDetail.awayValue));
  }

  private isErrorOnOtherResultDetailVerification(resultDetail: ResultDetail, score: string) {
    const index = this.resultWithoutOverTime.indexOf(resultDetail);
    return !(this.isScoreDirect || index < 0 || index >= this.numberNodeChecking()) && _.isEmpty(score);
  }

  isFinalScoreDisabled(resourceId: string) {
    return _.isEqual(resourceId, ResourcesIds.halfTime) || _.isEqual(resourceId, ResourcesIds.fullTime)
      ? !this.isScoreDirect : this.isScoreDirect;
  }

  changeScore(resultDetail: ResultDetail) {
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

    if (resultDetail.resourceId === ResourcesIds.ot) {
      this.isOTInvalid = this.verifyOTValue();
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

  get halftimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.htStatus);
  }

  get fullTimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.ftStatus);
  }

  private getTicketStatusBackground(status: string) {
    if (_.isEqual(status, TicketStatusText.calculated)) {
      return BackgroundColor.calculated;
    }

    return _.isEqual(status, TicketStatusText.marked) ? BackgroundColor.backgroundMarked : "";
  }

  calculateHalfTime() {
    this.clearStatus();
    this.clickCalcHalfTime = true;
    if (this.verificationService.verifyHalfTimeScore(this.halfTime, this.resultDetails, this.isScoreDirect, this.halfTimeNode)) {
      this.toastrService.error(Language.warningInputScore);
      return;
    }

    if (this.isScoreHTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
      return;

    }
    this.confirmScoreSource(CalculateAction.calculateHalfTime);

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
      return;
    }
    const needConfirm = await this.verificationService.VerifyChangedSettledTickets(this.matchDetail.matchId,
      this.resultDetails, this.isScoreDirect, actionType, this.halfTimeNode);
    this.processAfterCheckChangedScore(needConfirm, actionType);

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

  calculateFullTime() {
    this.clearStatus();
    this.clickCalcFullTime = true;
    if (this.verificationService.verifyAllScore(this.halfTime, this.fullTime, this.results, this.isScoreDirect)) {
      this.toastrService.error(Language.warningInputScore);
      return;
    }

    if (this.isScoreFTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
      return;
    }
    this.confirmScoreSource(CalculateAction.calculateFullTime);
  }

  calculateAll() {
    this.clearStatus();
    this.clickCalcHalfTime = true;
    this.clickCalcFullTime = true;

    if (this.verificationService.verifyAllScore(this.halfTime, this.fullTime, this.results, this.isScoreDirect, true)) {
      this.toastrService.error(Language.warningInputScore);
      return;
    }

    if (this.isScoreFTInconsistent || this.isScoreHTInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
      return;
    }

    if (this.isOTInvalid) {
      this.confirmDialogMessage.message = Language.otherSports.errorOTScore;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.clearOTscore();
      });
      return;
    }

    if (this.verificationService.verifyFinalHasDrawScore(this.matchDetail, this.fullTime)) {
      if (!this.permission.isLeader) {
        this.toastrService.error(Language.otherSports.errorDrawScore);
        return;
      }

      this.confirmDialogMessage.message = Language.otherSports.confirmDrawScore;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.confirmScoreSource(CalculateAction.calculate);
      });
      return;
    }

    this.confirmScoreSource(CalculateAction.calculate);
  }

  private clearOTscore() {
    this.otResult.homeValue = "";
    this.otResult.awayValue = "";
    this.changeScore(this.otResult);
  }

  private clearStatus() {
    this.toastrService.clear();
    this.clickCalcHalfTime = false;
    this.clickCalcFullTime = false;
  }

  unCalculate() {
    this.clearStatus();
    this.confirmDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.confirmDialogMessage.message = Language.checkAgainUncalculate;
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.sendRequest(CalculateAction.unCalculate);
      });
    });
  }

  getConfirmedBackground() {
    this.fullTime.className = this.halfTimeFullTimeService.fullTimeConfirmed(this.matchDetail, this.fullTimeOriginal) ? "bg-result-confirmed " : "";
    if (this.hasHalfTime) {
      this.halfTime.className = this.halfTimeFullTimeService.halfTimeConfirmed(this.matchDetail, this.halfTimeOriginal) ? "bg-result-confirmed " : "";
    }
  }

  private verifyOTValue() {
    const regularMatch = this.matchDetail.childMatchType === ChildMatchType.Regular || this.matchDetail.leagueType === LeagueType.Regular;
    return regularMatch && this.matchDetail.sportType === SportType.iceHockey
      && (!_.isEmpty(this.otResult.homeValue) || !_.isEmpty(this.otResult.awayValue));
  }
}

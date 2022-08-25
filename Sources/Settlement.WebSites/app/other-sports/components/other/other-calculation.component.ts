import { Component, ViewChild } from "@angular/core";
import * as _ from "lodash";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch } from "../../models";
import { RequestService } from "../../services/request.service";
import { BackgroundColor, CalculateAction, TicketStatusText } from "../../../shared/constants";
import { Language } from "../../../shared/language";
import { ModalDialogMessage } from "../../../shared/models";
import { HedgeMatchDetail, SportTemplate } from "../../../shared/models/sportsbook-sop";
import { MessageBoxService } from "../../../shared/services";
import { OtherService } from "./other.service";
import { VerificationService } from "./verification.service";

@Component({
    selector: 'calculation-actions',
    templateUrl: './other-calculation.component.html',
    providers: [
      VerificationService,
    ]
})
export class OtherCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = true;
  public match: Match;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public isReSettledTickets: boolean;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  private refResultStatus: number = null;
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch = false;
  public hasHalfTime = false;
  public isHtScoreMismatched = false;
  public isFinalScoreMismatched = false;
  public clickedCalculateHalfTime = false;
  public clickedCalculateFullTime = false;
  public clickedCalculateAll = false;
  public isHtScoreConfirmed = false;
  public isFinalScoreConfirmed = false;
  public isScoreInconsistent = false;
  constructor(private readonly requestService: RequestService,
    private readonly otherService: OtherService,
    private readonly verificationService: VerificationService,
    private readonly toastrService: ToastrService,
    private readonly messageBoxService: MessageBoxService) {
      this.confirmationDialogMessage.title = Language.confirmationBox;
  }
  async getMatch(matchId: number) {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, false);
    const otherSportsMatch = await this.requestService.getMatch(query).toPromise() as OtherSportsMatch;
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.mapValue();
  }

  public get externalSourceName() {
    if (_.isNil(this.matchDetail.externalSourceName) || _.isEmpty(this.matchDetail.externalSourceName)) {
      return '-';
    }

    return this.matchDetail.externalSourceName;
  }

  private mapValue() {
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.hasHalfTime = this.otherService.showButtonBySportType(this.matchDetail.sportType);
    this.isReadyMatch = this.otherService.isReadyMatch(this.matchDetail);
    this.otherService.initScoreByPermission(this.matchDetail, this.permission);
    this.verifyScores();
    this.getConfirmStatus();
  }

  public get halftimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.htStatus);
  }

  public get fullTimeTicketStatusBackground() {
    return this.getTicketStatusBackground(this.matchDetail.ftStatus);
  }

  private getTicketStatusBackground(status: string) {
    return _.isEqual(status, TicketStatusText.calculated)
      ? BackgroundColor.calculated
      : _.isEqual(status, TicketStatusText.marked) ? BackgroundColor.backgroundMarked : "";
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  private getConfirmStatus() {
    this.isHtScoreConfirmed = this.getHtConfirmStatus();
    this.isFinalScoreConfirmed = this.getFinalConfirmStatus();
  }

  private getHtConfirmStatus() {
    return !this.matchDetail.isCalculated && !this.matchDetail.isCalRefund
      && this.verificationService.isHtScoreConfirmed(this.matchDetail);
  }

  private getFinalConfirmStatus() {
    return !this.matchDetail.isHalfTimeCal && !this.matchDetail.isCalRefund
      && this.verificationService.isFinalScoreConfirmed(this.matchDetail);
  }

  public isHtErrorOnVerification(score: number) {
    return (this.clickedCalculateHalfTime) && _.isEmpty(score?.toString());
  }

  public isFinalErrorOnVerification(score: number) {
    return (this.clickedCalculateFullTime) && _.isEmpty(score?.toString());
  }

  public changeScore() {
    this.verifyScores();
  }

  private verifyScores() {
    this.isScoreInconsistent = this.verificationService.isScoreInconsistent(this.matchDetail);
    this.isHtScoreMismatched = this.verificationService.isHaltTimeScoreMismatched(this.matchDetail);
    this.isFinalScoreMismatched = this.verificationService.isFinalScoreMismatched(this.matchDetail);
  }

  public actionCopyScore() {
    this.toastrService.clear();
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
        this.confirmCopyScore(Language.confirmMessageCopySBOScore, this.externalSourceName,
          () => this.otherService.copyFinalScore(this.matchDetail))
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
      this.confirmCopyScore(Language.confirmMessageCopySBOScore, this.externalSourceName,
        () => this.otherService.copyFinalScore(this.matchDetail));
    } else if (isExtHTScoreValid && !isExtFTScoreValid) {
      this.confirmCopyScore(Language.confirmCopyHalfTimeScore, this.externalSourceName,
        () => this.otherService.copyHalfTimeScore(this.matchDetail));
    } else {
      this.confirmCopyScore(Language.confirmCopyScore, this.externalSourceName,
        () => this.otherService.copyScores(this.matchDetail));
    }
  }

  private confirmCopyScore(message: string, sourceName: string, copyFunc: () => void) {
    this.confirmationDialogMessage.message = message.replace("'provider_name'", sourceName);
    this.messageBoxService.confirm(this.confirmationDialogMessage, copyFunc);
  }

  public calculateHalfTime() {
    this.clearStatus();
    this.clickedCalculateHalfTime = true;
    if (this.verificationService.isHalfTimeScoreInvalid(this.matchDetail)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculateHalfTime);
    }
  }

  public calculateFullTime() {
    this.clearStatus();
    this.clickedCalculateFullTime = true;
    if (this.verificationService.isFinalScoreInvalid(this.matchDetail)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculateFullTime);
    }
  }

  public calculateAll() {
    this.clearStatus();
    this.clickedCalculateHalfTime = true;
    this.clickedCalculateFullTime = true;
    if (this.verificationService.isScoreInvalid(this.matchDetail)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.isScoreInconsistent) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource(CalculateAction.calculate);
    }
  }

  private clearStatus() {
    this.toastrService.clear();
    this.clickedCalculateHalfTime = false;
    this.clickedCalculateFullTime = false;
  }

  public uncalculate() {
    this.clearStatus();
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmationDialogMessage.message = Language.checkAgainUncalculate;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
        this.sendRequest(CalculateAction.unCalculate);
      });
    });
  }

  private confirmScoreSource(actionType: string) {
    const isSourceInsufficient = this.verificationService.isScoreSourceInsufficient(actionType, this.matchDetail);
    const isScoreMismatched = this.isMismatchedByAction(actionType);
    if (isSourceInsufficient || isScoreMismatched) {
      this.confirmInconsistentScore(actionType, isSourceInsufficient);
    } else {
      this.confirmChangedResult(actionType);
    }
  }

  private confirmInconsistentScore(actionType: string, isSourceInsufficient: boolean) {
    if (!this.permission.isLeader) {
      this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
    } else {
      this.confirmationDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.refResultStatus = isSourceInsufficient ? 1 : 2;
        this.confirmChangedResult(actionType);
      });
    }
  }

  private async confirmChangedResult(actionType: string) {
    if (this.isReSettledTickets) {
      this.confirmCalculation(actionType);
    } else {
      const needConfirm = await this.verificationService.verifyChangedSettledTickets(this.matchDetail, actionType).toPromise();
      this.processAfterCheckChangedScore(needConfirm, actionType);
    }
  }

  private processAfterCheckChangedScore(needConfirm: boolean, actionType: string) {
    if (needConfirm) {
      this.confirmationDialogMessage.message = Language.recalculateNotification;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.isReSettledTickets = true;
      });
    } else {
      this.confirmCalculation(actionType);
    }
  }

  private confirmCalculation(actionType: string) {
    const firstMessage = this.otherService.getFirstConfirmMessage(actionType);
    const secondMessage = this.otherService.getSecondConfirmMessage(actionType);
    this.confirmationDialogMessage.message = firstMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmationDialogMessage.message = secondMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
        this.sendRequest(actionType);
      });
    });
  }

  private async sendRequest(type: string) {
    const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;

    const result = await this.otherService.settle(type, this.isReSettledTickets, this.matchDetail, this.refResultStatus, hedgeMatchId);
    if (result.isSuccessful) {
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private isMismatchedByAction(actionType: string) {
    if (_.isEqual(actionType, CalculateAction.calculateFullTime)) {
      return this.isFinalScoreMismatched;
    } else if (_.isEqual(actionType, CalculateAction.calculateHalfTime)) {
      return this.isHtScoreMismatched;
    } else {
      return this.isFinalScoreMismatched || this.isHtScoreMismatched;
    }
  }
}
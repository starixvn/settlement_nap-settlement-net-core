import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { KickOffTime, ResourcesIds } from '../../constants';
import { Match, MatchDetail, OtherSportsMatch, Permission, QueryMatch, RequestSettleWithInterval } from '../../models';
import { RequestService } from '../../services/request.service';
import { CalculateAction, MatchStatus } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage, Result } from '../../../shared/models';
import { HedgeMatchDetail, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MessageBoxService } from '../../../shared/services';
import { GameTotalMatchService } from './game-total-match.service';
import * as _ from 'lodash';
import { GameTotalMatchVerificationService } from './game-total-match-verification.service';

@Component({
  selector: 'game-total-match-calculation',
  templateUrl: './game-total-match-calculation.component.html',
})
export class GameTotalMatchCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = false;
  public match: Match;
  public matchDetail: MatchDetail;
  public resultDetails: ResultDetail[];
  public permission: Permission;
  public isReSettledTickets: boolean;
  public clickCalcFullTime = false;
  public isScoreDirect = false;
  public readonly confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  private refResultStatus: number = null;
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  private resultDetailsInAction: ResultDetail[];
  private originalTotalSet: ResultDetail;
  public isScoreInconsistent: boolean;

  constructor(private readonly messageBoxService: MessageBoxService,
    private readonly requestService: RequestService,
    private readonly toastrService: ToastrService,
    private readonly gameTotalMatchService: GameTotalMatchService,
    private readonly verificationService: GameTotalMatchVerificationService) {
    this.confirmDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    const query = new QueryMatch(matchId, false);
    const otherSportsMatch = await this.requestService.getMatch(query);
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.resultDetails = this.match.resultDetails;
    this.originalTotalSet = _.cloneDeep(this.totalSets);
    this.gameTotalMatchService.resetHomeAway(this.matchDetail, this.resultDetails, this.permission.isLeader);
    this.mapValue();

    if (!this.isReadyMatch) {
      this.toastrService.error(Language.minimumPlayTimeNotReached);
    }
  }

  public mapValue() {
    this.toastrService.overlayContainer = this.toastContainer;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.isReadyMatch = this.gameTotalMatchService.isReadyMatch(this.matchDetail);
    this.resultDetails = this.gameTotalMatchService.getResultDetail(this.matchDetail, this.match.resultDetails);
    this.cloneResultDetail();
    this.verificationService.isScoreMismatched(this.totalSets, this.matchDetail, this.originalTotalSet);
    this.isScoreInconsistent = this.verificationService.isNotConsistentTotalSet(this.resultDetails);
  }

  private get totalSets() {
    return _.find(this.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalSets));
  }

  private get totalPoints() {
    return _.find(this.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.totalPoints));
  }

  private cloneResultDetail() {
    this.resultDetails.forEach((map) => {
      map.originalHomeValue = _.clone(map.homeValue);
      map.originalAwayValue = _.clone(map.awayValue);
    });
  }

  public get externalSourceName() {
    if (_.isNil(this.matchDetail.externalSourceName) || _.isEmpty(this.matchDetail.externalSourceName)) {
      return '-';
    }

    return this.matchDetail.externalSourceName;
  }

  public isScoreConfirmed(isFinal: boolean) {
    return isFinal
      && !this.matchDetail.isCalculated
      && !this.matchDetail.isCalRefund
      && this.verificationService.isScoreConfirmed(this.matchDetail, this.originalTotalSet);
  }

  public isScoreMismatched(total: ResultDetail, isFinal: boolean) {
    return isFinal && total.isScoreMismatched;
  }

  public disableTextBox(resourceId: string) {
    if (this.isScoreDirect) {
      return !_.isEqual(resourceId, ResourcesIds.totalSets);
    }

    return _.isEqual(resourceId, ResourcesIds.totalPoints) || _.isEqual(resourceId, ResourcesIds.totalSets);
  }

  public changeScore() {
    this.clickCalcFullTime = false;
    if (!this.isScoreDirect) {
      this.gameTotalMatchService.sumTotalPoints(this.resultDetails, this.totalPoints);
      this.gameTotalMatchService.computeTotalSets(this.resultDetails, this.totalSets);
    }

    this.isScoreInconsistent = this.verificationService.isNotConsistentTotalSet(this.resultDetails);
    this.verificationService.isScoreMismatched(this.totalSets, this.matchDetail, this.originalTotalSet);
  }

  public isErrorOnVerification(resultDetail: ResultDetail) {
    let disabled = this.isScoreDirect;
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalPoints)) {
      return false;
    }

    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalSets)) {
      disabled = !this.isScoreDirect;
    }

    return this.clickCalcFullTime && !disabled && (!resultDetail.homeValue || !resultDetail.awayValue);
  }

  public changeInputDirectly() {
    this.clickCalcFullTime = false;
    this.resultDetails.forEach((set) => {
      if (set.resourceId !== ResourcesIds.totalSets) {
        set.homeValue = this.isScoreDirect ? "" : set.originalHomeValue;
        set.awayValue = this.isScoreDirect ? "" : set.originalAwayValue;
      }
    });

    this.totalSets.homeValue = this.totalSets.originalHomeValue;
    this.totalSets.awayValue = this.totalSets.originalAwayValue;
    this.verificationService.isScoreMismatched(this.totalSets, this.matchDetail, this.originalTotalSet);
    this.isScoreInconsistent = this.verificationService.isNotConsistentTotalSet(this.resultDetails);
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public copyScore() {
    this.toastrService.clear();
    const errorMessage = this.verificationService.verifyCopyScore(this.matchDetail);
    if (_.isEmpty(errorMessage)) {
      const message = Language.confirmMessageCopySBOScore.replace("'provider_name'", this.externalSourceName);
      this.confirmDialogMessage.message = message;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.totalSets.homeValue = this.matchDetail.exFTHomeScore?.toString();
        this.totalSets.awayValue = this.matchDetail.exFTAwayScore?.toString();
      });
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  public calculation() {
    this.clickCalcFullTime = true;
    this.toastrService.clear();
    this.refResultStatus = null;
    this.resultDetailsInAction = this.verificationService.getResultDetailInAction(this.resultDetails, this.isScoreDirect);
    const invalidScoreMessage = this.verificationService.isScoreInvalid(this.resultDetailsInAction, this.isScoreDirect);
    if (!_.isEmpty(invalidScoreMessage)) {
      this.toastrService.error(invalidScoreMessage);
    } else {
      this.confirmScoreSource();
    }
  }

  private confirmScoreSource() {
    const isSourceInsufficient = !this.verificationService.isScoreConfirmed(this.matchDetail, this.originalTotalSet)
      && this.verificationService.isScoreEmpty(this.matchDetail.exFTHomeScore?.toString(),
        this.matchDetail.exFTAwayScore?.toString());
    const isInconsistent = this.totalSets.isScoreMismatched;
    if (isSourceInsufficient || isInconsistent) {
      if (!this.permission.isLeader) {
        this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
      } else {
        this.confirmDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
          this.refResultStatus = isSourceInsufficient ? 1 : 2;
          this.confirmChangedResult();
        });
      }
    } else {
      this.confirmChangedResult();
    }
  }

  private async confirmChangedResult() {
    if (this.isReSettledTickets) {
      this.confirmCalculation();
    } else {
      const result = await this.verificationService.verifyChangedSettledTickets(this.matchDetail.matchId,
        this.resultDetailsInAction, this.isScoreDirect);
      if (result) {
        this.confirmDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation();
      }
    }
  }

  private confirmCalculation() {
    this.confirmDialogMessage.message = Language.doubleCheckCalculateAll;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.confirmDialogMessage.message = Language.checkAgainCalculateAll;
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.sendRequest(CalculateAction.calculate);
      });
    });
  }

  private async sendRequest(type: string) {
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    const settleQuery = new RequestSettleWithInterval(this.matchDetail, this.resultDetailsInAction, type,
      this.isReSettledTickets, this.isScoreDirect, hedgeMatchId, this.refResultStatus);

    const result = await this.requestService.sendRequest(settleQuery);
    if (result.isSuccessful) {
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public uncalculate() {
    this.toastrService.clear();
    this.resultDetailsInAction = this.verificationService.getResultDetailInAction(this.resultDetails, this.isScoreDirect);
    this.confirmDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.confirmDialogMessage.message = Language.checkAgainUncalculate;
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.sendRequest(CalculateAction.unCalculate);
      });
    });
  }
}

import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { FullTimeService } from './fulltime.service';
import { FullTimeVerificationService } from './fulltime-verification.service';
import { Match, MatchDetail, Permission, QueryMatch } from '../../models';
import { ModalDialogMessage } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
import { CalculateAction, MatchStatus, SportType } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import * as _ from 'lodash';
import { KickOffTime, UpcommingSports } from '../../constants';
import { ScorePipe } from '../../pipes';
import { RequestService } from '../../services/request.service';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
@Component({
  selector: 'calculation-actions',
  templateUrl: './fulltime-calculation.component.html',
  providers: [
    ScorePipe,
  ]
})
export class FullTimeCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = false;
  public match: Match;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public isReSettledTickets: boolean;
  public scoreClass: string;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public muayThai = SportType.muayThai;
  private oldBetStatus = '';
  private readonly maxRound = 5;
  private refResultStatus: number = null;
  constructor(private readonly requestService: RequestService,
    private readonly fullTimeService: FullTimeService,
    private readonly messageBoxService: MessageBoxService,
    private readonly verificationService: FullTimeVerificationService,
    private readonly toastrService: ToastrService) {
      this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, false);
    const otherSportsMatch = await this.requestService.getMatch(query);
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.isReadyMatch = this.isCompletedOrConfirmScore 
      || this.matchDetail.parentId !== 0 && this.matchDetail.playTime >= 0 
      || this.checkPlayTimeBySportType;

    this.fullTimeService.initScoreByPermission(this.matchDetail, this.permission);
    this.resetScore();

    if (!this.isReadyMatch) {
      this.toastrService.error(Language.minimumPlayTimeNotReached);
    }
  }

  public get externalSourceName() {
    if (_.isEmpty(this.matchDetail.externalSourceName) || _.isNil(this.matchDetail.externalSourceName)) {
      return '-';
    }

    return this.matchDetail.externalSourceName;
  }

  private get checkPlayTimeBySportType () {
    if (this.matchDetail.sportType === SportType.muayThai) {
      return this.matchDetail.playTime >= KickOffTime.muayThai;
    } else if(this.matchDetail.sportType === SportType.beachSoccer) {
      return this.matchDetail.playTime >= KickOffTime.beachSoccer;
    } else {
      return this.matchDetail.playTime >= KickOffTime.playTime;
    }
  }

  private get isCompletedOrConfirmScore() {
    return this.matchDetail.confirmHT > 0 || this.matchDetail.confirmFT > 0
    || _.isEqual(this.matchDetail.eventStatus, MatchStatus.Completed);
  }

  private resetScore() {
    this.matchDetail.finalAwayScore =  this.matchDetail.betStatus?.includes('Refund') ? null : this.matchDetail.finalAwayScore;
    this.matchDetail.finalHomeScore = this.matchDetail.betStatus?.includes('Refund') ? null : this.matchDetail.finalHomeScore;
    this.matchDetail.betStatus = _.isEmpty(this.matchDetail.betStatus) || this.matchDetail.betStatus === null ?
      '' : this.matchDetail.betStatus.replace(';', '').replace("Refund FT", '').replace("Refund", '').trim();
  }

  public calculation() {
    this.toastrService.clear();
    const muayThaiChecking = this.verificationService.checkScoreMuayThai(this.matchDetail);

    if (_.isNull(this.matchDetail.finalHomeScore) || _.isNull(this.matchDetail.finalAwayScore)) {
      this.scoreClass = 'warning';
      this.toastrService.error(Language.warningInputScore);
    } else if (!_.isEmpty(muayThaiChecking)) {
      this.toastrService.error(muayThaiChecking);
    } else {
      this.verifyExternalSourceAndCalculate();
    }
  }

  private verifyExternalSourceAndCalculate() {
    const isSourceInsufficient = this.verificationService.isScoreSourceInsufficient(this.matchDetail);
    const isInconsistent = this.verificationService.isScoreInconsistent(this.matchDetail);
    if (isSourceInsufficient || isInconsistent) {
      if (!this.permission.isLeader) {
        this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
      } else {
        this.confirmationDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
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
      const query = {
        matchId: this.matchDetail.matchId
      };

      const result = await this.verificationService.verifyChangedSettledTickets(this.matchDetail, query);
      if (result) {
       this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation();
      }
    }
  }

  private confirmCalculation() {
    this.confirmationDialogMessage.message = Language.CalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmationDialogMessage.message = Language.checkAgainConfirmation;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
        const errorMessage = await this.fullTimeService.settle(CalculateAction.calculate,
                                        this.isReSettledTickets, this.matchDetail, this.refResultStatus);
        if(!_.isEmpty(errorMessage)) {
          this.toastrService.error(errorMessage);
        }
      });
    });
  }

  public uncalculation() {
    this.clearErrorMessage();
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmationDialogMessage.message = Language.checkAgainUnSettleConfirmation;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
        const errorMessage = await this.fullTimeService.settle(CalculateAction.unCalculate, this.isReSettledTickets, this.matchDetail);
        if(!_.isEmpty(errorMessage)) {
          this.toastrService.error(errorMessage);
        }
      });
    });
  }

  public changeScore() {
    this.clearErrorMessage();
    this.scoreClass = '';
  }

  private clearErrorMessage() {
    this.toastrService.clear();
    this.refResultStatus = null;
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public changeBetStatus() {
    this.matchDetail.betStatus = Number(this.matchDetail.betStatus) > this.maxRound || this.isZero(this.matchDetail.betStatus) ? this.oldBetStatus : this.matchDetail.betStatus;
    this.oldBetStatus = this.matchDetail.betStatus;
  }

  private isZero(value: string)
  {
    return !_.isEmpty(value) && Number(value) === 0;
  }

  public copyScore() {
    this.toastrService.clear();
    const errorMessage = this.verificationService.verifyCopyScore(this.match.matchDetail);
    if(_.isEmpty(errorMessage)) {
      const message = Language.confirmMessageCopySBOScore.replace("'provider_name'", this.externalSourceName);
      this.confirmationDialogMessage.message = message;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.match.matchDetail.finalHomeScore = this.match.matchDetail.exFTHomeScore;
        this.match.matchDetail.finalAwayScore = this.match.matchDetail.exFTAwayScore;
      });
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  public isFinalScoreConfirmed() {
    return this.verificationService.isFinalScoreConfirmed(this.matchDetail)
      && !this.matchDetail.isCalculated && !this.matchDetail.isCalRefund;
  }

  public get isScoreInconsistent() {
    return this.verificationService.isScoreInconsistent(this.matchDetail);
  }
}
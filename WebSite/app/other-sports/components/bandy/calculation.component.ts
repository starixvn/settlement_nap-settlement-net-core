import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Match, MatchDetail, Permission, QueryMatch } from '../../models';
import { HedgeMatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";

import { ModalDialogMessage, MultipleSelect } from '../../../shared/models';
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
  templateUrl: './calculation.component.html',
  providers: [
    ScorePipe,
  ]
})
export class BandyCalculationComponent implements SportTemplate, OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = true;
  public match: Match;
  
  public matchDetail: MatchDetail;
  
  public resultDetails: ResultDetail[];
  public originalResultDetails: ResultDetail[];

  public permission: Permission;
  public isReSettledTickets: boolean;
  public scoreClass: string;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public isSupportExternalResult: boolean;
  private oldBetStatus = '';
  private readonly maxRound = 5;
  private refResultStatus: number = null;
  constructor(private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly toastrService: ToastrService) {
      this.confirmationDialogMessage.title = Language.confirmationBox;
  }
  
  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    console.log('ngOnInit');
  }

  async getMatch(matchId: number) {
    console.log('getMatch 1');

    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, false);
    const otherSportsMatch = await this.requestService.getMatch(query);
    this.match = otherSportsMatch.match;
    this.permission = otherSportsMatch.permission;
    this.matchDetail = this.match.matchDetail;
    this.isReadyMatch = this.isCompletedOrConfirmScore || this.checkPlayTimeBySportType;
    this.isSupportExternalResult = !UpcommingSports.includes(this.matchDetail.sportType);
    // this.fullTimeService.initScoreByPermission(this.matchDetail, this.permission);
    this.resetScore();
    console.log('getMatch 2');

  }

  private getResultDetails() {
    if(this.match.resultDetails?.length) {
      this.resultDetails = [{
        resourceId: "01",
        resourceName: "",
        homeName: "A",
        homeValue: "1",
        awayName: "B",
        awayValue: "2",
        resultStatusId: 1,
        settlementStatusId: 1,
        resultStatus: "running",
        ticketStatus: "",
        map: 1,
        groupBetType: 1,
        betType: "",
        betTypeName: "",
        checked: true,
        isResultWarning: false,
        isDurationWarning: false,
        externalScores: [],
        isScoreMismatched: false,
        disabled: false,
        resultSettingData: {
          isConfirmedRefund: false,
          isConfirmedRefundSdt: false,
          isHoldResult: false,
        },
        originalHomeValue: "",
        originalAwayValue: "",
        className:"",
        groupId: "",
        resultName: "",
        groupName:"",
        inputType: 1,
        isSpecialBettype: false,
        isDisplayedForMember: false,
        inputOptions: [],
        multipleResultSelect: new MultipleSelect(),
        otherInfo: "",
        isResultWarningByBetType: false,
        ordNo: 1,
        isShow: true
      }]
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

  public disableTextBox(resourceId: string, leagueType: number = 0) {
    return true;
  }

  private enableUncalculateButton() {
    return this.match.resultDetails.filter((map) => map.checked).length > 0;
  }

  public calculation() {
    this.toastrService.clear();
  }

  private verifyExternalSourceAndCalculate() {
    
  }

  private async confirmChangedResult() {
    // if (this.isReSettledTickets) {
    //   this.confirmCalculation();
    // } else {
    //   const query = {
    //     matchId: this.matchDetail.matchId
    //   };

    //   const result = await this.verificationService.verifyChangedSettledTickets(this.matchDetail, query);
    //   if (result) {
    //    this.confirmationDialogMessage.message = Language.recalculateNotification;
    //     this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
    //       this.isReSettledTickets = true;
    //     });
    //   } else {
    //     this.confirmCalculation();
    //   }
    // }
  }

  private confirmCalculation() {
    // this.confirmationDialogMessage.message = Language.CalculationConfirmMessage;
    // this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
    //   this.confirmationDialogMessage.message = Language.checkAgainConfirmation;
    //   this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
    //     const errorMessage = await this.fullTimeService.settle(CalculateAction.calculate,
    //                                     this.isReSettledTickets, this.matchDetail, this.refResultStatus);
    //     if(!_.isEmpty(errorMessage)) {
    //       this.toastrService.error(errorMessage);
    //     }
    //   });
    // });
  }

  public uncalculation() {
    // this.clearErrorMessage();
    // this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    // this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
    //   this.confirmationDialogMessage.message = Language.checkAgainUnSettleConfirmation;
    //   this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
    //     const errorMessage = await this.fullTimeService.settle(CalculateAction.unCalculate, this.isReSettledTickets, this.matchDetail);
    //     if(!_.isEmpty(errorMessage)) {
    //       this.toastrService.error(errorMessage);
    //     }
    //   });
    // });
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
    // this.toastrService.clear();
    // const errorMessage = this.verificationService.verifyCopyScore(this.match.matchDetail);
    // if(_.isEmpty(errorMessage)) {
    //   const message = Language.confirmMessageCopySBOScore.replace("'provider_name'", this.externalSourceName);
    //   this.confirmationDialogMessage.message = message;
    //   this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
    //     this.match.matchDetail.finalHomeScore = this.match.matchDetail.exFTHomeScore;
    //     this.match.matchDetail.finalAwayScore = this.match.matchDetail.exFTAwayScore;
    //   });
    // } else {
    //   this.toastrService.error(errorMessage);
    // }
  }

  public isFinalScoreConfirmed() {
    // return this.verificationService.isFinalScoreConfirmed(this.matchDetail)
    //   && !this.matchDetail.isCalculated && !this.matchDetail.isCalRefund;
  }

  // public get isScoreInconsistent() {
  //   // return this.verificationService.isScoreInconsistent(this.matchDetail);
  // }
}
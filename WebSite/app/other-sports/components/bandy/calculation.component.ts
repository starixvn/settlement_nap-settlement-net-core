import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import {
  ExternalResult,
  ExternalResultDetail,
  GeneralMatch,
  HedgeMatchDetail,
  MatchDetail,
  Permission,
  ResultDetail,
} from "../../../shared/models/sportsbook-sop";

import { ModalDialogMessage, MultipleSelect } from "../../../shared/models";
import {
  AioService,
  BlockUIService,
  MessageBoxService,
} from "../../../shared/services";
import {
  CalculateAction,
  MatchStatus,
  SportType,
} from "../../../shared/constants";
import { Language } from "../../../shared/language.native";
import * as _ from "lodash";
import { KickOffTime, UpcommingSports } from "../../constants";
import { ScorePipe } from "../../pipes";
import { RequestService } from "../../services/request.service";
import { SportTemplate } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID, ResourceIDs } from "./constant";
import { UrlHelper } from "../../../helper/url-helper";
import { VolleyballApiKeys } from "../../../badminton/constants/volleyball-api-keys.native";
import { BadmintonApiKeys } from "../../../badminton/constants/api-keys.native";
import { MatchAio } from "../../models/match-aio.model";
import { ResultDetailsService } from "./resultdetails.service";
@Component({
  selector: "calculation-actions",
  templateUrl: "./calculation.component.html",
  providers: [ScorePipe],
})
export class BandyCalculationComponent implements SportTemplate, OnInit {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;
  public isReadyMatch = true;

  public match: MatchAio;

  public matchDetail: MatchDetail;

  public resultDetails: ResultDetail[] = [];
  public originalResultDetails: ResultDetail[];
  public permission: Permission;
  public externalResults: ExternalResult[];

  public isReSettledTickets: boolean;
  public scoreClass: string;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public isSupportExternalResult: boolean;
  private oldBetStatus = "";
  private readonly maxRound = 5;
  private refResultStatus: number = null;
  public blockUI = true;
  public apiKeys = null;

  constructor(
    private readonly requestService: RequestService,
    private readonly resultDetailService: ResultDetailsService,
    private readonly messageBoxService: MessageBoxService,
    private readonly aioService: AioService,
    private readonly toastrService: ToastrService,
    private readonly injector: Injector
  ) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  ngOnInit(): void {
    this.injector
      .get(BlockUIService)
      .blockUIEvent.subscribe((event: boolean) => (this.blockUI = event));
  }

  async getMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    this.apiKeys = VolleyballApiKeys;
    const matchQuery = {
      matchId,
      apikey: this.apiKeys.NormalMatch,
      sportType,
      settleType: "MNL",
    };

    this.match = (await this.aioService.getMatch(matchQuery)) as MatchAio;

    this.initialData();

    this.viewData();
  }

  private initialData() {
    this.matchDetail = this.match.matchDetail;

    this.resultDetails = this.match.resultDetails;

    this.originalResultDetails = _.cloneDeep(this.match.resultDetails);

    this.permission = this.match.permission;

    this.externalResults = this.match.externalResults;

    console.log(this.resultDetails);
  }

  public changeScore() {
    this.resultDetails = this.resultDetailService.calcMatchResultDetails(this.resultDetails);
  }

  private viewData() {
    this.resultDetails = this.generateFullResultDetails();
    console.log(this.resultDetails);
  }

  private generateFullResultDetails(): ResultDetail[] {
    return ResourceIDs.map((resourceId) => {
      const result = this.resultDetails.find(
        (x) => resourceId === x.resourceId
      );
      if (result) {
        return result;
      }
      const newResult = new ResultDetail();
      newResult.resourceId = resourceId;
      newResult.homeValue = '';
      newResult.awayValue = '';
      return newResult;
    });
  }

  private get numberOfProvider() {
    return this.externalResults.length || 0;
  }

  public get existsSelectedResult() {
    return this.resultDetails.some((result) => result.checked);
  }

  public getExternalResultDetail(
    resourceId: string,
    externalResult: ExternalResult
  ) {
    const externalResultDetail = externalResult.resultDetails.find(
      (result) => resourceId === result.resourceId
    );

    return (
      externalResultDetail ??
      new ExternalResultDetail(0, resourceId, externalResult.sourceName)
    );
  }

  public viewExternalScore(resourceId: string, externalResult: ExternalResult) {
    const resultDetail = this.getExternalResultDetail(
      resourceId,
      externalResult
    );
    return _.isEmpty(resultDetail.homeValue) &&
      _.isEmpty(resultDetail.awayValue)
      ? "-"
      : `${resultDetail.homeValue}:${resultDetail.awayValue}`;
  }

  public isMatchResult(resourceId: string) {
    return ResourceID.FT === resourceId;
  }

  public isFistHalf(resourceId: string) {
    return ResourceID.HT === resourceId;
  }

  public showSelectCheckbox(resourceId: string) {
    return [ResourceID.FT, ResourceID.HT].includes(resourceId);
  }

  public get disabledET() {
    const { leagueType } = this.matchDetail;
    if([LeagueType.General, LeagueType.Regular].includes(leagueType)) {
      return true;
    }
    const fullTime = this.resultDetails.find(x => x.resourceId === ResourceID.FT);
    return  leagueType === LeagueType.OtPenalty && 
    !_.isEmpty(fullTime.homeValue) 
      && !_.isEmpty(fullTime.awayValue) 
      && !_.isEqual(fullTime.homeValue,fullTime.awayValue)
  }

  public get disbaledPEN() {
    const { leagueType } = this.matchDetail;
    if([LeagueType.General, LeagueType.Regular].includes(leagueType)) {
      return true;
    }
    const et = this.resultDetails.find(x => x.resourceId === ResourceID.ET);
    return  leagueType === LeagueType.OtPenalty && 
    !_.isEmpty(et.homeValue) 
      && !_.isEmpty(et.awayValue) 
      && !_.isEqual(et.homeValue,et.awayValue)
  }

  private enableUncalculateButton() {
  }

  public calculation() {
    this.toastrService.clear();
  }

  onCheckboxChange(e,resourceId) {
    console.log(e,resourceId)
  }

  private verifyExternalSourceAndCalculate() {}

  private async confirmChangedResult() {
  }

  private confirmCalculation() {
    this.confirmationDialogMessage.message = Language.CalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmationDialogMessage.message = Language.checkAgainConfirmation;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
        // const errorMessage = await this.fullTimeService.settle(CalculateAction.calculate,
        //                                 this.isReSettledTickets, this.matchDetail, this.refResultStatus);
        // if(!_.isEmpty(errorMessage)) {
        //   this.toastrService.error(errorMessage);
        // }
      });
    });
  }

  public uncalculation() {
    this.clearErrorMessage();
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

  

  private clearErrorMessage() {
    this.toastrService.clear();
    this.refResultStatus = null;
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  // public changeBetStatus() {
  //   this.matchDetail.betStatus = Number(this.matchDetail.betStatus) > this.maxRound || this.isZero(this.matchDetail.betStatus) ? this.oldBetStatus : this.matchDetail.betStatus;
  //   this.oldBetStatus = this.matchDetail.betStatus;
  // }

  private isZero(value: string) {
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
}

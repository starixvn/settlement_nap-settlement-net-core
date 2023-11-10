import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { ExternalResult, ExternalResultDetail, MatchDetail, Permission, ResultDetail} from "../../../shared/models/sportsbook-sop";
import { ModalDialogMessage } from "../../../shared/models";
import { AioService,BlockUIService,MessageBoxService } from "../../../shared/services";
import { Language } from "../../../shared/language.native";
import * as _ from "lodash";
import { RefResultStatus } from "../../constants";
import { SportTemplate } from "../../../shared/models/sportsbook-sop";
import { ResourceID } from "./constant";
import { UrlHelper } from "../../../helper/url-helper";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";

import { MatchAio } from "../../models/match-aio.model";
import { ResultDetailsService } from "./resultdetails.service";
import { ValidationService } from "./validation.service";
import { MatchInfoCompoment } from "./match-info.compoment";
import { CalculateCommonModule } from "../../../shared/modules/calculate-common.module";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { CalculateAction, SettlementStatusId } from "../../../shared/constants";
import { BandyService } from "./bandy.service";

@Component({
  selector: "calculation-actions",
  templateUrl: "./calculation.component.html",
  providers: [IntervalBackgroundPipe, ValidationService,BandyService],
  standalone: true,
  imports: [CalculateCommonModule, MatchInfoCompoment, BandyResourceNamePipe],
})
export class BandyCalculationComponent implements SportTemplate, OnInit {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;
  public isReadyMatch = true;

  public match: MatchAio;

  public matchDetail: MatchDetail;

  public resultDetails: ResultDetail[] = [];
  public originalResultDetails: ResultDetail[];
  public matchResultOriginal: ResultDetail;
  public permission: Permission;

  public externalResults: ExternalResult[];
  public providerResultDetails: ExternalResultDetail[] = [];
  public externalSourceName: string;

  public isReSettledTickets: boolean;
  
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  
  public blockUI = true;
  
  private refResultStatus: number | null = null;

  constructor(
    private readonly resultDetailService: ResultDetailsService,
    private readonly validationService: ValidationService,
    private readonly messageBoxService: MessageBoxService,
    private readonly aioService: AioService,
    private readonly toastrService: ToastrService,
    private readonly injector: Injector,
    private readonly intervalBackgroundPipe: IntervalBackgroundPipe,
    private readonly bandyService: BandyService
  ) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.toastrService.overlayContainer = this.toastContainer;
  }

  ngOnInit(): void {
    this.injector
      .get(BlockUIService)
      .blockUIEvent.subscribe((event: boolean) => (this.blockUI = event));
  }

  async getMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    const matchQuery = {
      matchId,
      apikey: "bandy",
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

    this.matchResultOriginal = _.clone(this.matchResult);

    this.permission = this.match.permission;

    this.generateProviderResultDetails();
  }

  private generateProviderResultDetails() {
    this.externalResults = this.match.externalResults;

    if (this.externalResults?.length) {
      this.externalSourceName = this.externalResults[0].sourceName;
      this.providerResultDetails = this.externalResults[0].resultDetails;
    }
  }

  private viewData() {
    this.resultDetails = this.resultDetailService.generateFullResultDetails(this.resultDetails);

    this.disabledInputResult();

    this.checkScoreMissMatchedOnload();
  }

  private checkScoreMissMatchedOnload() {
      this.checkTraderScore();
      this.checkProviderScore();
  }

  private checkTraderScore() {
    this.validationService.verifyTraderScore(this.resultDetails,this.leagueType);
  }

  private checkProviderScore() {
    _.forEach(this.resultDetails, (result) => {
      result.isScoreMismatched = this.validationService.inValidResultDetailWithProvider(result,this.providerResultDetails);
    })
  }

  private disabledInputResult() {
    this.resultDetailService.disabledInputResult(this.resultDetails,this.leagueType);
  }

  public get leagueType() {
    return this.matchDetail.leagueType;
  }

  public get isLeader() {
    return this.permission.isLeader;
  }

  public get existsSelectedResult() {
    return this.resultDetails.some((result) => result.checked);
  }

  public get selectedResults() {
    return this.resultDetails.filter((result) => result.checked);
  }

  public get matchResult() {
    return this.resultDetails.find((x) => x.resourceId === ResourceID.Match);
  }

  public get fullTimeResult() {
    return this.resultDetails.find((x) => x.resourceId === ResourceID.FullTime);
  }

  public get firstHalfResult() {
    return this.resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
  }

  public get existsInValidResult() {
    return this.resultDetails.some(x => x.inValid);
  }

  public existsConfirmedRefund() {
    return this.selectedResults.some(x => x.resultSettingData.isConfirmedRefund)
  }

  public isConfirmed(resultDetail: ResultDetail) {
    if (
      [ResourceID.Et, ResourceID.Pen, ResourceID.Match, ResourceID.FullTime]
    ) {
      return (
        this.isLeader && this.matchResult.resultSettingData.isConfirmedRefund
      );
    } else {
      return this.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }
  }

  private getExternalResultDetail(
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

  public isFulltimeResult(resourceId: string) {
    return ResourceID.FullTime === resourceId;
  }

  public isFistHalf(resourceId: string) {
    return ResourceID.FirstHalf === resourceId;
  }

  public showSelectCheckbox(resourceId: string) {
    return [ResourceID.FullTime, ResourceID.FirstHalf].includes(resourceId);
  }

  public calculation() {
    this.match.isClickOnCalculate = true;
    this.toastrService.clear();
    this.refResultStatus = null;

    if (this.existsConfirmedRefund()) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (this.validationService.invalidInputScore(this.selectedResults,this.match.isScoreDirect,ResourceID.Match)) {
      this.toastrService.error(Language.warningInputScore);
    } else if ( this.validationService.inValidResult(this.resultDetails, this.leagueType)) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource();
    }
  }

  private confirmScoreSource() {
    const isSourceInsufficient = this.validationService.isInsufficientSOPLite(this.matchDetail,this.originalResultDetails,this.providerResultDetails,ResourceID.Match);
    const isInconsistent = this.validationService.isConsistentScore(this.originalResultDetails,this.providerResultDetails,this.resultDetails,this.matchDetail,ResourceID.Match);

    if (isSourceInsufficient || isInconsistent) {
      if (!this.isLeader) {
        this.toastrService.error(
          Language.otherSports.warningCalculateInconsistent
        );
      } else {
        this.confirmationDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.refResultStatus = isSourceInsufficient
            ? RefResultStatus.NoReference
            : RefResultStatus.ValuesInsconsistency;
          this.confirmChangedResult();
        });
      }
    } else {
      this.confirmChangedResult();
    }
  }

  public isErrorOnVerification(resultDetail: ResultDetail) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourceID.Match) {
      disabled = !this.match.isScoreDirect;
    }
    return (
      this.match.isClickOnCalculate &&
      !disabled &&
      resultDetail.checked &&
      (!resultDetail.homeValue || !resultDetail.awayValue)
    );
  }

  public onSelectResult(event, resourceId) {
    if (resourceId === ResourceID.FullTime) {
      _.forEach(this.resultDetails, (result) => {
        if (
          [ResourceID.Et, ResourceID.Pen, ResourceID.Match].includes(
            result.resourceId
          )
        ) {
          result.checked = event;
        }
      });
    }
  }

  private async confirmChangedResult() {
    if (this.isReSettledTickets) {
      this.confirmCalculation(this.resultDetails);
    } else {
      const getResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: "bandy",
        sportType: this.match.matchDetail.sportType,
      };

      const result = await this.aioService.verifyChangedSettledTickets(
        this.match.resultDetails,
        getResultQuery
      );
      if (result) {
        this.confirmationDialogMessage.message =
          Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(this.selectedResults);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    const confirmMessage = this.validationService.getCalculationConfirmMessage(resultDetails,new BandyResourceNamePipe());
    this.confirmationDialogMessage.message = confirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.bandyService.sendSettleRequest(
        CalculateAction.calculate,
        this.matchDetail,
        this.selectedResults,
        this.isReSettledTickets,
        this.match.isScoreDirect,
        this.isLeader,
        this.refResultStatus
      );
    });
  }

  public getConfirmedBackground(total: ResultDetail, isFinal: boolean) {
    return isFinal &&
      this.validationService.isScoreConfirmed(
        this.matchDetail,
        this.matchResultOriginal
      ) &&
      total.settlementStatusId === SettlementStatusId.Running
      ? "bg-result-confirmed"
      : "";
  }


  public uncalculation() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.bandyService.sendSettleRequest(
        CalculateAction.unCalculate,
        this.matchDetail,
        this.match.resultDetails,
        this.isReSettledTickets,
        this.match.isScoreDirect,
      );
    });
  }

  public verifyAndAutoFillScore(resultDetail: ResultDetail) {
    this.resultDetailService.calcMatchResultDetails(this.resultDetails,this.leagueType);

    this.verifyInputScore(resultDetail);

    this.changeScore();
  }

  private changeScore() {
    this.disabledInputResult();
    this.resultDetailService.resetHomeAwayValue(this.resultDetails);
  }

  private verifyInputScore(resultDetail: ResultDetail) {
    this.validationService.verifyFhFtPen(this.resultDetails);
    
    if(!this.existsInValidResult) {
      this.validationService.verifyMatch(this.resultDetails);
    }
   
    if(!this.existsInValidResult) {
      this.validationService.verifyMatchSum(this.resultDetails,this.leagueType);
    }

    // verify originalResults
    if (this.hasTrader()) {
      resultDetail.inValid = this.validationService.inValidResultDetailWithOriginal(resultDetail, this.originalResultDetails);
    }

    // verify Provider
    if(this.hasProvider()) {
      resultDetail.isScoreMismatched = this.validationService.inValidResultDetailWithProvider(resultDetail,this.providerResultDetails);
    }
  }
  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public copyScore() {
    this.toastrService.clear();
    this.createConfirmMessageCopy();
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.resultDetailService.copyResultFromProvider(this.resultDetails,this.providerResultDetails);
    });
  }

  private createConfirmMessageCopy() {
    const message = Language.confirmMessageCopySBOScore.replace("'provider_name'",this.externalSourceName);
    this.confirmationDialogMessage.message = message;
  }

  
  public getIntervalBackground(settlementStatusId: number) {
    return this.intervalBackgroundPipe.transform(settlementStatusId);
  }

  private hasTrader() {
    return this.validationService.hasTraderConfirmed(this.matchDetail,this.originalResultDetails,ResourceID.Match);
  }

  private hasProvider() {
    return this.validationService.hasProvider(this.providerResultDetails);
  }

}

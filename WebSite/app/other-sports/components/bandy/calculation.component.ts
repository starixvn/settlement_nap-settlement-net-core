import { Component, Injector, OnInit, ViewChild, inject } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { ExternalResult, ExternalResultDetail, MatchDetail, Permission, ResultDetail} from "../../../shared/models/sportsbook-sop";
import { ModalDialogMessage } from "../../../shared/models";
import { AioService,BlockUIService,MessageBoxService } from "../../../shared/services";
import { Language } from "../../../shared/language.native";
import * as _ from "lodash";
import { KickOffTime, RefResultStatus } from "../../constants";
import { SportTemplate } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID } from "./constant";
import { UrlHelper } from "../../../helper/url-helper";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";

import { MatchAio } from "../../models/match-aio.model";
import { ResultDetailsService } from "./resultdetails.service";
import { ValidationService } from "./validation.service";
import { MatchInfoCompoment } from "./match-info.compoment";
import { CalculateCommonModule } from "../../../shared/modules/calculate-common.module";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { CalculateAction, MatchStatus, ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { BandyService } from "./bandy.service";
import { BetStatusService } from "./betstatus.service";

@Component({
  selector: "calculation-actions",
  templateUrl: "./calculation.component.html",
  providers: [IntervalBackgroundPipe, ValidationService,BandyService,BetStatusService],
  standalone: true,
  imports: [CalculateCommonModule, MatchInfoCompoment, BandyResourceNamePipe,],
})
export class BandyCalculationComponent implements SportTemplate, OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  private readonly apiKey = 'bandy';
  public isReadyMatch = true;
  public match: MatchAio;
  public matchDetail: MatchDetail;

  public resultDetails: ResultDetail[] = [];
  public originalResults: ResultDetail[] = [];
  public confirmResultDetails: ResultDetail[];
  public permission: Permission;

  public externalResult: ExternalResult | null = null;
  public providerResultDetails: ExternalResultDetail[] = [];
  public externalSourceName: string = '-';

  public isReSettledTickets: boolean;
  private refResultStatus: number | null = null;

  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  
  public blockUI = true;

  toastrService = inject(ToastrService);
  blockUIService = inject(BlockUIService);
  resultDetailService= inject( ResultDetailsService);
  validationService= inject( ValidationService);
  messageBoxService= inject(MessageBoxService);
  aioService= inject(AioService);
  bandyService= inject( BandyService);
  betStatusService = inject(BetStatusService);



  ngOnInit(): void {
    this.confirmationDialogMessage.title = Language.confirmationBox;
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
  }

  async getMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    const matchQuery = {
      matchId,
      apikey:this.apiKey,
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

    this.originalResults = _.cloneDeep(this.match.resultDetails);
    this.confirmResultDetails = this.resultDetailService.generateConfirmResultDetails(this.match.resultDetails);

    this.permission = this.match.permission;

    this.isReadyMatch = this.isCompletedOrConfirmScore(this.matchDetail) || this.matchDetail.playTime >= KickOffTime.playTime;

    this.createProviderResource();
  }

  private createProviderResource() {
    this.externalResult = this.match.externalResults.length ? this.match.externalResults[0] : null;
    this.externalSourceName = this.externalResult ? this.externalResult.sourceName : '-';
    this.providerResultDetails = this.resultDetailService.generateFullExternalResultDetails(this.externalResult);
  }

  private viewData() {
    this.resultDetailService.hidenScoreResultDetails(this.resultDetails,this.isLeader);
    
    this.resultDetails = this.resultDetailService.generateFullResultDetails(this.resultDetails);
    
    this.disabledInputResult();
    
    this.checkScoreMissMatchedOnload();
  }

  private checkScoreMissMatchedOnload() {
      this.checkProviderScore();
  }
  private checkProviderScore() {
   if(this.hasProvider) {
    _.forEach(this.resultDetails, (result) => {
      const originalResult = this.originalResults.find(x => x.resourceId === result.resourceId 
        && result.settlementStatusId !== SettlementStatusId.Refund);
      result.isScoreMismatched = this.validationService.inValidResultDetailWithProvider(originalResult,this.providerResultDetails);
    })
   }
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
    return this.resultDetails.filter((result) => result.checked && (!result.disabled || result.resourceId === ResourceID.Final));
  }

  public get finalResult() {
    return this.resultDetails.find((x) => x.resourceId === ResourceID.Final);
  }

  public get firstHalfResult() {
    return this.resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
  }

  public get onlySelectedFirstHalf() {
    return this.selectedResults.length === 1 && this.selectedResults.some(x => x.resourceId === ResourceID.FirstHalf);
  }

  public existsConfirmedRefund() {
    return this.selectedResults.some(x => x.resultSettingData.isConfirmedRefund)
  }

  public isConfirmed(resultDetail: ResultDetail) {
    if ([ResourceID.Et, ResourceID.Pen, ResourceID.Final, ResourceID.FullTime].includes(resultDetail.resourceId)) {
      return (
        this.isLeader && this.finalResult.resultSettingData.isConfirmedRefund
      );
    } else {
      return this.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }
  }

  public viewExternalScore(resourceId: string) {
    const resultDetail = this.providerResultDetails.find(x => x.resourceId === resourceId);
    return _.isEmpty(resultDetail?.homeValue) &&
      _.isEmpty(resultDetail?.awayValue)
      ? "-"
      : `${resultDetail.homeValue}:${resultDetail.awayValue}`;
  }

  public isFulltimeResult(resourceId: string) {
    return ResourceID.FullTime === resourceId;
  }

  public isFistHalf(resourceId: string) {
    return ResourceID.FirstHalf === resourceId;
  }

  private isCompletedOrConfirmScore(matchDetail: MatchDetail) {
      return matchDetail.confirmHT > 0 || matchDetail.confirmFT > 0 || !!this.confirmResultDetails?.length
          || _.isEqual(matchDetail.eventStatus, MatchStatus.Completed);
  }

  public calculation() {
    this.match.isClickOnCalculate = true;
    this.toastrService.clear();
    this.refResultStatus = null;

    if (this.existsConfirmedRefund()) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (this.validationService.invalidInputScore(this.selectedResults,true,ResourceID.Final)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.onlySelectedFirstHalf && this.validationService.invalidFistHalf(this.resultDetails)) {
      this.toastrService.error(Language.inconsistentValues);
    }  else if (!this.onlySelectedFirstHalf && this.validationService.inValidResult(this.resultDetails)) {
      this.toastrService.error(Language.inconsistentValues);
    } else if (!this.validationService.allowCalcFinalResult(this.firstHalfResult,this.finalResult)) {
      this.toastrService.error(Language.IntervalWarning);
    }
    else {
      this.confirmScoreSource();
    }
  }

  private confirmScoreSource() {
    const isSourceInsufficient = this.validationService.isInsufficientSOPLite(this.confirmResultDetails,this.externalResult);

    const currentSelectedResults = this.resultDetails.filter(x => x.checked);
    const isInconsistent = this.validationService.isConsistentScoreSOPLite(currentSelectedResults,this.confirmResultDetails,this.externalResult);

    if (isSourceInsufficient || isInconsistent) {
      if (!this.isLeader) {
        this.toastrService.error(
          Language.otherSports.warningCalculateInconsistent
        );
      } else {
        this.confirmationDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.match.isClickOnCalculate = false;
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
    return (
      this.match.isClickOnCalculate &&
      resultDetail.checked && !resultDetail.disabled &&
      (!resultDetail.homeValue || !resultDetail.awayValue)
    );
  }

  public onSelectResult(event, resourceId) {
    this.match.isClickOnCalculate = false;
    if (resourceId === ResourceID.FullTime) {
      _.forEach(this.resultDetails, (result) => {
        if (
          [ResourceID.Et, ResourceID.Pen, ResourceID.Final].includes(
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
      this.confirmCalculation(this.selectedResults);
    } else {
      const getResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey:this.apiKey,
        sportType: this.match.matchDetail.sportType,
      };
      const settleResult = this.selectedResults.filter(x => this.validationService.hasScore(x));
      const result = await this.aioService.verifyChangedSettledTickets(
        settleResult,
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

  private  confirmCalculation(resultDetails: ResultDetail[]) {
    this.match.isClickOnCalculate = false;
    const confirmMessage = this.validationService.getCalculationConfirmMessage(resultDetails,new BandyResourceNamePipe());
    this.confirmationDialogMessage.message = confirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      const settleResult = this.selectedResults.filter(x => this.validationService.hasScore(x));
      this.sendRequest(settleResult, CalculateAction.calculate)
    });
  }

  private async sendRequest(settleResult: ResultDetail[],action: string) {
    const betStatus = this.betStatusService.createBetStatusCalc(settleResult,this.firstHalfResult,this.finalResult);

    const result = await this.bandyService.sendSettleRequest({
      type: action,
      matchDetail: this.matchDetail,
      resultDetails: settleResult,
      isReSettledTickets: this.isReSettledTickets,
      isScoreDirect: this.match.isScoreDirect,
      isLeader: this.isLeader,
      refResultStatus: this.refResultStatus,
      betStatus
    });

    if (!result.isSuccessful) {
      this.toastrService.error(result.errMsg);
    } else {
      this.messageBoxService.closePopup();
    }
  }

  public getClassName(result: ResultDetail) {
    let className = '';
  
    if(result.resultStatusId === ResultStatusId.TraderConfirm) {
      className = 'bg-result-confirmed '
    }

    if(this.validationService.inValidResult(this.resultDetails)) {//confirm or calculation score
        className += 'col-mismatched ';
    }

    className += this.getIntervalBackground(result.settlementStatusId)
    return className;
  }


  public uncalculation() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.match.isClickOnCalculate = false;

    const resourceIds = this.leagueType === LeagueType.OtPenalty 
    ? [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen, ResourceID.Final] 
    : [ResourceID.FullTime,ResourceID.Final];
    
    const undoResults = this.resultDetails.filter(x => x.checked 
        && (x.resourceId === ResourceID.FirstHalf || resourceIds.includes(x.resourceId)));

    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.sendRequest(undoResults, CalculateAction.unCalculate)
    });
  }

  public verifyAndAutoFillScore(resultDetail: ResultDetail) {
    this.disabledInputResult();
    
    this.resultDetailService.resetHomeAwayValue(this.resultDetails);
    
    this.resultDetails = this.resultDetailService.calcMatchResultDetails(this.resultDetails);

    const resultsChanged = [ResourceID.FullTime,ResourceID.Et,ResourceID.Pen].includes(resultDetail.resourceId) 
    ? [resultDetail,this.finalResult] 
    : [resultDetail];

    this.validationService.verifyResultChanged(resultsChanged,this.confirmResultDetails,this.providerResultDetails);
  }


  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public copyScore() {
    this.toastrService.clear();
    if(!this.externalResult || !this.providerResultDetails?.length) {
      return;
    } 
    this.createConfirmMessageCopy();
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.resultDetailService.copyResultFromProvider(this.resultDetails,this.providerResultDetails);
      this.resultDetailService.disabledInputResult(this.resultDetails,this.leagueType);
      this.validationService.verifyResultChanged(this.resultDetails,this.confirmResultDetails,this.providerResultDetails)
    });
  }

  private createConfirmMessageCopy() {
    const message = Language.confirmMessageCopySBOScore.replace("'provider_name'",this.externalSourceName);
    this.confirmationDialogMessage.message = message;
  }

  
  public getIntervalBackground(settlementStatusId: number) {
    return this.bandyService.getIntervalBackground(settlementStatusId)
  }

  private hasProvider() {
    return !!this.externalResult;
  }



}

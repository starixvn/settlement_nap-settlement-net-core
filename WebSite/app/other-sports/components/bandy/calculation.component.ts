import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { ExternalResult, ExternalResultDetail, MatchDetail, Permission, ResultDetail, } from "../../../shared/models/sportsbook-sop";

import { ModalDialogMessage, ResultSettingModel } from "../../../shared/models";
import { AioService, BlockUIService, MessageBoxService, } from "../../../shared/services";
import { Language } from "../../../shared/language.native";
import * as _ from "lodash";
import { RefResultStatus } from "../../constants";
import { SportTemplate } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID, ResourceIDs } from "./constant";
import { UrlHelper } from "../../../helper/url-helper";
import { VolleyballApiKeys } from "../../../badminton/constants/volleyball-api-keys.native";
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';

import { MatchAio } from "../../models/match-aio.model";
import { ResultDetailsService } from "./resultdetails.service";
import { ValidationService } from "./validation.service";
import { MatchInfoCompoment } from "./match-info.compoment";
import { CalculateCommonModule } from "../../../shared/modules/calculate-common.module";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { CalculateAction } from "../../../shared/constants";
import { SettleQuery } from "../../models";

@Component({
  selector: "calculation-actions",
  templateUrl: "./calculation.component.html",
  providers: [IntervalBackgroundPipe,ValidationService],
  standalone: true,
  imports: [CalculateCommonModule, MatchInfoCompoment,BandyResourceNamePipe],
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
  public providerResultDetails: ExternalResultDetail[] = [];
  public externalSourceName: string;

  public isReSettledTickets: boolean;
  public scoreClass: string;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public isSupportExternalResult: boolean;
  public blockUI = true;
  public apiKeys = null;
  private refResultStatus: number = null;


  constructor(
    private readonly resultDetailService: ResultDetailsService,
    private readonly validationService: ValidationService,
    private readonly messageBoxService: MessageBoxService,
    private readonly aioService: AioService,
    private readonly toastrService: ToastrService,
    private readonly injector: Injector,
    private readonly intervalBackgroundPipe: IntervalBackgroundPipe
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
    this.apiKeys = VolleyballApiKeys;
    const matchQuery = {
      matchId,
      apikey: 'bandy',
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

    this.externalSourceName = this.externalResults[0].sourceName;

    this.providerResultDetails = this.externalResults[0].resultDetails;

  }

  public changeScore() {
    const maps = this.match.resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourceID.MATCH)
      && this.validationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));

    this.validationService.sumTotalScores(maps, ResourceID.FT, this.matchResult);

  }

  private viewData() {
    this.resultDetails = this.generateFullResultDetails();
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
      newResult.resultSettingData = new ResultSettingModel();
      newResult.resultSettingData.isConfirmedRefund = false;

      return newResult;
    });
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
    return this.resultDetails.find(x => x.resourceId === ResourceID.MATCH);
  }

  public existResultConfirmed() {
    return _.find(this.selectedResults, item => item.resultSettingData.isConfirmedRefund);
  }

  public isConfirmed(resultDetail: ResultDetail) {
    if ([ResourceID.ET,ResourceID.PEN,ResourceID.MATCH,ResourceID.FT]) {
      return this.isLeader && this.matchResult.resultSettingData.isConfirmedRefund;
    } else {

      return this.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }
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

  public calculation() {
    this.match.isClickOnCalculate = true;
    this.toastrService.clear();
    this.refResultStatus = null;

    if (!_.isNil(this.existResultConfirmed())) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (this.validationService.invalidInputScore(this.selectedResults, this.match.isScoreDirect, ResourceID.MATCH)) {
      this.toastrService.error(Language.warningInputScore);
    } else if(this.validationService.inValidFirstHalf(this.resultDetails) || this.validationService.inValidMatch(this.resultDetails)) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource();
    }   
  }

  private confirmScoreSource() {
    const isSourceInsufficient = this.validationService.isInsufficientSOPLite(this.matchDetail,this.originalResultDetails, this.providerResultDetails,ResourceID.MATCH);
    // const isInconsistent = this.va.isConsistentScore(this.resultDetailsOriginal,this.providerResultDetails,this.resultDetails,this.matchDetail);
    
    if (isSourceInsufficient) {
      if (!this.isLeader) {
        this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
      } else {
        this.confirmationDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.refResultStatus = isSourceInsufficient ? RefResultStatus.NoReference : RefResultStatus.ValuesInsconsistency;
          this.confirmChangedResult();
        });
      }
    } else {
      this.confirmChangedResult();
    }
  }

  public isErrorOnVerification(resultDetail: ResultDetail) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourceID.MATCH) {
      disabled = !this.match.isScoreDirect;
    }
    return this.match.isClickOnCalculate && !disabled && resultDetail.checked && (!resultDetail.homeValue || !resultDetail.awayValue);
  }

  public onSelectResult(event,resourceId) {
   if(resourceId === ResourceID.FT) {
      _.forEach(this.resultDetails, result => {
        if([ResourceID.ET,ResourceID.PEN,ResourceID.MATCH]) {
          result.checked = event; // handle for leagueType
        }
      })
   }
  }

  private async confirmChangedResult() {
    if (this.isReSettledTickets) {
      this.confirmCalculation(this.resultDetails);
    } else {
      const getResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: this.apiKeys.NormalMatch,
        sportType: this.match.matchDetail.sportType,
      };

      const result = await this.aioService.verifyChangedSettledTickets(this.match.resultDetails, getResultQuery);
      if (result) {
        this.confirmationDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation(this.resultDetails);
      }
    }
  }

  private confirmCalculation(resultDetails: ResultDetail[]) {
    const confirmMessage = this.validationService.getCalculationConfirmMessage(resultDetails, new BandyResourceNamePipe());
    this.confirmationDialogMessage.message = confirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.sendRequest(CalculateAction.calculate, this.match.matchDetail.matchId,
        this.selectedResults, this.isReSettledTickets, this.match.isScoreDirect);
    });
  }

  public getClass(resultDetail: ResultDetail) {
    let className = '';
    if(this.validationService.inValidFirstHalfNEW(resultDetail,this.resultDetails)) {
      className = 'col-mismatched ';
    }
    return className 
    // + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId)
  }

  private async sendRequest(type: string, matchId: number, resultDetailList: ResultDetail[],
    isReSettledTickets: boolean, isScoreDirect: boolean) {
    // const childMatchIds = this.ChildMatchSelected.map(item => item.matchId).join(',');
    if (type === CalculateAction.unCalculate) {
      resultDetailList.forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
    }

    const settleQuery = new SettleQuery(this.match.matchDetail, resultDetailList, type,
      isReSettledTickets, isScoreDirect, "");
    settleQuery.refResultStatus = this.refResultStatus;

    const result = await this.aioService.push(settleQuery);
    
  }

  public uncalculation() {
    this.toastrService.clear();
    this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.sendRequest(CalculateAction.unCalculate, this.match.matchDetail.matchId,
        this.match.resultDetails, this.isReSettledTickets, this.match.isScoreDirect);
    });
  }

  public verifyAndAutoFillScore(resultDetail: ResultDetail) {
   
    this.changeScore();
  }

  

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public copyScore() {
    this.toastrService.clear();

      const message = Language.confirmMessageCopySBOScore.replace("'provider_name'", this.externalSourceName);
      this.confirmationDialogMessage.message = message;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        _.forEach(this.resultDetails, resultDetail => {
          const providerResult = this.providerResultDetails.find(p => resultDetail.resourceId === p.resourceId);
          if(providerResult) {
            resultDetail.homeValue = providerResult.homeValue;
            resultDetail.awayValue = providerResult.awayValue;
          }
        })

      });
  }
}

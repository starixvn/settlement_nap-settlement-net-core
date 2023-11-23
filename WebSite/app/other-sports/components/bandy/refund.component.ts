import { ToastContainerDirective } from "ngx-toastr";
import { RefundActionBaseComponent } from "../../../shared/components/sportsbook-sop/refund-action-base.component";
import { Permission, ResultDetail, SportTemplate } from "../../../shared/models/sportsbook-sop";
import { Match, MatchAio } from "../../models";
import { Component, ViewChild } from "@angular/core";
import { ModalDialogMessage, ResultSettingModel } from "../../../shared/models";
import { Language } from "../../../shared/language.native";
import { UrlHelper } from "../../../helper";
import { MatchInfoCompoment } from "./match-info.compoment";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { CalculateCommonModule } from "../../../shared/modules/calculate-common.module";
import { ResultDetailsService } from "./resultdetails.service";
import { LeagueType, ResourceID } from "./constant";
import { BandyService } from "./bandy.service";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import * as _ from "lodash";

@Component({
  templateUrl: './refund.component.html',
  standalone: true,
  providers: [ResultDetailsService,IntervalBackgroundPipe,BandyService,],
  imports: [CalculateCommonModule, MatchInfoCompoment, BandyResourceNamePipe,],

})
export class BandyRefundComponent extends RefundActionBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: MatchAio;
  private apiKey = 'bandy';

  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage(Language.confirmationBox);
 
  async getMatch(matchId: number) {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    const matchQuery = {
      matchId,
      apikey: this.apiKey,
      sportType,
      settleType: "MNL",
    };

    this.match = (await this.aioService.getMatch(matchQuery)) as MatchAio;

    this.initData();
  }

  constructor(private readonly resultDetailService: ResultDetailsService,
    private bandyService: BandyService
    ) {
      super();
    }

  public get refundResultDetails() {
    return this.resultDetails.filter(x => [ResourceID.FirstHalf,ResourceID.Final].includes(x.resourceId))
  } 

  public get existsConfirmed() {
    return this.resultDetails.some(x => x.resultSettingData.isConfirmedRefund);
  }

  private initData() {
    this.resultDetails = this.match.resultDetails;
    this.matchDetail = this.match.matchDetail;
    this.permission = this.match.permission
  }

  public async refund() {
    const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
    const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
    this.toastrService.clear();
    if (this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else if (res.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.doRefund();
      });
    }
  }

  public async doRefund() {
    const query = this.generateRefundQuery("");
    const result = await this.aioService.push(query);
    if (result.errCode === 0) {
      this.refundHedgeMatch(query);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public getIntervalBackground(settlementStatusId: number) {
    return this.bandyService.getIntervalBackground(settlementStatusId)
  }

  public onSelectResult(event, resourceId) {
    if (resourceId === ResourceID.Final) {
      const resourceIds = this.matchDetail.leagueType === LeagueType.OtPenalty 
      ? [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen] 
      : [ResourceID.FullTime];
      
      _.forEach(this.resultDetails, (result) => {
        if (resourceIds.includes(result.resourceId)) {
          result.checked = event;
        }
      });
    }
  }

}
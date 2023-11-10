import { ToastContainerDirective } from "ngx-toastr";
import { RefundActionBaseComponent } from "../../../shared/components/sportsbook-sop/refund-action-base.component";
import { Permission, SportTemplate } from "../../../shared/models/sportsbook-sop";
import { Match, MatchAio } from "../../models";
import { Component, ViewChild } from "@angular/core";
import { ModalDialogMessage } from "../../../shared/models";
import { Language } from "../../../shared/language.native";
import { UrlHelper } from "../../../helper";
import { MatchInfoCompoment } from "./match-info.compoment";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { CalculateCommonModule } from "../../../shared/modules/calculate-common.module";
import { ResultDetailsService } from "./resultdetails.service";

@Component({
  templateUrl: './refund.component.html',
  standalone: true,
  providers: [ResultDetailsService],
  imports: [CalculateCommonModule, MatchInfoCompoment, BandyResourceNamePipe,],

})
export class RefundComponent extends RefundActionBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: MatchAio;

  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage(Language.confirmationBox);
 
  async getMatch(matchId: number) {
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    const matchQuery = {
      matchId,
      apikey: "bandy",
      sportType,
      settleType: "MNL",
    };

    this.match = (await this.aioService.getMatch(matchQuery)) as MatchAio;
  }

  constructor(private readonly resultDetailService: ResultDetailsService,
    ) {
      super()
    }

  public get refundResultDetails() {
    return this.resultDetailService.generateRefundResultDetails(this.resultDetails);
  } 

  public existsConfirmed() {
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


}
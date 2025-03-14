import { Component, inject, ViewChild } from "@angular/core";
import { ToastContainerDirective } from "ngx-toastr";
import * as _ from "lodash";
import {
  CalculateAction,
  EventStatus,
  SportType,
} from "../../shared/constants";
import { ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language.native";
import { Match } from "../models";
import {
  BadmintonApiKeys,
  ResourcesIds,
  TableTennisApiKeys,
  VolleyballApiKeys,
} from "../constants";
import { SettleQuery, SportTemplate } from "../../shared/models/sportsbook-sop";
import { RefundActionBaseComponent } from "../../shared/components/sportsbook-sop/refund-action-base.component";
import { UrlHelper } from "../../helper";
import { ExcludeTotalPointPipe, ResourceNameByIdPipe } from "../pipes";
import { MatchDetailComponent } from "./match-detail.component";
import { RefundCommonModule } from "../../shared/modules/refund-common.module";
import { BadmintonService } from "../services";

@Component({
  selector: "refund-actions",
  templateUrl: "./refund-actions.component.html",
  standalone: true,
  imports: [
    RefundCommonModule,
    ExcludeTotalPointPipe,
    MatchDetailComponent,
    ResourceNameByIdPipe,
  ],
  providers: [BadmintonService,ResourceNameByIdPipe,],
})
export class RefundActionsComponent
  extends RefundActionBaseComponent
  implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;
  public match: Match;
  public readonly isReSettledTickets: boolean;
  public readonly confirmationDialogMessage: ModalDialogMessage =
    new ModalDialogMessage(Language.confirmationBox);
  public apiKeys = null;
  public blockUI = true;
  public isSettleRelated = false;
  private readonly resourceNameByIdPipe = inject(ResourceNameByIdPipe);

  public get isSupportSettleRelated() {
    return [SportType.tableTennis, SportType.beachVolleyball].includes(this.matchDetail.sportType) 
      && this.matchDetail.parentId === 0;
  }

  async getMatch(matchId: number): Promise<void> {
    this.initService();
    const sportType = Number(UrlHelper.getUrlParameter("sportType"));
    this.getApiKeys(sportType);
    

    const matchQuery = {
      matchId,
      sportType,
      apikey: this.apiKeys.NormalMatch,
      settleType: "MNL",
    };

    this.match = (await this.aioService.getMatch(matchQuery)) as Match;
    this.init();
  }

  
  private getApiKeys(sportType) {

    if(sportType === SportType.tableTennis) {
      this.apiKeys =  TableTennisApiKeys
      return;
    }

    if(sportType === SportType.volleyBall) {
      this.apiKeys =  VolleyballApiKeys
      return;
    }

    
    this.apiKeys =  BadmintonApiKeys;
  }

  public initService() {
    this.blockUIService.blockUIEvent.subscribe(
      (event: boolean) => (this.blockUI = event)
    );
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.resultDetails = this.match.resultDetails;
    this.matchDetail = this.match.matchDetail;
    this.permission = this.match.permission;
    this.isSettleRelated = this.isSupportSettleRelated;
    this.cloneResultDetail();
  }

  public async refund() {
    const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
    const res = await this.aioService.checkMarkedTickets(
      paramsCheckingMarkedTickets
    );
    this.toastrService.clear();
    if (this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
      return;
    }

    if (res.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
      return;
    }

    this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
      this.confirmChildMatchRefund();
    });
  }

  private confirmChildMatchRefund() {
    if (this.isSupportSettleRelated && this.isSettleRelated) {
      this.confirmationDialogMessage.message =
        Language.confirmRelatedChildMatch;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.doRefund();
      });
      return;
    }

    this.doRefund();
  }

  public async doRefund() {
    const query = this.generateRefundQuery(this.apiKeys.Settle);
    query.isSettleRelated = this.isSettleRelated;
    query.childMatchIds = this.getChildrenMatch();
    const result = await this.aioService.push(query);

    if (result.errCode > 0) {
      this.toastrService.error(result.errMsg);
      return;
    }

    this.refundHedgeMatch(query);
    this.messageBoxService.closePopup();
  }

  protected generateRefundQuery(apikey: string) {
    this.selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });
    const betStatus =
      this.matchDetail.sportType === SportType.volleyBall
        ? this.getBetStatus()
        : "";

    return new SettleQuery(
      this.matchDetail,
      this.selectedResources,
      CalculateAction.refund,
      false,
      betStatus,
      apikey
    );
  }

  public getBetStatus() {
    const betStatus: string[] = [];
    const refund =
      this.match.resultDetails.find(
        (map) => map.resourceId === ResourcesIds.totalGames
      ).checked ||
        (this.match.matchDetail.betStatus &&
          _.includes(this.match.matchDetail.betStatus, EventStatus.refund))
        ? `${EventStatus.refund};`
        : "";
    const submittedSets = this.match.resultDetails.filter(
      (map) =>
        map.resourceId !== ResourcesIds.totalPoints &&
        map.resourceId !== ResourcesIds.totalGames
    );
    submittedSets.forEach((map) => {
      betStatus.push(
        map.checked
          ? `${Number(map.homeValue)}-${Number(map.awayValue)}`
          : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`
      );
    });

    return refund + betStatus.join(",");
  }

  openInfo() {
    this.confirmationDialogMessage.title = Language.information;
    this.confirmationDialogMessage.message =
      Language.chidMatchRefundTabbleTennisInfo;
    this.messageBoxService.alert(this.confirmationDialogMessage);
  }
 
  getChildrenMatch() {
    
    if (!this.isSettleRelated || !this.isSupportSettleRelated) {
      return null;
    }

    const { childMatches } = this.match;
    const selectedResourceIds = this.selectedResources.map(x => x.resourceId);
    const newSelectedSourceIds = selectedResourceIds.includes(ResourcesIds.totalGames) 
      ? [...selectedResourceIds,ResourcesIds.totalPoints] 
      : selectedResourceIds;
   
    const selectedChildrenMatches = childMatches.filter(x => newSelectedSourceIds.includes(x.relatedResourceId));
    const refundableChildrenMatches = selectedChildrenMatches.filter(x => !x.isHold 
      && x.newEventStatus.toLowerCase() === EventStatus.running.toLowerCase());
    
    const childrenMatchId = refundableChildrenMatches.length ? refundableChildrenMatches.map(x => x.matchId).join(',') : null;

    return childrenMatchId;
  }

  public get confirmRefundResources() {
    return this.selectedResources.map((x) => ({...x,resourceName: this.resourceNameByIdPipe.transform(x.resourceId)}))
  } 
}

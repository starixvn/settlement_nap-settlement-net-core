import { RefundCommonModule } from './../../shared/modules/refund-common.module';
import { ExcludeTotalPointPipe, ResourceNameByIdPipe } from '../pipes';
import { Component, Input, ViewChild, inject } from '@angular/core';
import * as _ from 'lodash';
import { ModalDialogMessage, Result } from '../../shared/models';
import { CalculateAction, EventStatus } from '../../shared/constants';
import { Language } from '../../shared/language.native';
import { Match } from '../models';
import { ResourcesIds, TennisApiKeys } from '../constants';
import { MatchDetail, ResultDetail, SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { ToastContainerDirective } from 'ngx-toastr';
import { MatchDetailComponent } from './match-detail.component';
import { TennisService } from '../services';
import { UpdateSettlementResultHistoryStatus } from '../../shared/models/update-settle-result-history-status';

@Component({
  selector: 'refund-actions',
  templateUrl: './refund-actions.component.html',
  standalone: true,
  imports: [ExcludeTotalPointPipe, MatchDetailComponent, RefundCommonModule, ResourceNameByIdPipe],
  providers: [TennisService, ResourceNameByIdPipe]

})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  @Input() public match: Match;
  public blockUI = true;
  public isSettleRelated = false;
  private readonly infoDialog: ModalDialogMessage = new ModalDialogMessage();
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage(Language.confirmationBox);
  private readonly resourceNameByIdPipe = inject(ResourceNameByIdPipe);


  async getMatch(matchId: number): Promise<void> {
    this.initService();
    const matchQuery = {
      matchId,
      apikey: TennisApiKeys.NormalMatch,
    };
    this.match = await this.aioService.getMatch(matchQuery) as Match;
    this.init();
  }

  public initService() {
    this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastrService.overlayContainer = this.toastContainer;
  }

  public init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.matchDetail = this.match.matchDetail;
    this.permission = this.match.permission;
    this.resultDetails = this.match.resultDetails;
    this.cloneResultDetail();
  }

  public get isDisabledConfirmRefund(): boolean {
    const existResultSelected = _.find(this.match.resultDetails, item => item.checked);
    return _.isNil(existResultSelected);
  }

  public async refund() {
    this.toastrService.clear();
    if (this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else {
      if (this.verifySelectedOnMap()) {
        this.confirmBeforeRefund();
      }
    }
  }

  private confirmBeforeRefund() {
    if (this.isSettleRelated) {
      this.confirmationDialogMessage.message = Language.confirmRelatedChildMatch;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.doRefund();
        });
      });
    } else {
      this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.doRefund();
      });
    }
  }

  public verifySelectedOnMap() {
    const findMap = _.find(this.match.resultDetails, (map: ResultDetail) => map.checked);

    if (!findMap) {
      this.toastrService.error(Language.NotSelectRefundTypeMessage);
    }

    return findMap;
  }

  public async doRefund() {
    const query = this.generateRefundQuery(TennisApiKeys.Settle);
    query.isSettleRelated = this.isSettleRelated;
    const result = await this.aioService.push(query);
    if (result.errCode === 0) {
      await this.updateStatusResultAmendment(this.matchDetail, result);
      this.refundHedgeMatch(query);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async updateStatusResultAmendment(matchDetail: MatchDetail, settleResult: Result) {
    const query = new UpdateSettlementResultHistoryStatus(
      matchDetail.matchId,
      settleResult.settledSessionId,
      matchDetail.sportType,
      settleResult.isOrg);

    if (settleResult.hasResultAmendment) {
      await this.aioService.updateSettlementResultHistoryStatus(query);
    }
  }

  protected generateRefundQuery(apikey: string) {
    this.selectedResources.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });

    return new SettleQuery(this.matchDetail,
      this.selectedResources,
      CalculateAction.refund,
      false,
      this.getBetStatus(),
      apikey);
  }

  public getBetStatus() {
    const betStatus: string[] = [];
    const refund = this.match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalSets).checked
      || this.match.matchDetail.betStatus
      && _.includes(this.match.matchDetail.betStatus, EventStatus.refund)
      ? `${EventStatus.refund};` : '';
    const submitedSets = this.match.resultDetails.filter((map) =>
      map.resourceId !== ResourcesIds.totalGames && map.resourceId !== ResourcesIds.totalSets);
    submitedSets.forEach((map) => {
      betStatus.push(map.checked
        ? `${Number(map.homeValue)}-${Number(map.awayValue)}`
        : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
    });

    return refund + betStatus.join(',');
  }

  openInfo() {
    this.infoDialog.title = Language.information;
    this.infoDialog.message = Language.childMatchTennisInfo;
    this.messageBoxService.alert(this.infoDialog);
  }

  public get confirmRefundResources() {
    return this.selectedResources.map((x) => ({ ...x, resourceName: this.resourceNameByIdPipe.transform(x.resourceId) }))
  }
}

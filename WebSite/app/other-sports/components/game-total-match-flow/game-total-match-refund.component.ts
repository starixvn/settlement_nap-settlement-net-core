import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ResourcesIds } from '../../constants';
import { MatchDetail, Permission, QueryMatch } from '../../models';
import { RequestService } from '../../services/request.service';
import { CalculateAction } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';
import { HedgeMatchDetail, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MessageBoxService } from '../../../shared/services';
import { GameTotalMatchService } from './game-total-match.service';
import * as _ from 'lodash';

@Component({
  selector: 'game-total-match-refund',
  templateUrl: './game-total-match-refund.component.html',
})
export class GameTotalMatchRefundComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public actionName = CalculateAction;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public resultDetails: ResultDetail[];
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  public confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly toastrService: ToastrService,
    private readonly gameTotalMatchService: GameTotalMatchService) {
    this.confirmDialogMessage.title = Language.confirmationBox;
  }
  async getMatch(matchId: number) {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, true);
    const result = await this.requestService.getMatch(query);
    this.permission = result.permission;
    this.matchDetail = result.match.matchDetail;
    this.resultDetails = this.gameTotalMatchService.getResultDetail(this.matchDetail, result.match.resultDetails);
    this.hedgeMatchDetail = result.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
  }

  private get totalSets() {
    return _.find(this.resultDetails, result => _.isEqual(result.resourceId, ResourcesIds.totalSets));
  }

  public async refund() {
    this.toastrService.clear();
    const isExistedMarkedTicket = await this.isExistedMarkedTicket();
    if (isExistedMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmDialogMessage.title = Language.RefundConfirmationBox;
      this.confirmDialogMessage.message = Language.RefundConfirmMessage;
      this.messageBoxService.confirm(this.confirmDialogMessage, async() => {
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        const errorMessage = await this.gameTotalMatchService.refund(this.matchDetail, hedgeMatchId, this.totalSets);
        if(!_.isEmpty(errorMessage)) {
          this.toastrService.error(errorMessage);
        }
      });
    }
  }

  private async isExistedMarkedTicket() {
    const params = {
      matchId: this.matchDetail.matchId,
      resourceIds: ResourcesIds.fullTime
    };
    const result = await this.requestService.checkMarkedTickets(params);
    return result.isExistMarkedTicket;
  }
}

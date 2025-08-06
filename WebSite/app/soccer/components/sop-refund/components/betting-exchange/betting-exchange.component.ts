import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BetDaq, BetFair } from '../../models/match.model';
import { MatDialog } from '@angular/material/dialog';
import { MoveBetComponent } from '../move-bet/move-bet.component';
import { SpecificBettypeComponent } from '../specific-bettype/specific-bettype.component';
import { RefundStorage } from '../../../../storage/refund.storage';
import { RequestService } from '../../services/request.service';
import { RefundType } from '../../models/constant.model';
import { LogicService } from '../../services/logic.service';

@Component({
  selector: 'betting-exchange',
  templateUrl: './betting-exchange.component.html',
  styleUrls: ['./betting-exchange.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BettingExchangeComponent {
  @Input() betDaq: BetDaq;
  @Input() betFair: BetFair;

  #dialog = inject(MatDialog);
  #refundStorage = inject(RefundStorage);
  #requestService = inject(RequestService);
  #logicService = inject(LogicService);

  onOpenPopupSpecificBetTypes( type: string, action: string ) {
    this.#refundStorage.clear();
    this.#dialog.open(SpecificBettypeComponent, {
      width: '630px',
      height: '500px',
      data: {
        type,
        action
      },
      hasBackdrop: true
    });
  }

  onOpenPopupMoveBet(isBetDaq: boolean) {
    this.#refundStorage.clear();
    this.#dialog.open(MoveBetComponent, {
      width: '630px',
      height: '500px',
      data: {
        matchId: this.#refundStorage.getMatch().matchDetail.matchId,
        refundType: isBetDaq ? RefundType.refundBetDaq : RefundType.refundBetFair
      },
      hasBackdrop: true
    }).afterClosed().subscribe((value) => {
      if (value) {
        if (value.result.isSuccessful) {
          this.#logicService.closePopupNotChanged();
        } else {
          this.#refundStorage.error(value.result.errMsg);
        }
      }
    });
  }

  onSettleDeterminableTicketsChange(settleDeterminableTickets: boolean) {
    if(settleDeterminableTickets) {
     const {matchDetail} = this.#refundStorage.getMatch();
     matchDetail.isSettleDetermined = true;
    }
    this.#logicService.settleDetermineUpdate();
  }

  async onRefundRunningThirdPartyTickets(isBetDaq : boolean){
    this.#refundStorage.clear();
    const refundType = isBetDaq ? RefundType.refundBetDaq : RefundType.refundBetFair;
    const matchDetail = this.#refundStorage.getMatchDetail();
    const result = await this.#requestService.refundRunningThirdPartyTickets(matchDetail.matchId, refundType);
    if (result.isSuccessful) {
      this.#logicService.closePopup();
    } else {
      this.#refundStorage.error(result.errMsg);
    }
  }
} 
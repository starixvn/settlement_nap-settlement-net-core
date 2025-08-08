import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import { Soccer } from '../../../soccer.model';
import { MatchDetailComponent } from '../../../common/match-detail.component';
import { BetDaq, BetFair, Match, MatchDetail } from '../../models/match.model';
import { RequestService } from '../../services/request.service';
import { RefundStorage } from '../../../../storage/refund.storage';
import { RefundActionsComponent } from '../refund-actions/refund-actions.component';
import { LogicService } from '../../services/logic.service';
import { BettingExchangeComponent } from '../betting-exchange/betting-exchange.component';

@Component({
  selector: 'refund',
  standalone: true,
  imports: [MatchDetailComponent, RefundActionsComponent, BettingExchangeComponent],
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.css'
})
export class RefundComponent implements Soccer, OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  match: Match;
  matchDetail: MatchDetail;
  betDaq: BetDaq;
  betFair: BetFair;

  readonly #requestService = inject(RequestService);
  readonly #logicService = inject(LogicService);
  readonly #storage = inject(RefundStorage);

  async getMatch(matchId: number, filterOver?: string) {
    this.match = await this.#requestService.getMatch(matchId, true);
    this.#storage.setMatch(this.match);
    this.matchDetail = this.match.matchDetail;
    this.#logicService.resetScore();
    this.#logicService.autoSelect();
    this.#logicService.autoSelectGoalRecordAndSettleDetermined();
    this.#logicService.SaveOriginalScore();
    this.betDaq = this.match.betDaq;
    this.betFair = this.match.betFair;
  }

  ngOnInit(): void {
    this.#storage.setToastrOverlay(this.toastContainer);
  }
} 
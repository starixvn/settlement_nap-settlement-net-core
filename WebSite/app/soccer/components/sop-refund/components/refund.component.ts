import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule } from 'ngx-toastr';
import { Soccer } from '../../soccer.model';
import { MatchDetailComponent } from '../../common/match-detail.component';
import { Match, MatchDetail } from '../../refund/model/match.model';
import { RequestService } from '../services/request.service';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundActionsComponent } from './refund-actions.component';
import { RefundService } from '../services/refund.service';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { LogicService } from '../services/logic.service';
import { VerifyService } from '../services/verify.service';

@Component({
  selector: 'refund',
  standalone: true,
  imports: [MatchDetailComponent, ToastContainerModule, RefundActionsComponent],
  providers: [],
  templateUrl: './refund.component.html',
  styleUrl: './refund.component.css'
})
export class RefundComponent implements Soccer, OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  match: Match;
  matchDetail: MatchDetail;

  #requestService = inject(RequestService);
  #logicService = inject(LogicService);
  #storage = inject(RefundStorage);

  async getMatch(matchId: number, filterOver?: string) {
    this.match = await this.#requestService.getMatch(matchId, true);
    this.#storage.setMatch(this.match);
    this.matchDetail = this.match.matchDetail;
    this.#logicService.resetScore();
  }

  ngOnInit(): void {
    this.#storage.setToastrOverlay(this.toastContainer);
  }
}

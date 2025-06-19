import { Component, inject, Input, OnInit } from '@angular/core';
import { HedgeMatchDetail, Match, MatchDetail } from '../../refund/model/match.model';
import { RefundStorage } from '../../../storage/refund.storage';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ResultDetail } from '../../../models';
import { OnlyGoalRecordDirective } from '../../../directives/only-goal-record.directive.native';
import { OnlyIntegerDirective } from '../../../../shared/directives/only-integer.directive.native';
import { RefundService } from '../services/refund.service';
import { ResourceIds } from '../../../constants';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { VerifyService } from '../services/verify.service';
import { LogicService } from '../services/logic.service';

@Component({
  selector: 'refund-actions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, OnlyGoalRecordDirective, OnlyIntegerDirective],
  templateUrl: './refund-actions.component.html',
  styleUrl: './refund-actions.component.css'
})
export class RefundActionsComponent implements OnInit {
  #storage = inject(RefundStorage);
  #refundService = inject(RefundService);
  #verifyService = inject(VerifyService);
  #verificationService = inject(VerificationBaseService);
  #logicService = inject(LogicService);

  #match: Match;
  matchDetail: MatchDetail;
  hedgeMatchDetail: HedgeMatchDetail;
  resultDetails: ResultDetail[];
  isDeterminedHedgeMatch = false;
  disableSettleDeterminedHedgeMatch = false;

  settleDeterminableTickets = false;
  settleDeterminableTicketsOnly = false;
  disableGoalRecordCheckbox = false;
  enableAction = false;

  ngOnInit(): void {
    this.#match = this.#storage.getMatch();
    this.matchDetail = this.#match.matchDetail;
    this.hedgeMatchDetail = this.#match.hedgeMatchDetail;
    this.resultDetails = this.#match.resultDetails;
    this.disableGoalRecordCheckbox = this.matchDetail.isExistResultAndFirstTeamScore ||
      this.matchDetail.isEnabledGoalRecordFt || this.matchDetail.isEnabledGoalRecordHt;
    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox;
    this.#verifyService.verifyScore();
  }


  changeScore(result: ResultDetail) {
    this.#storage.clear();
    if(result.resourceId == ResourceIds.halfTime){
      this.#storage.clearFullTimeResult();
    }

    this.#verifyService.verifyScore();
  }

  changeApplyHedgeMatch() {
    if (this.matchDetail.applyHedgeMatch) {
      this.disableSettleDeterminedHedgeMatch = false;
    } else {
      this.disableSettleDeterminedHedgeMatch = true;
      this.isDeterminedHedgeMatch = false;
    }
  }

  changeIsDeterminedHedgeMatch() {
    this.#storage.setIsDeterminedHedgeMatch(this.isDeterminedHedgeMatch);
  }

  goalRecordModelChange(value: string) {
    this.#storage.clear();
    this.matchDetail.goalRecord = value;
    this.matchDetail.isWarningGoalRecord = this.#verificationService.isHtGoalRecordInvalidWithResultDetail(this.matchDetail, this.#storage.getHalfTimeResult()) ||
    this.#verificationService.isFullTimeGoalRecordInvalidWithResultDetail(this.matchDetail, this.#storage.getFullTimeResult());

  }

  confirmRefund() {
   
  }

  refund() {
    const actionName = this.#logicService.getActionName();
    this.#refundService.refund(actionName);
  }

  onResultCheckedChange(result: ResultDetail): void {
    this.enableAction = this.resultDetails.some(x => x.checked);
    
    if (!this.settleDeterminableTicketsOnly) {
      return;
    }

    this.#verifyService.verifySettleDeterminableInput();
  }
}

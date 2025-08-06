import { Component, inject, Input, OnInit } from '@angular/core';
import { BetDaq, BetFair, HedgeMatchDetail, Match, MatchDetail } from '../../models/match.model';
import { RefundStorage } from '../../../../storage/refund.storage';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ResultDetail } from '../../../../models';
import { OnlyGoalRecordDirective } from '../../../../directives/only-goal-record.directive.native';
import { OnlyIntegerDirective } from '../../../../../shared/directives/only-integer.directive.native';
import { RefundService } from '../../services/refund.service';
import { ResourceIds } from '../../../../constants';
import { VerificationBaseService } from '../../../../services/verification-base.service';
import { VerifyService } from '../../services/verify.service';
import { LogicService } from '../../services/logic.service';
import { ResourceNamePipe } from "../../../../pipes/resource-name.pipe";
import { ResourceStatusPipe } from '../../../../pipes/resource-status.pipe';
import { Permission } from '../../../../../shared/models/sportsbook-sop';

@Component({
  selector: 'refund-actions',
  standalone: true,
  providers: [ResourceStatusPipe],
  imports: [CommonModule, FormsModule, MatTooltipModule, OnlyGoalRecordDirective, OnlyIntegerDirective, ResourceNamePipe],
  templateUrl: './refund-actions.component.html',
  styleUrl: './refund-actions.component.css'
})
export class RefundActionsComponent implements OnInit {
  #storage = inject(RefundStorage);
  #refundService = inject(RefundService);
  #verifyService = inject(VerifyService);
  #verificationService = inject(VerificationBaseService);
  #logicService = inject(LogicService);
  #resourceStatusPipe = inject(ResourceStatusPipe);
  #match: Match;
  matchDetail: MatchDetail;
  hedgeMatchDetail: HedgeMatchDetail;
  permission: Permission;
  resultDetails: ResultDetail[];
  selectedResources: ResultDetail[];
  isDeterminedHedgeMatch = false;
  disableSettleDeterminedHedgeMatch = false;
  isExistedConfirmRefund = false;

  disableGoalRecordCheckbox = false;
  enableAction = false;
  betDaq: BetDaq;
  betFair: BetFair;

  ngOnInit(): void {
    this.#match = this.#storage.getMatch();
    this.matchDetail = this.#match.matchDetail;
    this.hedgeMatchDetail = this.#match.hedgeMatchDetail;
    this.resultDetails = this.#match.resultDetails;
    this.permission = this.#match.permission;
    this.disableGoalRecordCheckbox = this.matchDetail.isExistResultAndFirstTeamScore ||
      this.matchDetail.isEnabledGoalRecordFt || this.matchDetail.isEnabledGoalRecordHt;
    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox;
    this.betDaq = this.#match.betDaq;
    this.betFair = this.#match.betFair;
    this.isExistedConfirmRefund = this.resultDetails.some(result => result.resultSettingData.isConfirmedRefund || result.resultSettingData.isConfirmedRefundSdt);
    this.matchDetail.applyHedgeMatch = this.hedgeMatchDetail != null && !this.hedgeMatchDetail.isUndecided;
    this.disableSettleDeterminedHedgeMatch = !this.matchDetail.applyHedgeMatch;
    this.#verifyService.verifyScore();
    this.onResultCheckedChange();
  }


  changeScore(result: ResultDetail) {
    this.#storage.clear();
    if (result.resourceId === ResourceIds.halfTime) {
      this.#storage.clearFullTimeResult();
    }

    this.#verifyService.verifyScore();
    this.goalRecordModelChange();
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

  onSettleDeterminableTicketsChange() {
    if(!this.matchDetail.isSettleDetermined ) {
      this.betDaq && (this.betDaq.settleDeterminedBetDaq = false);
      this.betFair && (this.betFair.settleDeterminedBetFair = false);
    }
    this.#logicService.settleDetermineUpdate();
  }

  goalRecordModelChange() {
    this.#storage.clear();
    const verifyHtRecord = this.#storage.getHalfTimeResult().isEnabled && this.#verificationService.isHtGoalRecordInvalidWithResultDetail(this.matchDetail, this.#storage.getHalfTimeResult());
    const verifyFtRecord = this.#storage.getFullTimeResult().isEnabled && this.#verificationService.isFullTimeGoalRecordInvalidWithResultDetail(this.matchDetail, this.#storage.getFullTimeResult());
    this.matchDetail.isWarningGoalRecord = verifyHtRecord || verifyFtRecord;
  }

  refund() {
    this.#storage.clear();
    this.#refundService.refund(this.matchDetail.isSettleDetermined);
  }

  onResultCheckedChange(): void {
    this.#storage.clear();
    this.enableAction = this.resultDetails.some(x => x.checked);
    this.#logicService.settleDetermineUpdate();
  }

  confirmRefund() {
    this.#storage.clear();
    const actionName = this.#logicService.getActionName();
    this.#refundService.confirmRefund(this.matchDetail.isSettleDetermined, actionName);
  }

  getResultRowClass(result: ResultDetail): string {
    if (this.matchDetail.isScoreInconsistent) {
      return 'mismatched';
    }
    
    if (this.permission.isLeader && 
        (result.resultSettingData.isConfirmedRefund || result.resultSettingData.isConfirmedRefundSdt)) {
      return 'confirmed-refund';
    }
    
    return this.#resourceStatusPipe.transform(result.settlementStatusId);
  }
}     
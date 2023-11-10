import { Component, Input, OnInit } from "@angular/core";
import { MatchDetail } from "../../models";
import { CommonModule } from "@angular/common";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { SettlementStatusId } from "../../../shared/constants/settlement-status-id.native";
import { Permission } from "../../../shared/models/sportsbook-sop";

@Component({
  templateUrl:"./match-info.compoment.html",
  selector: 'match-info',
  standalone: true,
  imports: [CommonModule, ScoreBySettlementPipe]

})
export class MatchInfoCompoment implements OnInit {
  ngOnInit(): void {
    this.resultDetails.forEach(item => {
      item.isDisplayedForMember = this.permission?.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
    });
  }
  @Input() matchDetail: MatchDetail;
  @Input() resultDetails: ResultDetail[] = [];
  @Input() showResultDetails: boolean = false;
  @Input() permission: Permission;
}
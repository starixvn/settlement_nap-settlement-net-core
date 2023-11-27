import { Component, Input, OnInit } from "@angular/core";
import { MatchDetail } from "../../models";
import { CommonModule } from "@angular/common";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { SettlementStatusId } from "../../../shared/constants/settlement-status-id.native";
import { Permission } from "../../../shared/models/sportsbook-sop";
import { BandyResourceNamePipe } from "./bandy-resource.pipe";
import { BandyService } from "./bandy.service";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { ResultDetailsService } from "./resultdetails.service";

@Component({
  templateUrl:"./match-info.compoment.html",
  selector: 'match-info',
  standalone: true,
  providers: [IntervalBackgroundPipe,BandyService,],
  imports: [CommonModule, ScoreBySettlementPipe,BandyResourceNamePipe]

})
export class MatchInfoCompoment implements OnInit {
  ngOnInit(): void {
    this.showResultDetails && this.resultDetails.forEach(item => {
      item.isDisplayedForMember = this.resultDetailService.isShowScore(item,this.permission?.isLeader);
    });
  }
  @Input() matchDetail: MatchDetail;
  @Input() resultDetails: ResultDetail[] = [];
  @Input() showResultDetails: boolean = false;
  @Input() permission: Permission;

  constructor(private bandyService: BandyService,
    private resultDetailService: ResultDetailsService
    ) {
    }

  public getIntervalBackground(settlementStatusId: number) {
    return this.bandyService.getIntervalBackground(settlementStatusId)
  }
}
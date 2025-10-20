import { Component, Input, OnInit } from "@angular/core";
import { ExternalResultDetail, MatchDetail, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { ResultByTeamNamePipe } from "../../../../shared/pipes/result-by-team-name.pipe";
import { CommonModule } from "@angular/common";
import { ResultControlGroup } from "../../../constants/result-control-group.native";

@Component({
  selector: 'trader-result',
  standalone: true,
  imports: [CommonModule, ResultByTeamNamePipe],
  template: `
  @switch(resultDetail.inputType) {
    @case(0) {
      {{externalResult.homeValue}}
    }
    @case(1) {
     {{externalResult.homeValue | resultByTeamName: matchDetail: 13}}
    }
    @case(2) {
      {{playerSelected}}
    }
    @default {
      {{externalResult.homeValue | resultByTeamName: matchDetail: 0}}
    }
  }
  `,
})

export class TraderResultComponent  implements OnInit {
  @Input({required: true}) externalResult: ExternalResultDetail;
  @Input({required: true}) resultDetail: ResultDetail;
  @Input({required: true}) matchDetail: MatchDetail;
  playerSelected = "";

  ngOnInit(): void {
    if(this.resultDetail.inputType === ResultControlGroup.playerSelect) {
      this.playerSelected = this.resultDetail.oddFlex?.find(item => item.betChoice === this.externalResult.homeValue)?.info.playerName ?? this.externalResult.homeValue;
    }
  }
}

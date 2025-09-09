import { Component, Input, OnInit } from "@angular/core";
import { MatchDetail, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { ResultByTeamNamePipe } from "../../../../shared/pipes/result-by-team-name.pipe";
import { CommonModule } from "@angular/common";
import { ResultControlGroup } from "../../../constants/result-control-group.native";

@Component({
  selector: 'trader-result',
  standalone: true,
  imports: [CommonModule, ResultByTeamNamePipe],
  template: `
  @switch(result.inputType) {
    @case(0) {
      {{result.homeValue}}
    }
    @case(1) {
     {{result.homeValue | resultByTeamName: matchDetail: 13}}
    }
    @case(2) {
      {{playerSelected}}
    }
    @default {
      {{result.homeValue | resultByTeamName: matchDetail: 0}}
    }
  }
  `,
})

export class TraderResultComponent  implements OnInit {
  @Input({required: true}) result: ResultDetail;
  @Input({required: true}) matchDetail: MatchDetail;
  playerSelected = "";

  ngOnInit(): void {
    if(this.result.inputType === ResultControlGroup.playerSelect) {
      this.playerSelected = this.result.oddFlex?.find(item => item.betChoice === this.result.homeValue)?.info.playerName ?? '';
    }
  }
}

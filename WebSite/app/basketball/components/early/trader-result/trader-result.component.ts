import { Component, Input, OnInit, inject } from "@angular/core";
import { ExternalResultDetail, MatchDetail, ResultDetail } from "../../../../shared/models/sportsbook-sop";
import { ResultByTeamNamePipe } from "../../../../shared/pipes/result-by-team-name.pipe";
import { CommonModule } from "@angular/common";
import { ResultControlGroup } from "../../../constants/result-control-group.native";
import { PlayerBetTypes } from "../../../constants";
import { EarlyStore } from "../../../store/early.store";
import * as _ from 'lodash';
import { MixCoreService } from "../../../services/mix-core.service";

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
  @Input() index: number;
  readonly #earlyStore = inject(EarlyStore);
  readonly #mixCoreService = inject(MixCoreService);
  resultDetails = this.#earlyStore.resultDetails();
  readonly targetBetTypes = [PlayerBetTypes.mostPoints, PlayerBetTypes.mostRebounds, PlayerBetTypes.mostSteals, PlayerBetTypes.mostAssists, PlayerBetTypes.mostPointShotsScored];
   
  playerSelected = "";

  ngOnInit(): void {
    if(this.resultDetail.inputType === ResultControlGroup.playerSelect) {
      if (this.targetBetTypes.includes(this.resultDetail.betType)) {
        this.handleTargetBetTypes();
      } else {
        this.playerSelected = this.resultDetail.oddFlex?.find(item => item.betChoice === this.externalResult.homeValue)?.info.playerName ?? this.externalResult.homeValue;
      }
    }
  }

  private handleTargetBetTypes(): void {
    const results = this.#mixCoreService.findResultsByBetTypes(this.resultDetails, this.resultDetail.relatedCalResources);

    if (this.#mixCoreService.hasAnyRefundedResult(results)) {
      this.playerSelected = this.#mixCoreService.noneValue;
      this.externalResult.homeValue = this.playerSelected;
      return;
    }

    const playerIdWinner = this.comparePlayerStatistics(results[0], results[1]);
    if (playerIdWinner > 0) {
      const winnerOddFlex = this.resultDetail.oddFlex.find(odd => odd.info.playerId === playerIdWinner);
      this.playerSelected = winnerOddFlex.info.playerName;
      this.externalResult.homeValue = winnerOddFlex.betChoice;
    }
  }

  private comparePlayerStatistics(player1: ResultDetail, player2: ResultDetail) {
    const player1Value = this.getExternalValue(player1, this.index);
    const player2Value = this.getExternalValue(player2, this.index);
   
    if (player1Value === null || player2Value === null) {
      return null;
    }

    if (player1Value > player2Value) {
      return player1.oddFlex[0].info.playerId;
    } 
    else if (player2Value > player1Value) {
      return player2.oddFlex[0].info.playerId;
    }

    return null;
  }

  private getExternalValue(result: ResultDetail, index: number) {
    if (result.externalScores && result.externalScores[index] && !_.isEmpty(result.externalScores[index].homeValue)) {
      return parseInt(result.externalScores[index].homeValue);
    }

    return null;
  }
}

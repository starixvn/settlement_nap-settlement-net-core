import { IAutofillStrategy } from "./performance-autofill.strategy";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { PerformanceOnlyStrategy } from "./PerformanceOnlyStrategy";
import { PerformanceAndTotalScoreStrategy } from "./PerformanceAndTotalScoreStrategy";
import { PerformanceAndTeamWinStrategy } from "./PerformanceAndTeamWinStrategy";
import { inject, Injectable } from "@angular/core";

@Injectable()
export class PerformanceAutoFillFactory {
  readonly #performanceOnlyStrategy = inject(PerformanceOnlyStrategy);
  readonly #performanceAndTotalScoreStrategy = inject(PerformanceAndTotalScoreStrategy);
  readonly #performanceAndTeamWinStrategy = inject(PerformanceAndTeamWinStrategy);
  
  getAutofillStrategy(changedResultDetail: ResultDetail): IAutofillStrategy | undefined {
    const oddFlex = changedResultDetail.oddFlex[0];
    if (!oddFlex.info.results.length) {
      return this.#performanceOnlyStrategy;
    }
    
    if(oddFlex.info.results.length && oddFlex.info.results.some(x => x.type === 'over')) {
      return this.#performanceAndTotalScoreStrategy;
    }
    
    if(oddFlex.info.results.length && oddFlex.info.results.some(x => x.type === 'winner' || x.type === 'handicap')) {
      return this.#performanceAndTeamWinStrategy;
    }
    
    return undefined;
  }
}
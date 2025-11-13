import { IAutofillStrategy, DefaultAutofillStrategy } from "./performance-autofill.strategy.native";
import { PerformanceOnlyStrategy } from "./performance-only.strategy";
import { PerformanceAndTotalScoreStrategy } from "./performance-total-score.strategy";
import { PerformanceAndTeamWinStrategy } from "./performance-team-win.strategy";
import { inject, Injectable } from "@angular/core";
import { AutofillResultContext } from "./autofill.utils";

@Injectable()
export class PerformanceAutoFillFactory {
  readonly #performanceOnlyStrategy = inject(PerformanceOnlyStrategy);
  readonly #performanceAndTotalScoreStrategy = inject(PerformanceAndTotalScoreStrategy);
  readonly #performanceAndTeamWinStrategy = inject(PerformanceAndTeamWinStrategy);
  readonly #defaultAutofillStrategy = inject(DefaultAutofillStrategy);
  
  getAutofillStrategy(context: AutofillResultContext): IAutofillStrategy | undefined {
    const { oddFlex } = context;
    if (!oddFlex.info.results.length) {
      return this.#performanceOnlyStrategy;
    }
    
    if(oddFlex.info.results.length && oddFlex.info.results.some(x => x.type === 'over')) {
      return this.#performanceAndTotalScoreStrategy;
    }
    
    if(oddFlex.info.results.length && oddFlex.info.results.some(x => x.type === 'winner' || x.type === 'handicap')) {
      return this.#performanceAndTeamWinStrategy;
    }
    
    return this.#defaultAutofillStrategy;
  }
}
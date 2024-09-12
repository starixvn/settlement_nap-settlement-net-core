import { Injectable } from "@angular/core";
import { IntervalCalculationService } from "../../shared/services";
import { Language } from "../../shared/language.native";
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import * as _ from "lodash";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";
import { ResourcesIds } from "../constants";
@Injectable()
export class VerificationService extends VerificationBaseService {
  constructor(
    private readonly intervalCalculationService: IntervalCalculationService,
    protected resultByTeamNamePipe: ResultByTeamNamePipe
  ) {
    super(resultByTeamNamePipe);
  }

   isExistedHomeAwayScore(homeValue: string, awayValue: string) {
    return !_.isEmpty(homeValue) && !_.isEmpty(awayValue);
  }

   verifyMatchScoreOnCalculation(resultDetails: ResultDetail[]) {
    return this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(
      resultDetails,
      ResourcesIds.totalSets,
      ResourcesIds.totalGames
    );
  }

   verifyIntervalsOnCalculation(
    resultDetails: ResultDetail[],
    isScoreDirect: boolean
  ) {
    if (
      this.intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch(
        resultDetails,
        isScoreDirect,
        ResourcesIds.totalSets,
        ResourcesIds.totalGames
      )
    ) {
      return Language.intervalsAndMatch.intervalNotSelected;
    }

    if (
      this.intervalCalculationService.isNonCheckedIntervalsConsistent(
        resultDetails,
        isScoreDirect,
        ResourcesIds.totalSets,
        ResourcesIds.totalGames
      )
    ) {
      return Language.intervalsAndMatch.intervalInconsistent;
    }

    return "";
  }

  isFTDrawWithInputNormal(totalPoint: ResultDetail, inputDirectly: boolean) {
    return totalPoint.checked && !inputDirectly && totalPoint.homeValue.trim() === totalPoint.awayValue.trim();
 }
}

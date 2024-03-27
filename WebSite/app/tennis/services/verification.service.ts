import { Injectable } from "@angular/core";
import { IntervalCalculationService } from "../../shared/services";
import { Language } from "../../shared/language.native";
import { MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import * as _ from 'lodash';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResourcesIds } from "../constants";
@Injectable()
export class VerificationService extends VerificationBaseService{
    constructor(private readonly intervalCalculationService: IntervalCalculationService,
        protected resultByTeamNamePipe: ResultByTeamNamePipe) {
            super(resultByTeamNamePipe);
    }

    public isExistedHomeAwayScore(homeValue: string, awayValue: string) {
        return !_.isEmpty(homeValue) && !_.isEmpty(awayValue);
    }

    public verifyMatchScoreOnCalculation(resultDetails: ResultDetail[]) {
        return this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(resultDetails,
            ResourcesIds.totalSets, ResourcesIds.totalGames);
    }

    public verifyIntervalsOnCalculation(resultDetails: ResultDetail[], isScoreDirect: boolean) {
        if (this.intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch(resultDetails,
            isScoreDirect, ResourcesIds.totalSets, ResourcesIds.totalGames)) {
            return Language.intervalsAndMatch.intervalNotSelected;
        }

        if (this.intervalCalculationService.isNonCheckedIntervalsConsistent(resultDetails,
            isScoreDirect, ResourcesIds.totalSets, ResourcesIds.totalGames)) {
            return Language.intervalsAndMatch.intervalInconsistent;
        }

        return "";
    }

    public verifySuperTieBreak(matchDetail: MatchDetail, selectedResults: ResultDetail[]) {
        const validScore = [0,1];
        const setThree = selectedResults.find(x => x.intervalNo === 3);
        const isValidScoreSetThree = (+setThree.homeValue)  !== (+setThree.awayValue) 
            && (validScore.includes(+setThree.homeValue) || validScore.includes(+setThree.awayValue))

        if(setThree && matchDetail.gameSession === 3 && matchDetail.sessionTime === 0) {
            return !isValidScoreSetThree;
        }

        return false;
    }
}
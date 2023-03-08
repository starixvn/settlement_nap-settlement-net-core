import { Injectable } from "@angular/core";
import { InputType, ResourcesIds, VolleyballBetTypes } from "../constants";
import * as _ from 'lodash';
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { ScoreSourceType, TicketStatusText } from "../../shared/constants";
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { IntervalCalculationService } from "../../shared/services";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { Language } from "../../shared/language.native";
import { ChildMatch } from "../models";

@Injectable()
export class VerificationService extends VerificationBaseService  {
    constructor(private readonly intervalCalculationService: IntervalCalculationService,
        protected resultByTeamNamePipe: ResultByTeamNamePipe) {
            super(resultByTeamNamePipe);
    }

    public hasTicketBetOnMap(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, ResourcesIds.totalGames)
            && item.ticketStatus !== TicketStatusText.noTicket).length > 0;
    }

    public isExistInhouseResult(result: ResultDetail) {
        return result.inputType === InputType.coupleScore
            ? _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
                && this.isExistedHomeAwayScore(source.homeValue, source.awayValue))
            : _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
    }

    public verifyMatchScoreOnCalculation(resultDetails: ResultDetail[]) {
        return this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(resultDetails,
            ResourcesIds.totalGames, ResourcesIds.totalPoints);
    }

    public verifyIntervalsOnCalculation(resultDetails: ResultDetail[], isScoreDirect: boolean) {
        if (this.intervalCalculationService.isIntervalNotCheckedWhenCalculateMatch(resultDetails,
            isScoreDirect, ResourcesIds.totalGames, ResourcesIds.totalPoints)) {
            return Language.intervalsAndMatch.intervalNotSelected;
        }

        if (this.intervalCalculationService.isNonCheckedIntervalsConsistent(resultDetails,
            isScoreDirect, ResourcesIds.totalGames, ResourcesIds.totalPoints)) {
            return Language.intervalsAndMatch.intervalInconsistent;
        }

        return "";
    }

    public isChildMatchNotConsistent(resultDetails: ResultDetail[], childMatch: ChildMatch) {
        const resultRelated = _.find(resultDetails, item => item.resourceId === childMatch.relatedResourceId);
        const homeValue = _.isEmpty(resultRelated.homeValue) ? null : resultRelated.homeValue;
        const awayValue = _.isEmpty(resultRelated.awayValue) ? null : resultRelated.awayValue;
        return !resultRelated || !_.isEqual(homeValue, childMatch.homeValue) || !_.isEqual(awayValue, childMatch.awayValue);
    }

    public verifyConsistentChildMatch(resultDetails: ResultDetail[], childMatch: ChildMatch[]) {
        if (childMatch.length > 0) {
            const notConsistent = _.find(childMatch, item => this.isChildMatchNotConsistent(resultDetails, item));
            return !_.isNil(notConsistent);
        }
        return false;
    }
}
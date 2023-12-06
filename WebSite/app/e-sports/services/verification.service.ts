import { Injectable } from "@angular/core";
import { ExternalResultDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResourcesIds, TicketStatus, ResultControlGroup } from "../constants";
import * as _ from 'lodash';
import { ScoreSourceType } from "../../shared/constants";
import { VerificationBaseService } from '../../core/services/verification-base.service';
@Injectable()
export class VerificationService extends VerificationBaseService  {
    public allResultsHaveScoreSources(resultDetails: ResultDetail[]) {
        const checkedResults = resultDetails.filter((result: ResultDetail) => result.checked);
        let allResultsHaveScoreSources = true;
        _.forEach(checkedResults, (result) => {
            if (result.groupBetType === ResultControlGroup.CoupleScores || result.groupBetType === ResultControlGroup.Duration) {
                if (!this.isExistScoreSources(result)) {
                    allResultsHaveScoreSources = false;
                }
            } else {
                if (!this.isExistEarlyResultSources(result)) {
                    allResultsHaveScoreSources = false;
                }
            }
        });

        return allResultsHaveScoreSources;
    }

    public enableUncalculateButton(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (map) => map.checked).length > 0;
    }

    public hasTicketBetOnMap(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, ResourcesIds.final)
            && item.ticketStatus !== TicketStatus.noTicket).length > 0;
    }

    public isExistedHomeAwayScore(homeValue: string, awayValue: string) {
        return !_.isEmpty(homeValue) && !_.isEmpty(awayValue);
    }

    public isExistInhouseResult(result: ResultDetail) {
        return (result.groupBetType === ResultControlGroup.CoupleScores || result.groupBetType === ResultControlGroup.Duration)
            ? _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
                && this.isExistedHomeAwayScore(source.homeValue, source.awayValue))
            : _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
    }

    public isMismatchedDurationWarning(map: ResultDetail) {
        const internalScore = _.find(map.externalScores, (source) => this.isExistedHomeAwayScore(source.homeValue, source.awayValue) 
            && source.sourceId !== ScoreSourceType.screenshot);
        
        if (internalScore) {
            return !this.isDurationScoreMatched(map, internalScore);
        }

        return false;
    }

    private isDurationScoreMatched(map: ResultDetail, scoreToCompare: ExternalResultDetail) {
        if (!map.homeValue || !map.awayValue) {
            return _.every(map.externalScores, (result: ExternalResultDetail) =>
                (_.isEmpty(result.homeValue) || (_.isEqual(scoreToCompare.homeValue, result.homeValue))
            ));
        }

        return _.every(map.externalScores, (result: ExternalResultDetail) =>
            _.isEmpty(result.homeValue) ||
            (_.isEqual(map.homeValue, result.homeValue))
        );
    }
}
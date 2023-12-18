import { Injectable } from "@angular/core";
import { ExternalResultDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ResourcesIds, TicketStatus, ResultControlGroup } from "../constants";
import * as _ from 'lodash';
import { ScoreSourceType } from "../../shared/constants";
import { VerificationBaseService } from '../../core/services/verification-base.service';
@Injectable()
export class VerificationService extends VerificationBaseService {
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

    public isMismatchedDurationWarning(map: ResultDetail,onScreenshot = false) {
        if (this.isEarlyMismatchedWarning(map)) {
            return true;
        }
    
        const screenshotScore = map.externalScores.find(x => x.sourceId === ScoreSourceType.screenshot);
    
        if (onScreenshot && this.hasScore(map) && this.hasScore(screenshotScore)) {
            return !_.isEqual(map.homeValue, screenshotScore.homeValue) || !_.isEqual(map.awayValue, screenshotScore.awayValue);
        }

        return false;

        // return  this.isEarlyMismatchedWarning(map) || this.isMismatchedScoreScreenshot(map);
    }
}
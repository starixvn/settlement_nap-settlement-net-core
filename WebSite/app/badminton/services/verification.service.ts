import { Injectable } from "@angular/core";
import { InputType, ResourcesIds, VolleyballBetTypes } from "../constants";
import * as _ from 'lodash';
import { ResultDetail } from "../../shared/models/sportsbook-sop";
import { EventStatus, ResultStatusId, ScoreSourceType, SportType, TicketStatusText } from "../../shared/constants";
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { IntervalCalculationService } from "../../shared/services";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { Language } from "../../shared/language.native";
import { ChildMatch } from "../models";
import { Result } from "../../shared/models";

@Injectable()
export class VerificationService extends VerificationBaseService  {
    constructor(private readonly intervalCalculationService: IntervalCalculationService,
        protected resultByTeamNamePipe: ResultByTeamNamePipe) {
            super(resultByTeamNamePipe);
    }

     hasTicketBetOnMap(resultDetails: ResultDetail[]) {
        return _.filter(resultDetails, (item) => !_.isEqual(item.resourceId, ResourcesIds.totalGames)
            && item.ticketStatus !== TicketStatusText.noTicket).length > 0;
    }

     isExistInhouseResult(result: ResultDetail) {
        return result.inputType === InputType.coupleScore
            ? _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
                && this.isExistedHomeAwayScore(source.homeValue, source.awayValue))
            : _.find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot && !_.isEmpty(source.homeValue));
    }

     verifyMatchScoreOnCalculation(resultDetails: ResultDetail[]) {
        return this.intervalCalculationService.isMatchNotCheckedWhenChangingIntervals(resultDetails,
            ResourcesIds.totalGames, ResourcesIds.totalPoints);
    }

     verifyIntervalsOnCalculation(resultDetails: ResultDetail[], isScoreDirect: boolean) {
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
    public isChildMatchNotConsistent(resultDetails: ResultDetail[], childMatch: ChildMatch): boolean {
        const resultRelated = resultDetails.find(item => item.resourceId === childMatch.relatedResourceId);
    
        if (!resultRelated) {
            return true;
        }
    
        const homeValue = resultRelated.homeValue || null;
        const awayValue = resultRelated.awayValue || null;
    
        if (homeValue === null && awayValue === null) {
            return false;
        }
    
        return homeValue !== childMatch.homeValue || awayValue !== childMatch.awayValue;
    }

     verifyConsistentChildMatch(resultDetails: ResultDetail[], childMatch: ChildMatch[]) {
       
        if (childMatch.length > 0) {
            const notConsistent = _.find(childMatch, item => this.isChildMatchNotConsistent(resultDetails, item));
            return !_.isNil(notConsistent);
        }
        return false;
    }    

    public verifyCannotSettleChildMatch(childMatch: ChildMatch[], sportType: number) {
        const isExistsSettled = childMatch.some(item => item.eventStatus.toLowerCase() === EventStatus.completed.toLowerCase());
        const isExistsHold = childMatch.some(item => item.isHold);
        const isExistsConfirmRefund = childMatch.some(item => item.resultSettingData.isConfirmedRefund);
        
        if(sportType == SportType.volleyBall) {
            return isExistsSettled || isExistsHold || isExistsConfirmRefund;
        } else {
            return isExistsConfirmRefund || isExistsHold;
        }
    }

    isFTDrawWithInputNormal(totalGames: ResultDetail, inputDirectly: boolean) {
        return totalGames.checked && !inputDirectly && totalGames.homeValue.trim() === totalGames.awayValue.trim();
    }
}
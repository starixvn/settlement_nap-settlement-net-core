import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { MatchDetail } from '../models/match.model';
import { GoalNameIcon } from '../models/constant.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { Goal } from "../../../constants";

@Injectable()
export class GoalRecordWithSemicolonService {

    constructor(
        private readonly verifyScoreGoalService: VerifyScoreGoalService) { }

    public oneCharacterHalftimeGoalRecord(goalRecord: string) {
        if (_.isEqual(goalRecord, Goal.home)) {
            return new GoalIcon("", "", GoalNameIcon.halftimeFirstLastGoal, "");
        } else {
            return new GoalIcon("", "", "", GoalNameIcon.halftimeFirstLastGoal);
        }
    }

    public manyCharacterHalftimeGoalRecord(halftimeGoalRecord: string) {
        const goalIcon = new GoalIcon("", "", "", "");
        const length = halftimeGoalRecord.length;
        const left = halftimeGoalRecord.substring(0, 1);
        const right = halftimeGoalRecord.substring(length - 1, length);

        if (_.isEqual(left, Goal.home) && _.isEqual(right, Goal.home)) {
            goalIcon.halfTimeHomeGoal = GoalNameIcon.halftimeFirstLastGoal;
        } else if (_.isEqual(left, Goal.away) && _.isEqual(right, Goal.away)) {
            goalIcon.halfTimeAwayGoal = GoalNameIcon.halftimeFirstLastGoal;
        } else if (_.isEqual(left, Goal.away) && _.isEqual(right, Goal.home)) {
            goalIcon.halfTimeHomeGoal = GoalNameIcon.halftimeLastGoal;
            goalIcon.halfTimeAwayGoal = GoalNameIcon.halftimeFirstGoal;
        } else {
            goalIcon.halfTimeHomeGoal = GoalNameIcon.halftimeFirstGoal;
            goalIcon.halfTimeAwayGoal = GoalNameIcon.halftimeLastGoal;
        }

        return goalIcon;
    }

    public oneCharacterFulTimeGoalRecord(matchDetail: MatchDetail, fullTimeGoalRecord: string, currentGoalIcon: GoalIcon) {
        if (!this.verifyScoreGoalService.isEmptyScore(matchDetail.finalHomeScore) 
            && !this.verifyScoreGoalService.isEmptyScore(matchDetail.finalAwayScore)) {
            if (_.isEqual(fullTimeGoalRecord, Goal.home)) {
                currentGoalIcon.homeGoal = GoalNameIcon.firstLastGoal;
            } else {
                currentGoalIcon.awayGoal = GoalNameIcon.firstLastGoal;
            }

            return currentGoalIcon;
        } else {
            if (_.isEqual(fullTimeGoalRecord, Goal.home)) {
                currentGoalIcon.homeGoal = GoalNameIcon.firstGoal;
            } else {
                currentGoalIcon.awayGoal = GoalNameIcon.firstGoal;
            }

            return currentGoalIcon;
        }
    }
}
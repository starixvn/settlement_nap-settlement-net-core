import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { GoalNameIcon } from '../models/constant.model';
import { GoalIcon } from '../../../models/goal-icon.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { Goal } from "../../../constants";
import { ResultDetail } from "../../../../shared/models/sportsbook-sop";

@Injectable()
export class GoalRecordWithOutSemicolonService {
    constructor(
        private readonly verifyScoreGoalService: VerifyScoreGoalService) { }

    public oneCharacterGoalRecord(goalRecord: string, goalIcon: GoalIcon) {
        if (_.isEqual(goalRecord, Goal.home)) {
            goalIcon.homeGoal = GoalNameIcon.firstGoal;
        } else {
            goalIcon.awayGoal = GoalNameIcon.firstGoal;
        }

        return goalIcon;
    }

    public manyCharacterGoalRecord(fulltimeResult: ResultDetail, goalRecord: string, goalIcon: GoalIcon) {
        const goalRecordLength = goalRecord.length;
        const left = goalRecord.substring(0, 1);
        const right = goalRecord.substring(goalRecordLength - 1, goalRecordLength);

        if (!this.verifyScoreGoalService.isEmptyScore(fulltimeResult.homeValue) 
            && !this.verifyScoreGoalService.isEmptyScore(fulltimeResult.awayValue)) {
            if (_.isEqual(left, Goal.home) && _.isEqual(right, Goal.home)) {
                goalIcon.homeGoal = GoalNameIcon.firstLastGoal;
            } else if (_.isEqual(left, Goal.away) && _.isEqual(right, Goal.away)) {
                goalIcon.awayGoal = GoalNameIcon.firstLastGoal;
            } else if (_.isEqual(left, Goal.away) && _.isEqual(right, Goal.home)) {
                goalIcon.homeGoal = GoalNameIcon.lastGoal;
                goalIcon.awayGoal = GoalNameIcon.firstGoal;
            } else {
                goalIcon.homeGoal = GoalNameIcon.firstGoal;
                goalIcon.awayGoal = GoalNameIcon.lastGoal;
            }

            return goalIcon;
        } else {
            return this.oneCharacterGoalRecord(left, goalIcon);
        }
    }
}
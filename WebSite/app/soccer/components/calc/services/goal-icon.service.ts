import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { MatchDetail } from '../models/match.model';
import { GoalIcon } from '../../../models/goal-icon.model';
import { GoalRecordWithOutSemicolonService } from "./goal-record-with-out-semicolon.service";
import { GoalRecordWithSemicolonService } from "./goal-record-with-semicolon.service";
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { ResultDetail } from "../../../models";

@Injectable()
export class GoalIconService {

    constructor(
        private readonly goalRecordWithOutSemicolonService: GoalRecordWithOutSemicolonService,
        private readonly goalRecordWithSemicolonService: GoalRecordWithSemicolonService,
        private readonly verifyScoreGoalService: VerifyScoreGoalService) { }


    public generateGoalIcon(matchDetail: MatchDetail, halfTimeResult: ResultDetail, fullTimeResult: ResultDetail) {
        if (!_.isNull(matchDetail.goalRecord) && matchDetail.goalRecord.indexOf(';') > -1) {
            return this.goalRecordWithSemicolon(matchDetail, halfTimeResult, fullTimeResult);
        } else {
            return this.goalRecordWithOutSemicolon(matchDetail, fullTimeResult);
        }
    }

    private goalRecordWithSemicolon(matchDetail: MatchDetail, halfTimeResult: ResultDetail, fullTimeResult: ResultDetail) {

        const goalIcon = this.goalIconHalftimeWithSemicolon(matchDetail, halfTimeResult);
        const fullTimeGoalRecord = matchDetail.goalRecord.replace(";", "");

        if (!_.isEmpty(fullTimeGoalRecord) && matchDetail.isExistFgLg) {

            return fullTimeGoalRecord.length === 1
                ? this.goalRecordWithSemicolonService.oneCharacterFulTimeGoalRecord(fullTimeResult, fullTimeGoalRecord, goalIcon)
                : this.goalRecordWithOutSemicolonService.manyCharacterGoalRecord(fullTimeResult, fullTimeGoalRecord, goalIcon);
        }

        return goalIcon;
    }

    private goalIconHalftimeWithSemicolon(matchDetail: MatchDetail, halfTimeResult: ResultDetail) {
        const halftimeGoalRecord = matchDetail.goalRecord.slice(0, matchDetail.goalRecord.indexOf(';'));
        if (halftimeGoalRecord.length > 0 && matchDetail.isExistHtFgLg
            && !this.verifyScoreGoalService.isEmptyScore(halfTimeResult.homeValue)
            && !this.verifyScoreGoalService.isEmptyScore(halfTimeResult.awayValue)) {
            return halftimeGoalRecord.length === 1
                ? this.goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord(halftimeGoalRecord)
                : this.goalRecordWithSemicolonService.manyCharacterHalftimeGoalRecord(halftimeGoalRecord);

        } else {
            return new GoalIcon("", "", "", "");
        }
    }

    private goalRecordWithOutSemicolon(matchDetail: MatchDetail,  fullTimeResult: ResultDetail) {
        const goalIcon = new GoalIcon("", "", "", "");
        if (!_.isNull(matchDetail.goalRecord) && !_.isEmpty(matchDetail.goalRecord) && matchDetail.isExistFgLg) {
            const goalRecord = matchDetail.goalRecord;
            return goalRecord.length === 1
                ? this.goalRecordWithOutSemicolonService.oneCharacterGoalRecord(goalRecord, goalIcon)
                : this.goalRecordWithOutSemicolonService.manyCharacterGoalRecord(fullTimeResult, goalRecord, goalIcon);
        } else {
            return goalIcon;
        }
    }
}
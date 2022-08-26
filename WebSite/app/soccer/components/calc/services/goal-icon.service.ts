import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { MatchDetail } from '../models/match.model';
import { GoalIcon } from '../../../models/goal-icon.model';
import { GoalRecordWithOutSemicolonService } from "./goal-record-with-out-semicolon.service";
import { GoalRecordWithSemicolonService } from "./goal-record-with-semicolon.service";
import { VerifyScoreGoalService } from "./verify-score-goal.service";

@Injectable()
export class GoalIconService {

    constructor(
        private readonly goalRecordWithOutSemicolonService: GoalRecordWithOutSemicolonService,
        private readonly goalRecordWithSemicolonService: GoalRecordWithSemicolonService,
        private readonly verifyScoreGoalService: VerifyScoreGoalService) { }


    public generateGoalIcon(matchDetail: MatchDetail) {
        if (!_.isNull(matchDetail.goalRecord) && matchDetail.goalRecord.indexOf(';') > -1) {
            return this.goalRecordWithSemicolon(matchDetail);
        } else {
            return this.goalRecordWithOutSemicolon(matchDetail);
        }
    }

    private goalRecordWithSemicolon(matchDetail: MatchDetail) {

        const goalIcon = this.goalIconHalftimeWithSemicolon(matchDetail);
        const fullTimeGoalRecord = matchDetail.goalRecord.replace(";", "");

        if (!_.isEmpty(fullTimeGoalRecord) && matchDetail.isExistFgLg) {

            return fullTimeGoalRecord.length === 1
                ? this.goalRecordWithSemicolonService.oneCharacterFulTimeGoalRecord(matchDetail, fullTimeGoalRecord, goalIcon)
                : this.goalRecordWithOutSemicolonService.manyCharacterGoalRecord(matchDetail, fullTimeGoalRecord, goalIcon);
        }

        return goalIcon;
    }

    private goalIconHalftimeWithSemicolon(matchDetail: MatchDetail) {
        const halftimeGoalRecord = matchDetail.goalRecord.slice(0, matchDetail.goalRecord.indexOf(';'));
        if (halftimeGoalRecord.length > 0 && matchDetail.isExistHtFgLg
            && !this.verifyScoreGoalService.isEmptyScore(matchDetail.halfTimeHomeScore)
            && !this.verifyScoreGoalService.isEmptyScore(matchDetail.halfTimeAwayScore)) {
            return halftimeGoalRecord.length === 1
                ? this.goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord(halftimeGoalRecord)
                : this.goalRecordWithSemicolonService.manyCharacterHalftimeGoalRecord(halftimeGoalRecord);

        } else {
            return new GoalIcon("", "", "", "");
        }
    }

    private goalRecordWithOutSemicolon(matchDetail: MatchDetail) {
        const goalIcon = new GoalIcon("", "", "", "");
        if (!_.isNull(matchDetail.goalRecord) && !_.isEmpty(matchDetail.goalRecord) && matchDetail.isExistFgLg) {
            const goalRecord = matchDetail.goalRecord;
            return goalRecord.length === 1
                ? this.goalRecordWithOutSemicolonService.oneCharacterGoalRecord(goalRecord, goalIcon)
                : this.goalRecordWithOutSemicolonService.manyCharacterGoalRecord(matchDetail, goalRecord, goalIcon);
        } else {
            return goalIcon;
        }
    }
}
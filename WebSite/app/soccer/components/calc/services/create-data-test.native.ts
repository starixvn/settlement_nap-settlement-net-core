import { MatchDetail, FantasyRelatedMatch } from '../models/match.model';

export class CreateDataTest {
    public static MatchDetail() : MatchDetail {
        const  matchDetail: MatchDetail = {
            matchId: null,
            matchCode: null,
            leagueName: null,
            kickOffTime: null,
            homeName: null,
            awayName: null,
            playTime: null,
            goalRecord: null,
            goalIcon: null,
            exHTHomeScore: null,
            exHTAwayScore: null,
            exFTHomeScore: null,
            exFTAwayScore: null,
            halfTimeHomeScore: null,
            halfTimeAwayScore: null,
            finalHomeScore: null,
            finalAwayScore: null,
            isFantasyMatch: null,
            isExistFgLg: null,
            isExistHtFgLg: null,
            isExistFgNg: null,
            isExistResultAndFirstTeamScore: null,
            isEnabledGoalRecordHt: null,
            isEnabledGoalRecordFt: null,
            isInstant: null,
            hasInstantCompleted: null,
            confirmHT: null,
            confirmFT: null,
            eventStatus: null,
            leagueGroupId: null,
            htStatus: null,
            ftStatus: null,
            betStatus: null,
            isCalculated: false,
            isHalfTimeCal: false,
            isWarningGoalRecord: false,
            isWarningHalfTimeHomeScore: false,
            isWarningHalfTimeAwayScore: false,
            isWarningFinalAwayScore: false,
            isWarningFinalHomeScore: false,
            applyGoalRecord: false,
            isLive: false,
            isScoreInconsistent:false,
            originalGoalRecord: "",
            leagueId: null
        };

        return matchDetail;
    }

    public static FantasyMatch() : FantasyRelatedMatch {
        const  matchDetail: FantasyRelatedMatch = {
            matchId: null,
            matchCode: null,
            kickOffTime: null,
            homeName: null,
            awayName: null,
            homeId: null,
            awayId: null,
            htHomeScore: null,
            htAwayScore: null,
            finalHomeScore: null,
            finalAwayScore: null,
            remark: null,
            eventStatus: null,
            betStatus: null,
            isDeleted: false,
            ftSettlementStatusId: 0,
            htSettlementStatusId: 0
        };

        return matchDetail;
    }
}
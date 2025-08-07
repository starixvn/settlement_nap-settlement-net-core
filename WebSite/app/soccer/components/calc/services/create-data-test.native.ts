import { MatchDetail } from '../../../../shared/models/sportsbook-sop';
import { FantasyRelatedMatch, MatchDetailSoccer } from '../models/match.model';

export class CreateDataTest {
    public static MatchDetail() : MatchDetailSoccer {
        const  matchDetail: MatchDetailSoccer = {
            matchId: null,
            matchCode: null,
            leagueName: null,
            kickOffTime: null,
            homeName: null,
            awayName: null,
            playTime: null,
            goalRecord: null,
            goalIcon: null,
            halfTimeHomeScore: null,
            halfTimeAwayScore: null,
            finalHomeScore: null,
            finalAwayScore: null,
            isFantasyMatch: false,
            isLive: false,
            offerLive: false,
            isInstant: null,
            hasInstantCompleted: null,
            isScoreInconsistent: false,
            originalGoalRecord: null,
            leagueId: null,
            isCalculated: false,
            isHalfTimeCal: false,
            isWarningGoalRecord: false,
            isWarningHalfTimeHomeScore: false,
            isWarningHalfTimeAwayScore: false,
            isWarningFinalAwayScore: false,
            isWarningFinalHomeScore: false,
            homeId: 0,
            awayId: 0,
            bestOfMap: 0,
            gameSession: 0,
            sessionTime: 0,
            map: new MatchDetail(),
            isSavedScore: false,
            betStatus: '',
            confirmFT: 0,
            confirmHT: 0,
            eventStatus: '',
            sportName: '',
            sportType: 0,
            externalSourceName: '',
            leagueGroupId: 0,
            gameType: 0,
            parentId: 0,
            autoSetting: 0,
            isFantasy: false,
            isSupportCopyScore: false,
            leagueType: 0,
            providerCount: 0,
            isExistResultAndFirstTeamScore: false,
            isEnabledGoalRecordHt: false,
            isEnabledGoalRecordFt: false,
            htStatus: '',
            ftStatus: '',
            applyGoalRecord: false,
            isExistFgLg: false,
            isExistHtFgLg: false,
            isExistFgNg: false,
            childMatchType: 0
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
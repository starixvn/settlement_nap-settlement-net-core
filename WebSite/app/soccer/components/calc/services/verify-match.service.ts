import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { EventStatus } from "../../../../shared/constants";
import { FantasyRelatedMatch, MatchDetailSoccer as MatchDetail } from '../models/match.model';
import { TimeMinute, LeagueGroup } from '../models/constant.model';

@Injectable()
export class VerifyMatchService {
    public isCompletedMatch(matchDetail: MatchDetail) {
        return matchDetail.confirmFT > 0 || matchDetail.confirmHT > 0
            || (_.isEqual(matchDetail.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase()));
    }

    public isInstantMatch(matchDetail: MatchDetail) {
        return (matchDetail.isInstant || matchDetail.hasInstantCompleted) && matchDetail.playTime > 0;
    }

    public isPinGoalOrSaba(matchDetail: MatchDetail) {
        return ([LeagueGroup.pinGoal, LeagueGroup.pinGoalMarble].includes(matchDetail.leagueGroupId)|| matchDetail.leagueGroupId === LeagueGroup.sabaVirtual) && matchDetail.playTime >= 0;
    }

    public isEndFirstHalf(matchDetail: MatchDetail) {
        return matchDetail.playTime > TimeMinute.firstHalf;
    }

    public isChildMatch(matchDetail: MatchDetail) {
        return matchDetail.parentId !== 0 && matchDetail.playTime >= 0;
    }

    public isRelatedMatchesInsufficient(relatedTeams: string[], fantasyRelatedMatches: FantasyRelatedMatch[]) {
        return fantasyRelatedMatches.length * 2 < relatedTeams.length
            || _.some(relatedTeams, (teamId) => {
                const findMatch = _.find(fantasyRelatedMatches, (match) =>
                    _.isEqual(match.homeId.toString(), teamId) || _.isEqual(match.awayId.toString(), teamId));
                return _.isNil(findMatch);
            });
    }

    public isExistHoldMatch(fantasyRelatedMatches: FantasyRelatedMatch[]) {
        return _.some(fantasyRelatedMatches, (match) =>
            match.remark.isKeyHold || match.remark.isMtdHold || match.remark.isPending
            || match.remark.isUndecided || match.remark.isUnderSettle);
    }
}
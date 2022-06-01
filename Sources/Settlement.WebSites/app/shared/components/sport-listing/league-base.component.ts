import { Component } from "@angular/core";
import * as _ from "lodash";
import { BackgroundColor, CalculationStatus, ResultType } from "../../constants";
import { Match, Remark } from "../../models";

@Component({
    template: '',
})
export class LeagueBaseComponent {
    public getTotalHomeGames(match: Match) {
        const homeTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
          ? _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.halfTimeScore.home
            : match.homeTotalGames : null;
        return _.isNil(homeTotalGames) ? '-' : homeTotalGames.toString();
        }
    public getTotalAwayGames(match: Match) {
        const awayTotalGames = _.includes(ResultType.havingTotalGames, match.sportType)
            ? _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.halfTimeScore.away
            : match.awayTotalGames : null;
        return _.isNil(awayTotalGames) ? '-' : awayTotalGames.toString();
    }

    public getHalfTimeHomeScore(match: Match) {
        const halfTimeHomeScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
            ? _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.halfTimeScore.home
            : match.halfTimeHomeScore : null;
        return _.isNil(halfTimeHomeScore) ? '-' : halfTimeHomeScore.toString();
    }

    public getHalfTimeAwayScore(match: Match) {
        const halfTimeAwayScore = !_.includes(ResultType.notHavingHalfTimeScore, match.sportType)
            ? _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.halfTimeScore.away
            : match.halfTimeAwayScore : null;
        return _.isNil(halfTimeAwayScore) ? '-' : halfTimeAwayScore.toString();
    }

    public getFinalHomeScore(match: Match) {
        const finalHomeScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.finalScore.home
            : match.finalHomeScore;
        return _.isNil(finalHomeScore) ? '-' : finalHomeScore.toString();
    }

    public getFinalAwayScore(match: Match) {
        const finalAwayScore = _.includes(ResultType.scoreInResultDetail, match.sportType)
            ? match.moreScores.finalScore.away
            : match.finalAwayScore;
        return _.isNil(finalAwayScore) ? '-' : finalAwayScore.toString();
    }

    public undecidedColor(remark: Remark) {
        return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
    }

    public getEventStatusColor(match: Match) {
        return _.isNull(match.isCalculatingSingle) ? match.eventStatusColor
            : match.isCalculatingSingle === CalculationStatus.waiting ? `${BackgroundColor.waiting} ${match.eventStatusColor}`
            : match.isCalculatingSingle === CalculationStatus.calculating ? `${BackgroundColor.calculating} ${match.eventStatusColor}`
                : match.eventStatusColor;
    }
}
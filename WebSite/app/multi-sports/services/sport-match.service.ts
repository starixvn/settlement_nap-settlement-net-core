import { Injectable } from "@angular/core";
import { Match,  SportMatch } from "../models";
import { MoreScore } from "../../shared/models/match-details/more-score.model";
import { Score } from "../../shared/models/match-details/score.model";
import { BackgroundColor, EventStatus, ResultType } from "../../shared/constants";
import * as _ from 'lodash';
import { Permission } from "../models/permission.model";

@Injectable()
export class SportMatchService {
    public getSportsWithIntervalScore(sports: SportMatch[], permission: Permission = null) {
      console.log(sports)
        sports.forEach((sport) => {
          if (_.includes(ResultType.havingIntervalScore, sport.id)) {
            sport.leagues.forEach((league) => league.matches.forEach((match) => this.getMatchIntervalScore(match, permission)));
          }
        });

        return sports;
      }

      public getMatchIntervalScore(match: Match, permission: Permission) {
        if (_.includes(ResultType.havingIntervalScore, match.sportType)) {
          if (_.includes(ResultType.intervalScoreByResultDetail, match.sportType)) {
            this.transferScoreFromResultDetailToInterval(match);
          } else {
            this.transferScoreFromBetStatusToInterval(match, permission);
          }
        }
      }

      private transferScoreFromBetStatusToInterval(match: Match, permission: Permission) {
        let betStatus: string[] = [];
        if (match.betStatus) {
          betStatus = this.getBetStatusWithoutRefund(match.betStatus);
          match.homeTotalGames = 0;
          match.awayTotalGames = 0;
        } else {
          match.homeTotalGames = null;
          match.awayTotalGames = null;
        }

        if (betStatus.length > 0) {
          match.isHavingIntervalScore = true;
          this.getIntervalScoreByBetStatus(match, betStatus, permission);
        } else {
          match.isHavingIntervalScore = false;
        }
      }

      private getBetStatusWithoutRefund(betStatus: string) {
        return _.includes(betStatus, EventStatus.refund)
          ? betStatus.indexOf(';') + 1 < betStatus.length
            ? betStatus.substring(betStatus.indexOf(';') + 1).split(',')
            : []
          : betStatus.split(',');
      }

      private getIntervalScoreByBetStatus(match: Match, betStatus: string[], permission: Permission) {
        let maxRound = 0;
        let halfTimeRound = 0;
        if (_.includes(ResultType.havingFourMaxRound, match.sportType)) {
          maxRound = 4;
          halfTimeRound = 2;
        } else if (_.includes(ResultType.havingFiveMaxRound, match.sportType)) {
          maxRound = 5;
          halfTimeRound = 2;
        } else if (_.includes(ResultType.havingTenMaxRound, match.sportType)) {
          maxRound = 10;
          halfTimeRound = 5;
        }

        this.getScoreByBetStatus(match, betStatus, maxRound, halfTimeRound, permission);
        this.transferScoreFromResultDetailToInterval(match);
      }

      private getScoreByBetStatus(match: Match, betStatus: string[], maxRound: number, halfTimeRound: number, permission: Permission) {
        match.moreScores = new MoreScore();
        for (let i = 0; i < maxRound; i++) {
          if (i >= betStatus.length) {
            const backgroundColor = this.getCalculateBackground(i, halfTimeRound, match);
            match.moreScores.sets.push(new Score('-', '-', backgroundColor));
          } else {
            const isShowScore = permission?.isLeader || this.isSetCalculated(i, halfTimeRound, match) || match.isCalRefund;
            this.pushSetsScores(isShowScore, match, i, betStatus, halfTimeRound);
          }
        }
      }

      private pushSetsScores(isShowScore: boolean, match: Match, index: number, betStatus: string[], halfTimeRound: number) {
        if (isShowScore) {
        const backgroundColor = this.getCalculateBackground(index, halfTimeRound, match);
        const currentSet = betStatus[index].split('-');
        match.moreScores.sets.push(new Score(currentSet[0], currentSet[1], backgroundColor));
          if (_.includes(ResultType.havingTotalGames, match.sportType)) {
            match.homeTotalGames += Number(currentSet[0]);
            match.awayTotalGames += Number(currentSet[1]);
          }
        } else {
          match.moreScores.sets.push(new Score('-', '-', ''));
        }
      }

      private getCalculateBackground(index: number, halfTimeRound: number, match: Match) {
        return this.isSetCalculated(index, halfTimeRound, match) ? BackgroundColor.calculated : '';
      }

      private isSetCalculated(index: number, halfTimeRound: number, match: Match) {
        if (index < halfTimeRound) {
          return match.isHalfTimeCal || match.isCalculated;
        } else {
          return match.isCalculated;
        }
      }

      private transferScoreFromResultDetailToInterval(match: Match) {
        match.intervalScore = [];
        match.moreScores.sets.forEach((set) => {
          match.intervalScore.push(set);
        });
      }
}
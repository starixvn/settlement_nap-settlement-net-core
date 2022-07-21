import { Injectable } from '@angular/core';
import { MultiSport, ChangeSettingResult } from "../models";
import { Match, SportMatch, LeagueMatch } from "../../shared/models";
import { EventStatus } from '../constants';
import * as _ from 'lodash';
import { BackgroundColor, CalculationStatus } from '../../shared/constants';

@Injectable()
export class HandleActionsService {
    public handleEventStatusColor(match: Match, isPending: boolean) {
        if (_.isEqual(match.eventStatus, EventStatus.postponed)) {
          return this.isExistMergedAndMarkedTickets(match) ? BackgroundColor.postponedBlinking : BackgroundColor.postponed;
        }

        if (_.isEqual(match.eventStatus, EventStatus.completed)) {
          return this.getBackgroundForCompletedMatch(match);
        }

        if (isPending) {
          return this.isExistMergedAndMarkedTickets(match) ? BackgroundColor.pendingBlinking : BackgroundColor.pending;
        }

        return this.isExistMergedAndMarkedTickets(match) ? BackgroundColor.whiteBlinking : '';
    }

    private getBackgroundForCompletedMatch(match: Match) {
        if (this.isExistMergedAndMarkedTickets(match) && !match.isExistRunningTicket) {
          return BackgroundColor.whiteBlinking;
        }

        if (match.isExistRunningTicket) {
          return this.isExistMergedAndMarkedTickets(match) ? BackgroundColor.runningTicketBlinking : BackgroundColor.halfTimeCalculated;
        }

        return '';
    }

    public isCheckedCalcMpOnLeague(league: LeagueMatch, canCalculate: boolean) {
        const findItem = league.matches.find((match) => !match.isCheckedCalcMP && this.enableCalcMPOnMatch(match, canCalculate));
        return _.isNil(findItem);
    }

    public isAllCalcMPAllLeaguesChecked(sports: SportMatch[]) {
        let countEnableCheckboxMixParlayOnLeagues = 0;
        _.forEach(sports, (sport: SportMatch) => {
          const leagues = sport.leagues.filter((x) => !x.disableCheckCalcMP);
          countEnableCheckboxMixParlayOnLeagues += _.filter(leagues, (league: LeagueMatch) => !league.disableCheckCalcMP).length;
        });

        let countCheckedMixParlayOnLeagues = 0;
        _.forEach(sports, (sport: SportMatch) => {
          const leagues = sport.leagues.filter((x) => x.isCheckedCalcMP);
          countCheckedMixParlayOnLeagues += _.filter(leagues, (league: LeagueMatch) => !league.disableCheckCalcMP).length;
        });

        return countCheckedMixParlayOnLeagues > 0 && countEnableCheckboxMixParlayOnLeagues === countCheckedMixParlayOnLeagues;
    }

    public resetCheckboxCalcMixParlay(match: Match, sports: SportMatch[], multiSport: MultiSport) {
        let currentLeague = null;
        sports.forEach((sport) => {
            const findLeague = sport.leagues.find((league) => league.leagueId === match.leagueId);
            if (findLeague) {
                currentLeague = findLeague;
            }
        });

        if (!_.isNil(currentLeague)) {
            const findItem = currentLeague.matches.find((item: Match) =>
                this.enableCalcMPOnMatch(item, multiSport.permission.canCalculateMp));
            if (_.isNil(findItem)) {
                currentLeague.isCheckedCalcMP = false;
            } else {
                currentLeague.disableCheckCalcMP = false;
                currentLeague.isCheckedCalcMP = this.isCheckedCalcMpOnLeague(currentLeague, multiSport.permission.canCalculateMp);
            }

            multiSport.isCheckedCalcMP = this.isAllCalcMPAllLeaguesChecked(sports);
        }
    }

    public enableCalcMPOnMatch(match: Match, canCalculate: boolean) {
        return match.mixParlay.hasMixParlay && canCalculate;
    }

    public getMixParlayStatus(match: Match) {
        return (_.isNull(match.isCalculatingSingle) || match.isCalculatingSingle === CalculationStatus.success)
              && (_.isNull(match.isCalculatingMP) || match.isCalculatingMP === CalculationStatus.success)
              && match.mixParlay.isKeyScore
              && match.isCalculated
              && !match.isExistMarkedTicketParlay
              && !_.includes(match.betStatus, EventStatus.refundHalftime);
    }

    public handleChangeRemarkSetting(result: ChangeSettingResult, match: Match, sports: SportMatch[], multiSport: MultiSport) {
      const remark = result.match.remark;
      match.remark = remark;
      match.eventStatus = result.match.eventStatus;
      match.newEventStatus = result.match.eventStatus;
      if (remark.isMtdHold || remark.isPending || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold) {
        match.showLink = false;
        match.isCheckedCalcMP = false;
        match.mixParlay.hasMixParlay = false;
      } else {
        match.showLink = true;
        match.mixParlay.hasMixParlay = this.getMixParlayStatus(match);
      }

      match.eventStatusColor = this.handleEventStatusColor(match, remark.isPending);
      this.resetCheckboxCalcMixParlay(match, sports, multiSport);
    }

    private isExistMergedAndMarkedTickets(match: Match) {
      return match.isMergedParlay ? match.isExistMarkedTicket || match.isExistMarkedTicketParlay : match.isExistMarkedTicket;
    }
}
import { Injectable } from '@angular/core';
import { LeagueMatch, Match } from "../models";
import { ChangeSettingResult } from "../../shared/models";
import * as _ from 'lodash';
import { BackgroundColor, EventStatus } from '../../shared/constants';

@Injectable()
export class HandleActionsService {
  public handleEventStatusColor(match: Match, isPending: boolean) {
    if (_.isEqual(match.eventStatus, EventStatus.postponed)) {
      return match.isExistMarkedTicket ? BackgroundColor.postponedBlinking : BackgroundColor.postponed;
    }

    if (_.isEqual(match.eventStatus, EventStatus.completed)) {
      return this.getBackgroundForCompletedMatch(match);
    }

    if (isPending) {
      return match.isExistMarkedTicket ? BackgroundColor.pendingBlinking : BackgroundColor.pending;
    }

    return match.isExistMarkedTicket ? BackgroundColor.whiteBlinking : '';
  }

  private getBackgroundForCompletedMatch(match: Match) {
    if (match.isExistMarkedTicket && !match.isExistRunningTicket) {
      return BackgroundColor.whiteBlinking;
    }

    if (match.isExistRunningTicket) {
      return match.isExistMarkedTicket ? BackgroundColor.runningTicketBlinking : BackgroundColor.halfTimeCalculated;
    }

    return '';
  }

  public handleChangeRemarkSetting(result: ChangeSettingResult, match: Match) {
    const runningStatus = [EventStatus.closed, EventStatus.running, EventStatus.resultPending].map(i => i.toLowerCase());
    match.remark = result.match.remark;
    match.newEventStatus = _.includes(runningStatus, match.eventStatus.toLowerCase()) ? result.match.newEventStatus : match.newEventStatus;
    match.eventStatus = result.match.eventStatus;
    match.eventStatusColor = this.handleEventStatusColor(match, result.match.remark.isPending);
  }

  public handleAutoInstantForMatch(leagueMatch: LeagueMatch, isAutoInstant: boolean) {
    leagueMatch.matches.forEach((item,index) => {
      const eventStatus = item.eventStatus.toLocaleLowerCase();
      if (_.isEqual(eventStatus, EventStatus.running.toLocaleLowerCase()) || _.isEqual(eventStatus, EventStatus.closed.toLocaleLowerCase())) {
        if(item.autoCalcSetting.isInstantForMatch !== isAutoInstant) {
          item.autoCalcSetting.isInstantForMatch = isAutoInstant;
          leagueMatch.matches[index]  = {...item};
        }
      }
    });
  }
}
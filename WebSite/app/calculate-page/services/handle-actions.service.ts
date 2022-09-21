import { Injectable } from '@angular/core';
import { Match, ChangeSettingResult } from "../../shared/models";
import * as _ from 'lodash';
import { BackgroundColor, EventStatus } from '../../shared/constants';
import { CalculationMatch, League } from '../models';
import { InstantStatus } from "../constants";

@Injectable()
export class HandleActionsService {

  public handleChangeRemarkSetting(result: ChangeSettingResult, match: Match) {
    const remark = result.match.remark;
    match.remark = remark;
    match.eventStatus = result.match.eventStatus;
    match.newEventStatus = result.match.newEventStatus;
    match.eventStatusColor = this.handleEventStatusColor(match, remark.isPending);
    match.autoCalcSetting = result.match.autoCalcSetting;
  }

  public handleChangeInstantStatus(match: CalculationMatch) {
    match.newEventStatus = EventStatus.waiting;
    match.eventStatusColor = BackgroundColor.waiting;
    match.isCalculatingSingle = 1;
    match.instantStatusId = InstantStatus.complete;
  }

  public handleAutoInstantForMatch(leagueMatch: League, isAutoInstant: boolean) {
    leagueMatch.matches.forEach(item => {
      const eventStatus = item.eventStatus.toLocaleLowerCase();
      if (eventStatus.includes('refund ht')
        || _.isEqual(eventStatus, EventStatus.running.toLocaleLowerCase()) || _.isEqual(eventStatus, EventStatus.closed.toLocaleLowerCase())) {
        item.autoCalcSetting.isInstantForMatch = isAutoInstant;
      }
    });
  }

  public updateAutoPayoutForMatch(league: League, isApplyAll: boolean) {
    if (isApplyAll) {
      league.matches.forEach(match => {
        const eventStatus = match.eventStatus.toLocaleLowerCase();
        if (eventStatus.includes('refund ht')
          || _.isEqual(eventStatus, EventStatus.running.toLocaleLowerCase()) || _.isEqual(eventStatus, EventStatus.closed.toLocaleLowerCase())) {
          match.autoCalcSetting.isAutoPayoutForMatch = league.autoCalcSetting.isAutoPayoutForLeague;
          match.autoCalcSetting.isDirectPayoutForMatch = league.autoCalcSetting.isDirectPayoutForLeague;
        }
      });
    }
  }

  private handleEventStatusColor(match: Match, isPending: boolean) {
    if (_.isEqual(match.eventStatus, EventStatus.postponed)) {
      return this.isExistMarkedTickets(match) ? BackgroundColor.postponedBlinking : BackgroundColor.postponed;
    }

    if (_.isEqual(match.eventStatus, EventStatus.completed)) {
      return this.getBackgroundForCompletedMatch(match);
    }

    if (isPending) {
      return this.isExistMarkedTickets(match) ? BackgroundColor.pendingBlinking : BackgroundColor.pending;
    }

    return this.isExistMarkedTickets(match) ? BackgroundColor.whiteBlinking : '';
  }

  private getBackgroundForCompletedMatch(match: Match) {
    if (this.isExistMarkedTickets(match) && !match.isExistRunningTicket) {
      return BackgroundColor.whiteBlinking;
    }

    if (match.isExistRunningTicket) {
      return this.isExistMarkedTickets(match) ? BackgroundColor.runningTicketBlinking : BackgroundColor.halfTimeCalculated;
    }

    return '';
  }

  private isExistMarkedTickets(match: Match) {
    return match.isExistMarkedTicket || match.isExistMarkedTicketParlay;
  }
}
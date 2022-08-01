import { Injectable } from '@angular/core';
import { Match, ChangeSettingResult } from "../../shared/models";
import * as _ from 'lodash';
import { BackgroundColor, EventStatus } from '../../shared/constants';
import { CalculationMatch, League } from '../models';

@Injectable()
export class HandleActionsService {

  public handleChangeRemarkSetting(result: ChangeSettingResult, match: Match) {
    const remark = result.match.remark;
    match.remark = remark;
    match.eventStatus = result.match.eventStatus;
    match.newEventStatus = result.match.newEventStatus;
    if (remark.isMtdHold || remark.isPending || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold) {
      match.showLink = false;
    } else {
      match.showLink = true;
    }

    match.eventStatusColor = this.handleEventStatusColor(match, remark.isPending);
  }

  public handleChangeInstantStatus(match: CalculationMatch) {
    match.newEventStatus = EventStatus.waiting;
    match.eventStatusColor = BackgroundColor.waiting;
    match.isCalculatingSingle = 1;

  }

  public handleAutoInstantForMatch(leagueMatch: League, isAutoInstant: boolean) {
    leagueMatch.matches.forEach(item => {
      const eventStatus = item.eventStatus.toLocaleLowerCase();
      if (!eventStatus.includes('refund ht')
        || _.isEqual(eventStatus, EventStatus.running.toLocaleLowerCase()) || _.isEqual(eventStatus, EventStatus.closed)) {
        item.autoCalcSetting.isInstantForMatch = isAutoInstant;
      }
    });
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
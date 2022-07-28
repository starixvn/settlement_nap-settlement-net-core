import { Injectable } from '@angular/core';
import { Match, ChangeSettingResult } from "../../shared/models";
import * as _ from 'lodash';
import { BackgroundColor, EventStatus } from '../../shared/constants';

@Injectable()
export class HandleActionsService {
  public handleChangeRemarkSetting(result: ChangeSettingResult, match: Match) {
    const remark = result.match.remark;
    match.remark = remark;
    match.eventStatus = result.match.eventStatus;
    match.newEventStatus =  result.match.newEventStatus;
    if (remark.isMtdHold || remark.isPending || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold) {
      match.showLink = false;
    } else {
      match.showLink = true;
    }

    match.eventStatusColor = this.handleEventStatusColor(match, remark.isPending);
  }

  private handleEventStatusColor(match: Match, isPending: boolean) {
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
}
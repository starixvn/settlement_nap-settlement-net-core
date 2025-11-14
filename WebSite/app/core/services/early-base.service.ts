import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { ItemsSelect } from '../../shared/models';
import { ResultDetail, GroupMap, MatchDetail, Permission } from '../../shared/models/sportsbook-sop';

@Injectable()
export class EarlyBaseService {

  public isInValidResultValue(resultDetail: ResultDetail[]) {
    const resultWarning = _.find(resultDetail, (x: ResultDetail) => x.isResultWarning);
    return !_.isEmpty(resultWarning);
  }

  public verifyResultValueForBetType(resultDetail: ResultDetail[]) {
    resultDetail.forEach((item: ResultDetail) => {
      item.isResultWarning = this.isEmptyHome(item);
    });
  }

  public isEmptyHome(item: ResultDetail) {
    return item.homeValue === null || _.isEmpty(item.homeValue);
  }

  public renderTicketStatus(bonnusSelections  = []) {
    const selection = [
      { id: 1, value: "Running;", text: "Running", checked: true },
      { id: 2, value: "Marked", text: "Marked" },       
      { id: 3, value: "Calculated", text: "Calculated" },
      ...bonnusSelections
    ];
    return this.createListOption(selection);
  }

  public renderResultStatus(permission: Permission, bonnusSelections  = []) {
    const selection = [
      { id: 1, value: "Running", text: "Running", checked: true },
      { id: 2, value: "Completed (Auto)", text: "Completed (Auto)", checked: true },
      { id: 3, value: "Completed (Manual)", text: "Completed (Manual)", checked: true },
      { id: 4, value: "Refund", text: "Refund", checked: true },
      { id: 5, value: "No Result", text: "No Result", checked: true },
      { id: 6, value: "Confirmed", text: "Confirmed Refund", checked: false, hasPermission: permission.isLeader },
      { id: 7, value: "3", text: "Confirmed by Trader", checked: true },
      ...bonnusSelections
    ];

    

    return this.createListOption(selection);
  }

  public renderResultType(groupMap: GroupMap[]) {
    const selection = [];
    groupMap.forEach(group => {
      selection.push({ id: 1, value: group.groupName, text: group.groupName, checked: true });
    });
    return this.createListOption(selection);
  }

  protected createListOption(items) {
    const tickets = new Array<ItemsSelect>();
    items.forEach((item) => {
      const temp = new ItemsSelect(
        item.id,
        item.value,
        item.text,
        item.checked,
        true,
        true,
        []);
        if (item.hasPermission ?? true) {
          tickets.push(temp);
      }
    });

    return tickets;
  }

  public getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
    let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
    resultDetails.forEach((x: ResultDetail) => {
      const value = _.isEqual(x.homeValue, "H") ? matchDetail.homeName :
        _.isEqual(x.homeValue, "A") ? matchDetail.awayName : "None";
      confirmMessage += `${x.betTypeName}: ${value}<br/>`;
    });

    return confirmMessage;
  }

  public async verifyBeforeCalculation(selectedResultDetail: ResultDetail[], isLeader: boolean) {
    const existResultConfirmed = _.find(selectedResultDetail, item => item.resultSettingData.isConfirmedRefund);
    this.verifyResultValueForBetType(selectedResultDetail);
    const isInValid = this.isInValidResultValue(selectedResultDetail);

    if(!_.isNil(existResultConfirmed)) {
      return Language.confirmRefund.calculateResultNotConfirmed;
    } else if (isInValid) {
      return isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult;
    } else {
      return "";
    }
  }
}
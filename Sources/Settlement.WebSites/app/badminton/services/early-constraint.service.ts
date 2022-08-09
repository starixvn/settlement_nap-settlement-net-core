import { Injectable } from '@angular/core';
import { EarlyBaseService } from '../../core/services/early-base.service';
import * as _ from 'lodash';
import { ResultDetail,GroupMap, MatchDetail } from '../../shared/models/sportsbook-sop';
import { SportType } from '../../shared/constants';
import { Language } from '../../shared/language';
import { InputType, VolleyballBetTypes } from '../constants';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';

@Injectable()
export class EarlyConstraintService extends EarlyBaseService {
  constructor(private readonly resultByTeamNamePipe: ResultByTeamNamePipe) {
      super();
  }

  public getGroupMapBySets(resultDetail: ResultDetail[]) {
    const result = resultDetail.filter((x) => x.map !== 0);
    const list = _.uniqBy(result, (item) => item.map);
    const maps: GroupMap[] = [];

    list.forEach((item) => {
      const newResultDetail = resultDetail.filter((x) => x.map === item.map);
      newResultDetail.forEach((x) => x.groupName = `Game ${x.map}`);
      maps.push(new GroupMap( `Game ${item.map}`, newResultDetail));
    });

    maps.forEach(item => item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult));

    return maps;
  }

  public getGroupMapByGroupName(resultDetails: ResultDetail[]) {
    const list = _.uniqBy(resultDetails, (item) => item.groupName);
    const maps: GroupMap[] = [];

    list.forEach((item) => {
      const newResultDetails = resultDetails.filter((x) => x.groupName === item.groupName);
      maps.push(new GroupMap(item.groupName, newResultDetails));
    });

    maps.forEach(item => item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult));

    return maps;
  }

  public getEarlyResultDetails(resultDetails: ResultDetail[], sportType: number, maxLength: number) {
    if (sportType === SportType.volleyBall) {
      return resultDetails.filter((map) => !_.isNil(map.betTypeName) && !_.isEmpty(map.betTypeName));
    }

    return resultDetails.filter((map) => map.resourceId.length > maxLength);
  }

  public getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
    let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
    resultDetails.forEach((map: ResultDetail) => {
      let value: string;
      if (map.inputType === InputType.coupleScore) {
        value = `&nbsp${matchDetail.homeName}(${map.homeValue}) - ${matchDetail.awayName}(${map.awayValue})`;
      } else {
        map.groupBetType = matchDetail.sportType === SportType.volleyBall ? map.inputType : map.groupBetType;
        value = this.resultByTeamNamePipe.transform(map.homeValue, matchDetail, map.groupBetType);
      }

      confirmMessage += `${map.betTypeName}: ${value}<br/>`;
    });

    return confirmMessage;
  }

  public override verifyResultValueForBetType(resultDetail: ResultDetail[]) {
    resultDetail.forEach((item: ResultDetail) => {
      item.isResultWarningByBetType = this.isBetTypesResultInvalid(item);
      if (item.inputType === InputType.coupleScore) {
        item.isResultWarning = this.isEmptyHomeOrAway(item);
      } else {
        item.isResultWarning = this.isEmptyHome(item);
      }
    });
  }

  public isEmptyHomeOrAway(item: ResultDetail) {
    return item.homeValue === null || _.isEmpty(item.homeValue)
    || item.awayValue === null || _.isEmpty(item.awayValue);
  }

  public async verifyBeforeCalculation(selectedResultDetail: ResultDetail[], isLeader: boolean) {
    const existResultConfirmed = _.find(selectedResultDetail, item => item.resultSettingData.isConfirmedRefund);
    this.verifyResultValueForBetType(selectedResultDetail);
    const isInValid = this.isInValidResultValue(selectedResultDetail);
    const isBetTypeInvalid = this.isInvalidBetTypeValue(selectedResultDetail);

    if(!_.isNil(existResultConfirmed)) {
      return Language.confirmRefund.calculateResultNotConfirmed;
    } else if (isInValid) {
      return isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult;
    } else if (isBetTypeInvalid) {
      return Language.sop.invalidResultByBetType;
    } else {
      return "";
    }
  }

  public isInvalidBetTypeValue(resultDetail: ResultDetail[]) {
    const resultWarning = _.find(resultDetail, (x: ResultDetail) => x.isResultWarningByBetType);
    return !_.isEmpty(resultWarning);
  }

  public isBetTypesResultInvalid(resultDetail: ResultDetail) {
    if (this.isEarlyResultInvalid(resultDetail)) {
      return false;
    }

    resultDetail.homeValue = resultDetail.homeValue.toUpperCase();
    resultDetail.awayValue = resultDetail.awayValue.toUpperCase();

    const betType = resultDetail.resourceId.slice(0, 4);
    if (_.isEqual(betType, VolleyballBetTypes.raceToPoints)) {
      return this.isRaceToPointsBetTypeInvalid(resultDetail);
    } else if (_.isEqual(betType, VolleyballBetTypes.pointsPlayed)) {
      return this.isPointsPlayedBetTypeInvalid(resultDetail);
    }

    return false;
}

  private isEarlyResultInvalid(resultDetail: ResultDetail) {
    return this.isEmptyHomeOrAway(resultDetail) || resultDetail.resourceId.length < 8;
  }

  public isRaceToPointsBetTypeInvalid(resultDetail: ResultDetail) {
      const maxPoint = Number(resultDetail.resourceId.slice(6));
      const home = Number(resultDetail.homeValue);
      const away = Number(resultDetail.awayValue);
      const isResultTypeDifferent = this.isNoneValue(resultDetail.homeValue) !== this.isNoneValue(resultDetail.awayValue);
      const isNumbericResult = !this.isNoneValue(resultDetail.homeValue) && !this.isNoneValue(resultDetail.awayValue);
      const isResultEqual = isNumbericResult && Number(resultDetail.homeValue) === Number(resultDetail.awayValue);
      const isPointResultInvalid = isNumbericResult && (home > maxPoint || away > maxPoint || (home !== maxPoint && away !== maxPoint));

      return isResultEqual || isResultTypeDifferent || isPointResultInvalid;
  }

  public isPointsPlayedBetTypeInvalid(resultDetail: ResultDetail) {
      const maxPoint = Number(resultDetail.resourceId.slice(6));
      const home = Number(resultDetail.homeValue);
      const away = Number(resultDetail.awayValue);
      const isResultTypeDifferent = this.isNoneValue(resultDetail.homeValue) !== this.isNoneValue(resultDetail.awayValue);
      const isNumbericResult = !this.isNoneValue(resultDetail.homeValue) && !this.isNoneValue(resultDetail.awayValue);
      const isResultInvalid = isNumbericResult && home + away !== maxPoint;

      return isResultTypeDifferent || isResultInvalid;
  }

  private isNoneValue(value: string) {
      return _.isEqual(value, 'N');
  }
}
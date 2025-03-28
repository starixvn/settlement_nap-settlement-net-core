import { CalculateAction } from './../../../../shared/constants/calculate-action.native';

import { LeagueGroup, TimeMinute } from "../../../components/calc/models/constant.native";
import { MatchDetail } from "../../../components/calc/models/match.model";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import { ResultStatusId, ScoreSourceType } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';
import { Permission } from "../../../../shared/models/sportsbook-sop";
import * as _ from 'lodash';
import { inject } from '@angular/core';
import { VerifyScoreGoalService } from '../../../components/calc/services/verify-score-goal.service';
import { MessageBoxService } from '../../../../shared/services';


export class VerifyScoreConfirmHandler extends AbstractHandler {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly validSourceTypes = [ScoreSourceType.Sbo, ScoreSourceType.trader];
  private readonly messageBoxService = inject(MessageBoxService);

  async handle(storage: Storage) {
    const { matchDetail, resultDetails, permission } = storage.getMatch();
    const calculateAction = storage.getCalculateAction();
    const isHalfTime = calculateAction === CalculateAction.calculateHalfTime;
    const isFullTime = calculateAction === CalculateAction.calculateFullTime;
    const isCalculate = calculateAction === CalculateAction.calculate;
    const halfTimeResult = storage.getHalfTimeResult();

    if (this.halfTimeCompleted(halfTimeResult, isFullTime && !halfTimeResult.checked)) {
      storage.error(Language.soccer.halfTimeNotSettleYet);
      return;
    }

    if ((isHalfTime && this.isDisableCalculateHalfTime(matchDetail)) ||
    (isFullTime && this.isDisableFulltimeCalculate(matchDetail)) ||
    (isCalculate && this.isDisableFulltimeCalculate(matchDetail))) {
      storage.error(Language.soccer.scoreNotConfirmed.replaceAll('{0}', isHalfTime ? "HT" : "FT"));
      return;
  }

    if(!this.isExistsOutsideResults(resultDetails)) {
      storage.error(Language.sop.notScreenshot);
      return;
    }

    if(this.isExistsMismatchOutsideResults(resultDetails)) {
      storage.error(Language.sop.mismatchedScreenshot);
      return;
    }

    if(this.isExistsInsufficientResult(resultDetails)) {
      if(!permission.isLeader) {
        storage.error(Language.eSports.nonLeader.insufficientSources);
        return;
      }
     return this.confirmInsufficientResult(storage, permission);
    }

    if(this.isExistsInconsistentResult(resultDetails)) {
      if(!permission.isLeader) {
        storage.error(Language.eSports.nonLeader.mismatchedResult);
        return;
      }
      return this.confirmInconsistentResult(storage, permission);
    }
    
    super.handle(storage);
  }

  private confirmInsufficientResult(storage: Storage, permission: Permission) {
    storage.setConfirmMessage(Language.eSports.leader.insufficientSources);
    this.messageBoxService.confirm(storage.getConfirmMessage(), () => {
      this.confirmInconsistentResult(storage, permission);
    });
  }
  

  private confirmInconsistentResult(storage: Storage, permission: Permission) {
    storage.setConfirmMessage(Language.eSports.leader.mismatchedResult);
    this.messageBoxService.confirm(storage.getConfirmMessage(), () => {
         super.handle(storage);
    });
  }

  private halfTimeCompleted(halfTimeResult: ResultDetail, isFullTime: boolean) {
    return isFullTime && halfTimeResult.resultStatusId !== ResultStatusId.AutoCompleted && halfTimeResult.resultStatusId !== ResultStatusId.ManualCompleted;
  }

  private byPassDisableRule(matchDetail: MatchDetail) {
    return matchDetail.leagueGroupId === LeagueGroup.pinGoal || matchDetail.leagueGroupId === LeagueGroup.sabaVirtual;
  }

  private isDisableCalculateHalfTime(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.firstHalf && matchDetail.confirmHT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }

  private isDisableFulltimeCalculate(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.total && matchDetail.confirmFT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }

  private isExistsOutsideResults(resultDetails: ResultDetail[]) {
    const resultsId = resultDetails.filter(x => x.checked)
      .map(x => x.resourceId);

    return resultDetails.filter(x => x.sourceId === ScoreSourceType.screenshot 
        && resultsId.includes(x.resourceId)
        && !_.isEmpty(x.homeValue) 
        && !_.isEmpty(x.awayValue)).length > 0;
  }

  private isExistsMismatchOutsideResults(resultDetails: ResultDetail[]) {
    const checkedResults = this.getCheckedResults(resultDetails);

    return checkedResults.some(x => {
      const outsideResult = resultDetails.find(y => y.sourceId === ScoreSourceType.screenshot && y.resourceId === x.resourceId);
      return outsideResult && (outsideResult.homeValue !== x.homeValue || outsideResult.awayValue !== x.awayValue);
    });
  }

  private isExistsInsufficientResult(resultDetails: ResultDetail[]) {
    const checkedResults = this.getCheckedResults(resultDetails);
   
    for(const result of checkedResults) {
      const sourceResults = this.getValidSourceResults(resultDetails, result.resourceId);

      if(sourceResults.length === 0) {
        return true;
      }
    }

    return false;
  }

  private isExistsInconsistentResult(resultDetails: ResultDetail[]) {
    const checkedResults = this.getCheckedResults(resultDetails);

    for(const result of checkedResults) {
      const outsideResult = resultDetails
        .find(y => y.sourceId === ScoreSourceType.screenshot && y.resourceId === result.resourceId);
      const sourceResults = this.getValidSourceResults(resultDetails, result.resourceId);
      const [valid] = this.verifyScoreGoalService.tryGetValidResult(outsideResult, sourceResults);

      if(!valid) {
        return true;
      }
    }

    return false;
  }
  
  private getCheckedResults(resultDetails: ResultDetail[]) {
    return resultDetails.filter(x => x.checked);
  }

  private getValidSourceResults(resultDetails: ResultDetail[], resourceId: string ) {
    return resultDetails.filter(x => x.resourceId === resourceId 
      && this.validSourceTypes.includes(x.sourceId) 
      && this.verifyScoreGoalService.isValidResult(x));
  }
}
import { Component, ViewChild } from '@angular/core';
import { MatchResource, ModalDialogMessage } from '../../../shared/models';
import { MatchAio, SettleQuery } from '../../models';
import { ResultPipe, ScorePipe } from '../../pipes';
import { AioService, MessageBoxService } from '../../../shared/services';
import * as _ from 'lodash';
import { ExternalResult, ExternalResultDetail, HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { CalculateAction, MatchStatus, ResultStatusId, ScoreSourceType, SettlementStatusId, SportType } from '../../../shared/constants';
import { ApiKeys, KickOffTime, ResourcesIds } from '../../constants';
import { GameTotalService } from './game-total.service';
import { GameTotalVerificationService } from './game-total-verification.service';
import { Language } from '../../../shared/language.native';
import { ChildMatch } from '../../models/child-match.model';
import { SettleChildMatchQuery } from '../../models/settle-child-match-query.model';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'calculation',
  templateUrl: './game-total-calculation.component.html',
  providers: [
    ScorePipe,
    ResultPipe
  ]
})
export class GameTotalCalculationComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public isReadyMatch = true;
  public match: MatchAio;
  public matchDetail: MatchDetail;
  public resultDetails: ResultDetail[];
  public providerResultDetails: ExternalResultDetail[];
  public permission: Permission;
  public isReSettledTickets: boolean;
  public scoreClass: string;
  private resultDetailsToAction: ResultDetail[];
  public totalSetOriginal: ResultDetail;
  public resultDetailOriginal: ResultDetail[];
  public externalResult: ExternalResultDetail;
  public externalSourceName: string;
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  public readonly confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public collapse = false;
  private refResultStatus: number = null;

  constructor(private readonly messageBoxService: MessageBoxService,
    private readonly aioService: AioService,
    private readonly gameTotalService: GameTotalService,
    private readonly verificationService: GameTotalVerificationService,
    private readonly toastrService: ToastrService) {
    this.confirmDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    const matchQuery = {
      matchId,
      apikey: ApiKeys.NormalMatch,
      settleType: "MNL"
    };
    this.match = await this.aioService.getMatch(matchQuery) as MatchAio;
    this.resultDetails = this.match.resultDetails;
    this.totalSetOriginal = _.cloneDeep(this.totalSet);
    this.gameTotalService.resetHomeAway(this.match.resultDetails, this.match.permission.isLeader);
    this.mapValue();
  }

  public mapValue() {
    this.toastrService.overlayContainer = this.toastContainer;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.permission = this.match.permission;
    this.matchDetail = this.match.matchDetail;
    this.resultDetails = this.gameTotalService.getResultDetail(this.match.resultDetails);
    this.resultDetailOriginal = _.cloneDeep(this.resultDetails);
    this.isReadyMatch = this.isCompletedOrConfirmScore || this.matchDetail.playTime >= KickOffTime.playTime;
    this.verificationService.getClassWithScore(this.resultDetails, this.match);
    this.getExternalSource();
    this.checkConsistent();
    // this.verificationService.isScoreMismatched(this.totalSet, this.externalResult, this.totalSetOriginal, this.matchDetail);
    this.verificationService.isScoreNewMismatched(this.resultDetails, this.providerResultDetails, this.resultDetailOriginal, this.matchDetail);

  }

  private getExternalSource() {
    const sopExternalResult = this.match.externalResults.find(result => result.sourceId < ScoreSourceType.screenshot 
      && ![ScoreSourceType.trader,ScoreSourceType.screenshot,ScoreSourceType.newScore].includes(result.sourceId));

    console.log(this.match.externalResults);
    
    if(sopExternalResult) {
       this.externalSourceName = sopExternalResult.sourceName;
       this.providerResultDetails = this.getExternalByResultDetails(this.resultDetailOriginal,sopExternalResult);
       this.externalResult = this.match.externalResults[0].resultDetails[0];
       return;
    }
  }

  private getExternalByResultDetails(resultDetails,externalResult: ExternalResult) {
    return resultDetails.map(result => {
      const external = externalResult.resultDetails.find(providerResult => providerResult.resourceId === result.resourceId);

      if(result.resourceId === ResourcesIds.totalPoints) {
        return this.sumExternalTotalPoint(externalResult);
      }

      return external ? external : {resourceId: result.resourceId, homeValue: null,awayValue: null}
    })
  }

  private sumExternalTotalPoint(externalResult: ExternalResult) {
    const resultDetailSets = externalResult.resultDetails.filter(p => p.resourceId !== ResourcesIds.totalSets);
    const homeValue = _.sumBy(resultDetailSets, r =>  Number(r.homeValue));
    const awayValue = _.sumBy(resultDetailSets, r => Number(r.awayValue));

    return new ExternalResultDetail(externalResult.sourceId,ResourcesIds.totalPoints,"",null,homeValue.toString(),awayValue.toString());
  }

  private get isCompletedOrConfirmScore() {
    return this.matchDetail.confirmFT > 0
      || _.isEqual(this.matchDetail.eventStatus, MatchStatus.Completed);
  }

  public get totalSet(): ResultDetail {
    return _.find(this.resultDetails, item => item.resourceId === ResourcesIds.totalSets);
  }

  private get totalPoints(): ResultDetail {
    return _.find(this.resultDetails, item => item.resourceId === ResourcesIds.totalPoints);
  }

  private get ChildMatchSelected(): ChildMatch[] {
    return _.filter(this.match.childMatches, item => item.checked);
  }

  public disableTextBox(resourceId: string) {
    if (this.match.isScoreDirect) {
      return !_.isEqual(resourceId, ResourcesIds.totalSets);
    }

    return _.isEqual(resourceId, ResourcesIds.totalPoints) || (_.isEqual(resourceId, ResourcesIds.totalSets));
  }

  public isErrorOnVerification(resultDetail: ResultDetail) {
    let disabled = this.match.isScoreDirect;
    if (resultDetail.resourceId === ResourcesIds.totalPoints) {
      return false;
    }
    if (resultDetail.resourceId === ResourcesIds.totalSets) {
      disabled = !this.match.isScoreDirect;
    }
    return this.match.isClickOnCalculate && !disabled && (!resultDetail.homeValue || !resultDetail.awayValue);
  }

  public calculation() {
    this.match.isClickOnCalculate = true;
    this.toastrService.clear();
    this.refResultStatus = null;
    this.resultDetailsToAction = this.verificationService.getResultDetailToAction(this.match.resultDetails, this.match.isScoreDirect);
    if (this.verificationService.isEmptyScore(this.resultDetailsToAction)) {
      this.toastrService.error(Language.warningInputScore);
    } else if (this.totalSet.resultSettingData.isConfirmedRefund) {
      this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
    } else if (this.ChildMatchSelected.length > 0) {
      this.verifyChildMatch();
    } else {
      this.verifyRunningOdds();
    }
  }

  private verifyChildMatch() {
    if (this.match.isScoreDirect) {
      this.toastrService.error(Language.directlyWithChildMAtch);
    } else if (this.verificationService.verifyConsistentChildMatch(this.resultDetails, this.ChildMatchSelected)) {
      this.toastrService.error(Language.consistentRelatedMatch);
    } else {
      this.confirmDialogMessage.message = Language.confirmChildMatch;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        this.verifyRunningOdds();
      });
    }
  }

  private async verifyRunningOdds() {
    const selectedResourceIds = this.resultDetailsToAction.map(item => item.resourceId);
    const matchResource = this.createMatchResource();
    const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId,
      selectedResourceIds, CalculateAction.calculate, matchResource);
    if (_.isNil(errorMessage)) {
      this.confirmNotConsistentTotalSet();
    } else {
      this.toastrService.error(errorMessage);
    }
  }


  private createMatchResource() {
    if (this.match.matchDetail.sportType === SportType.volleyBall) {
      const list = [];
      this.ChildMatchSelected.forEach(item => {
        const childMatch = new MatchResource();
        childMatch.matchId = item.matchId;
        childMatch.resourceIds = [item.resourceId];
        list.push(childMatch);
      });
      return list;
    }
    return [];
  }

  private confirmNotConsistentTotalSet() {
    if (!this.match.isScoreDirect && this.verificationService.isNotConsistentTotalSet(this.match.resultDetails)) {
      this.toastrService.error(Language.inconsistentValues);
    } else {
      this.confirmScoreSource();
    }
  }

  private confirmScoreSource() {
    const isSourceInsufficient = this.verificationService.isInsufficient(this.matchDetail.confirmFT,
      this.externalResult, this.totalSetOriginal);
    const isInconsistent = this.totalSet.isScoreMismatched;
    if (isSourceInsufficient || isInconsistent) {
      if (!this.permission.isLeader) {
        this.toastrService.error(Language.otherSports.warningCalculateInconsistent);
      } else {
        this.confirmDialogMessage.message = Language.otherSports.confirmCalculateInconsistent;
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
          this.refResultStatus = isSourceInsufficient ? 1 : 2;
          this.confirmChangedResult();
        });
      }
    } else {
      this.confirmChangedResult();
    }
  }

  private async confirmChangedResult() {
    if (this.isReSettledTickets) {
      this.confirmCalculation();
    } else {
      const getResultQuery = {
        matchId: this.match.matchDetail.matchId,
        apikey: ApiKeys.NormalMatch,
        sportType: this.match.matchDetail.sportType,
      };

      const result = await this.aioService.verifyChangedSettledTickets(this.match.resultDetails, getResultQuery);
      if (result) {
        this.confirmDialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.confirmDialogMessage, () => {
          this.isReSettledTickets = true;
        });
      } else {
        this.confirmCalculation();
      }
    }
  }

  private confirmCalculation() {
    this.confirmDialogMessage.message = this.gameTotalService.getConfirmMessage(this.resultDetailsToAction);
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.sendRequest(CalculateAction.calculate, this.match.matchDetail.matchId,
        this.resultDetailsToAction, this.isReSettledTickets, this.match.isScoreDirect);
    });
  }

  private async sendRequest(type: string, matchId: number, resultDetailList: ResultDetail[],
    isReSettledTickets: boolean, isScoreDirect: boolean) {
    const childMatchIds = this.ChildMatchSelected.map(item => item.matchId).join(',');
    if (type === CalculateAction.unCalculate) {
      resultDetailList.forEach((item) => {
        item.homeValue = "";
        item.awayValue = "";
      });
    }

    const betStatus = this.getBetStatus(type === CalculateAction.unCalculate);
    const settleQuery = new SettleQuery(this.match.matchDetail, resultDetailList, type,
      isReSettledTickets, isScoreDirect, betStatus, childMatchIds);
    settleQuery.refResultStatus = this.refResultStatus;

    const result = await this.aioService.push(settleQuery);
    if (result.isSuccessful) {
      await this.handleChildMatch(settleQuery, type);
      this.settleHedgeMatch(settleQuery);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async handleChildMatch(settleQuery: SettleQuery, type: string) {
    if (this.ChildMatchSelected.length > 0 && type === CalculateAction.calculate) {
      const settleChildMatchQuery = new SettleChildMatchQuery(this.ChildMatchSelected,
        settleQuery.actionName, settleQuery.isReSettledTickets);
      await this.aioService.pushChildMatch(settleChildMatchQuery);
    }
  }

  private settleHedgeMatch(query: SettleQuery) {
    const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      query.isHedgeMatch = true;
      query.childMatchIds = "";
      this.aioService.push(query).then(() => {
        this.messageBoxService.closePopup();
      });
    } else {
      this.messageBoxService.closePopup();
    }
  }

  public uncalculation() {
    this.toastrService.clear();
    this.confirmDialogMessage.message = Language.UncalculationConfirmMessage;
    this.messageBoxService.confirm(this.confirmDialogMessage, () => {
      this.sendRequest(CalculateAction.unCalculate, this.match.matchDetail.matchId,
        this.match.resultDetails, this.isReSettledTickets, this.match.isScoreDirect);
    });
  }

  public changeScore() {
    this.match.isClickOnCalculate = false;
    this.scoreClass = '';
    if (!this.match.isScoreDirect) {
      const totalPoint = this.gameTotalService.changeTotalPoints(this.match.resultDetails);
      this.totalPoints.homeValue = totalPoint.homeValue;
      this.totalPoints.awayValue = totalPoint.awayValue;
      const total = this.gameTotalService.computeTotalSets(this.match.resultDetails);
      this.totalSet.homeValue = total.homeValue;
      this.totalSet.awayValue = total.awayValue;
    }
    this.checkConsistent();
    this.verificationService.isScoreNewMismatched(this.resultDetails, this.providerResultDetails, this.resultDetailOriginal, this.matchDetail);
    this.verificationService.getClassWithScore([this.totalSet], this.match);
  }

  public changeInputDirectly() {
    this.match.isClickOnCalculate = false;
    this.resultDetails.forEach((map) => {
      const originalResult = _.find(this.resultDetailOriginal, (item) => _.isEqual(item.resourceId, map.resourceId));
      if (map.resourceId !== ResourcesIds.totalSets) {
        map.homeValue = this.match.isScoreDirect ? "" : originalResult.homeValue;
        map.awayValue = this.match.isScoreDirect ? "" : originalResult.awayValue;
      } else {
        map.homeValue = originalResult.homeValue;
        map.awayValue = originalResult.awayValue;
      }
    });
    this.checkConsistent();
    this.verificationService.getClassWithScore([this.totalSet], this.match);
  }

  private getBetStatus(isUnCal: boolean) {
    const betStatus: string[] = [];
    if (!this.match.isScoreDirect && !isUnCal) {
      const submittedSets = this.match.resultDetails.filter((map) =>
        map.resourceId !== ResourcesIds.totalPoints && map.resourceId !== ResourcesIds.totalSets);
      submittedSets.forEach((map) => {
        betStatus.push(`${Number(map.homeValue)}-${Number(map.awayValue)}`);
      });
    }

    return betStatus.join(',');
  }

  public onResettleCheckboxChange(isChecked: boolean) {
    this.isReSettledTickets = isChecked;
  }

  public copyScore() {
    this.toastrService.clear();
    const errorMessage = this.verificationService.verifyCopyScoreNew(this.providerResultDetails, this.totalSet);
    if (_.isEmpty(errorMessage)) {
      const message = Language.confirmMessageCopySBOScore.replace("'provider_name'", this.externalSourceName);
      this.confirmDialogMessage.message = message;
      this.messageBoxService.confirm(this.confirmDialogMessage, () => {
        _.forEach(this.resultDetails, resultDetail => {
          const providerResult = this.providerResultDetails.find(p => resultDetail.resourceId === p.resourceId);
          if(providerResult) {
            resultDetail.homeValue = providerResult.homeValue;
            resultDetail.awayValue = providerResult.awayValue;
          }
        })
        this.checkConsistentTotalSet();
      });
    } else {
      this.toastrService.error(errorMessage);
    }
  }

  private checkConsistentTotalSet() {
    const childMatchRelated = _.find(this.match.childMatches, item => item.relatedResourceId === ResourcesIds.totalSets);
    childMatchRelated.isNotConsistent = this.verificationService.isNotConsistent(this.resultDetails, childMatchRelated);
  }

  public collapseChildMatch() {
    this.collapse = !this.collapse;
  }

  private checkConsistent() {
    this.match.childMatches.forEach(item => item.isNotConsistent = this.verificationService.isNotConsistent(this.resultDetails, item));
  }

  public getClass(child: ChildMatch) {
    if (child.isNotConsistent) {
      return "not-consistent";
    } else {
      return child.resultStatusId === ResultStatusId.RunningThree ||
        (child.confirmFT > 0 && !_.isNil(child.betStatus) && !_.isEmpty(child.betStatus)) ? "consistent" : "";
    }
  }

  public getConfirmedBackground(total: ResultDetail, isFinal: boolean) {
    return isFinal
      && this.verificationService.isScoreConfirmed(this.matchDetail, this.totalSetOriginal)
      && total.settlementStatusId === SettlementStatusId.Running ? "bg-result-confirmed" : "";
  }

  public getMismatchedBackground(total: ResultDetail, isFinal: boolean) {
    return  total.isScoreMismatched ? "mismatched" : "";
  }
}
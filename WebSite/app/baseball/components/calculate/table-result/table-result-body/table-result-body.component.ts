import { FormsModule } from '@angular/forms';
import { Component, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceNamePipe } from '../../../../pipes/resource-name.pipe';
import { ResultDetail } from '../../../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { ResultRowStateService } from '../../../../services/result-row-state.service';
import { VerificationBaseService } from '../../../../../core/services/verification-base.service';
import { SettlementStatusId, ResourceIds } from '../../../../../shared/constants';
import { NotifyService } from '../../../../services/notify.service';
import { ResultState } from '../../../../models/result-state.model';
import { ResultDetailBaseBall } from '../../../../models/result-detail.model';
import { ResultByTeamNamePipe } from "../../../../../shared/pipes/result-by-team-name.pipe";
import { CalculateStorage } from '../../../../services/calculate/calculate.storage';
import { CalculateService } from '../../../../services/calculate/calculate.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OnlyIntegerDirective } from '../../../../../shared/directives';

@Component({
  selector: 'tbody[table-result-body]',
  standalone: true,
  imports: [CommonModule, FormsModule, ResourceNamePipe, ResultByTeamNamePipe,MatTooltipModule,OnlyIntegerDirective],
  templateUrl: './table-result-body.component.html',
})
export class TableResultBodyComponent implements OnInit {
  readonly #storage = inject(CalculateStorage);
  readonly #resultRowState = inject(ResultRowStateService)
  readonly #verificationService = inject(VerificationBaseService);
  readonly #notifyService = inject(NotifyService);
  readonly #calculateService = inject(CalculateService);
  innings = this.#storage.getResultDetails();
  permission = this.#storage.getPermission();
  matchDetail = this.#storage.getMatchDetail();
  isLeader = this.#storage.isLeader();
  isMatchSeries = this.#storage.isMatchSeries();
  extraInningId = ResourceIds.extraInning;
  fullTimeId = ResourceIds.fullTime;
  maxProviderCol = this.#storage.maxProviderCol;
  tableIsReady = false;
  homeName = this.matchDetail.homeName;
  awayName = this.matchDetail.awayName;

  constructor() {
    effect(() => {
      this.changeState();
      this.tableIsReady = true;
    });
  }
  ngOnInit(): void {
    this.resetHomeAwayForMatch();
    this.autoFillScoreOnLoad();
    this.autoFillOutsideScoreOnLoad();
  }

  private resetHomeAwayForMatch() {
    _.forEach(this.innings, (inning) => {
      if (this.isRefundMatch(inning)) {
        inning.homeValue = "";
        inning.awayValue = "";
      }
    });
  }

  private isRefundMatch(inning: ResultDetailBaseBall) {
    return _.isEqual(inning.resourceId, ResourceIds.fullTime) 
          && _.includes([SettlementStatusId.RefundSettleDetermined, SettlementStatusId.Refund], inning.settlementStatusId);
  }

  checkInningIsMatched(map: ResultDetail) {
    this.#notifyService.clearError();
    map.isScoreMismatched = this.#verificationService.isMismatchedWarning(map);
    this.changeScore();
  }

  private changeScore() {
    const innings = this.#storage.getAllInnings()
      .filter((item) => item.resourceId !== ResourceIds.totalHits)
      .filter((item) => this.#verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));

    if (!this.#storage.isScoreDirect()) {
      this.#calculateService.sumTotalScores(innings, this.#storage.fulltimeResult,!this.#storage.isMatchSeries());
    }

    this.#storage.fulltimeResult.isScoreMismatched = this.#verificationService.isMismatchedWarning(this.#storage.fulltimeResult);
    this.changeState();
  }

  verifyAndAutoFillScore(map: ResultDetailBaseBall, isOnLoad = false) {
    map.isScoreMismatched = this.#verificationService.isMismatchedWarning(map);
    const originalGame = _.cloneDeep(map);
    this.#verificationService.autoFillScore(map);
    if (isOnLoad) {
      if (this.#storage.fulltimeResult.settlementStatusId === SettlementStatusId.Calculated
        || this.#storage.fulltimeResult.settlementStatusId === SettlementStatusId.Refund
        || this.#storage.fulltimeResult.settlementStatusId === SettlementStatusId.RefundSettleDetermined) {
        this.#storage.fulltimeResult.isScoreMismatched = this.#verificationService.isMismatchedWarning(this.#storage.fulltimeResult);
      } else {
        this.adjustFinalScoreOnChange(isOnLoad);
      }
    } else {
      map.isScoreMismatched = this.#verificationService.isMismatchedWarning(map);
      if (!_.isEqual(originalGame.homeValue, map.homeValue) || !_.isEqual(originalGame.awayValue, map.awayValue)) {
        this.adjustFinalScoreOnChange();
      }
    }

    map.state = new ResultState(this.#resultRowState, map);
  }

  autoFillScoreOnLoad() {
    const innings = this.#storage.getAllInnings();
    if (innings.length > 0) {
      _.forEach(innings, (map) => {
        map.isScoreMismatched = this.#verificationService.isMismatchedWarning(map);
        if (this.statusNotRefunded(map.settlementStatusId)) {
          this.verifyAndAutoFillScore(map, true);
        }
      });
    } else {
      this.adjustFinalScoreOnChange(true);
    }
  }

  autoFillOutsideScoreOnLoad() {
    const sourceIds = this.#storage.fulltimeResult.externalScores.map((score) => score.sourceId);
    _.forEach(sourceIds, (sourceId) => {      
      this.updateOutsideScore(sourceId, true);
    });
  }

  updateOutsideScore(sourceId: number, IsOnLoad = false) {
    const externalResults = this.#storage.getAllInnings()
      .filter((item) => item.resourceId !== ResourceIds.totalHits)
      .map((item) => item.externalScores.find(e => e.sourceId === sourceId));
   
    const outsideResults = externalResults.filter(e => this.#verificationService.isExistedHomeAwayScore(e.homeValue, e.awayValue));

    const totalGameOutside = _.find(this.#storage.fulltimeResult.externalScores.slice(this.maxProviderCol + 1), (score) => score.sourceId === sourceId);

    if (totalGameOutside && (IsOnLoad &&
      !this.#verificationService.isExistedHomeAwayScore(totalGameOutside.homeValue, totalGameOutside.awayValue))
      || (!IsOnLoad && !this.#storage.isScoreDirect())) {
      this.#calculateService.sumTotalScores(outsideResults, totalGameOutside, !this.#storage.isMatchSeries());
      this.verifyAndAutoFillScore(this.#storage.fulltimeResult, true);
    }
  }

  selectedOnLastMap(inning: ResultDetailBaseBall, checked: boolean) {
    !this.#storage.isScoreDirect() &&  this.#storage.getExtraInning() && (this.#storage.getExtraInning().checked = checked);
    const allInnings = this.#storage.getResultDetails().filter(x => x.resourceId !== ResourceIds.totalHits);
    const newFullTimeScore = this.#verificationService.getNewFinalResource(allInnings, ResourceIds.fullTime, !this.#storage.isMatchSeries());
    const confirmMessage = this.#verificationService.verifyFinalResource(allInnings,
      ResourceIds.fullTime, newFullTimeScore,!this.#storage.isMatchSeries() ? "Match" : "Series");
    if (!_.isEmpty(confirmMessage) && !this.#storage.isScoreDirect()) {
      this.#notifyService.confirm(confirmMessage, () => {
        this.#verificationService.changeToNewFinalResource(this.#storage.getFullTime(), newFullTimeScore);
        this.changeState();
      });
    }
    this.selectedOnMap(inning);
  }

  selectedOnMap(inning: ResultDetailBaseBall) {
    this.#storage.onChange();
    inning.state = new ResultState(this.#resultRowState, inning);

    if (inning.resourceId === ResourceIds.extraInning) {
      this.#storage.fulltimeResult.state = new ResultState(this.#resultRowState, this.#storage.fulltimeResult);
    }
  }

  private adjustFinalScoreOnChange(isOnload = false) {
    this.changeScore();
    if (_.isEmpty(this.#storage.fulltimeResult.homeValue) && _.isEmpty(this.#storage.fulltimeResult.awayValue)
      && ((isOnload && this.statusNotRefunded(this.#storage.fulltimeResult.settlementStatusId)) || !isOnload)) {
      this.#verificationService.autoFillScore(this.#storage.fulltimeResult);
    }
  }

  private statusNotRefunded(settlementStatusId: number) {
    return (
      settlementStatusId !== SettlementStatusId.Refund &&
      settlementStatusId !== SettlementStatusId.RefundSettleDetermined
    );
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  private changeState() {
    this.innings.forEach((inning) => {
      inning.state = new ResultState(this.#resultRowState, inning);
    });
  }
}

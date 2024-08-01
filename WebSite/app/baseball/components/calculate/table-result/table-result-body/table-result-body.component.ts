import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, effect, OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { CalculateStore } from '../../../../services/calculate/calculate.store';
import { CommonModule } from '@angular/common';
import { ResourceNamePipe } from '../../../../pipes/resource-name.pipe';
import { ExternalResultDetail, ResultDetail } from '../../../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { ResultRowStateService } from '../../../../services/result-row-state.service';
import { VerificationBaseService } from '../../../../../core/services/verification-base.service';
import { ResourceIds } from '../../../../constants/resource-id.constant';
import { SettlementStatusId } from '../../../../../shared/constants';
import { NotifyService } from '../../../../services/notify.service';
import { ResultState } from '../../../../models/result-state.model';
import { ResultDetailBaseBall } from '../../../../models/result-detail.model';
import { ResultByTeamNamePipe } from "../../../../../shared/pipes/result-by-team-name.pipe";

@Component({
  selector: 'tbody[table-result-body]',
  standalone: true,
  imports: [CommonModule, FormsModule, ResourceNamePipe, ResultByTeamNamePipe],
  templateUrl: './table-result-body.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableResultBodyComponent implements OnInit{
  private store = inject(CalculateStore);
  private resultRowState = inject(ResultRowStateService)
  private verificationService = inject(VerificationBaseService);
  private notifyService = inject(NotifyService);
  private changeRef = inject(ChangeDetectorRef);
  innings = this.store.getResultDetails();
  permission = this.store.getPermission();
  matchDetail = this.store.getMatchDetail();
  isLeader = this.store.isLeader();
  extraInningId = ResourceIds.extraInning;
  fullTimeId = ResourceIds.fullTime;
  maxProviderCol = this.store.maxProviderCol;
  tableIsReady = false;
  #maxTeamName = 15;
  homeName = this.getTeamName(this.matchDetail.homeName);
  awayName = this.getTeamName(this.matchDetail.awayName);

  constructor(){
    effect(() => {
      this.innings.forEach((inning) => {
        inning.resultState = new ResultState(this.resultRowState, inning);
        inning.checked = inning.resourceId === ResourceIds.fullTime ? this.store.isScoreDirect() : false;
      });
      this.tableIsReady = true;
      this.changeRef.markForCheck();
    });
  }
  ngOnInit(): void {
    this.autoFillScoreOnLoad();
  }

  checkInningIsMatched(map: ResultDetail) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    this.changeScore();
  }

  private changeScore() {
    const innings = this.store.getAllInnings().filter((item) => this.verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));

    if (!this.store.isScoreDirect()) {
      this.verificationService.sumTotalScores(innings, ResourceIds.InningOne, this.store.fulltimeResult);
    }

    this.store.fulltimeResult.isScoreMismatched = this.verificationService.isMismatchedWarning(this.store.fulltimeResult);
  }

  verifyAndAutoFillScore(map: ResultDetailBaseBall, isOnLoad = false) {
    map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    const originalGame = _.cloneDeep(map);
    this.verificationService.autoFillScore(map);
    if (isOnLoad) {
      if (this.store.fulltimeResult.settlementStatusId === SettlementStatusId.Calculated
        || this.store.fulltimeResult.settlementStatusId === SettlementStatusId.Refund) {
        this.store.fulltimeResult.isScoreMismatched = this.verificationService.isMismatchedWarning(this.store.fulltimeResult);
      } else {
        this.adjustFinalScoreOnChange(isOnLoad);
      }
    } else {
      map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
      if (!_.isEqual(originalGame.homeValue, map.homeValue) || !_.isEqual(originalGame.awayValue, map.awayValue)) {
        this.adjustFinalScoreOnChange();
      }
    }

    map.resultState = new ResultState(this.resultRowState, map);
  }

  autoFillScoreOnLoad() {
    const innings = this.store.getAllInnings();
    if (innings.length > 0) {
      _.forEach(innings, (map) => {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
        if (map.settlementStatusId !== SettlementStatusId.Refund) {
          this.verifyAndAutoFillScore(map, true);
        }
      });
    } else {
      this.adjustFinalScoreOnChange(true);
    }
  }

  updateOutsideScore(sourceId: number, inning: ResultDetail, IsOnLoad = false) {
    const externalResults = this.store.getAllInnings().map((item) => item.externalScores.find(e => e.sourceId === sourceId));
    const outsideResults = externalResults.filter(e => this.verificationService.isExistedHomeAwayScore(e.homeValue, e.awayValue));

    const totalGameOutside = _.find(this.store.fulltimeResult.externalScores.slice(3), (score) => score.sourceId === sourceId);

    if (totalGameOutside && (IsOnLoad &&
      !this.verificationService.isExistedHomeAwayScore(totalGameOutside.homeValue, totalGameOutside.awayValue))
      || (!IsOnLoad && !this.store.isScoreDirect())) {
      this.verificationService.sumTotalScores(outsideResults, ResourceIds.InningOne, totalGameOutside);
      this.verifyAndAutoFillScore(this.store.fulltimeResult, true);
    }
  }

  selectedOnLastMap(inning: ResultDetailBaseBall) {
    this.store.getFullTime().checked = true;
    const allInnings = this.store.getAllInnings();
    const newFullTimeScore = this.verificationService.getNewFinalResource(allInnings, ResourceIds.fullTime, false);
    const confirmMessage = this.verificationService.verifyFinalResource(allInnings,
      ResourceIds.fullTime, newFullTimeScore, "Match");
    if (!_.isEmpty(confirmMessage) && !this.store.isScoreDirect()) {
      this.notifyService.confirm(confirmMessage, () => {
        this.verificationService.changeToNewFinalResource(this.store.getFullTime(), newFullTimeScore);
      });
    }
    this.selectedOnMap(inning);

  }

  selectedOnMap(inning: ResultDetailBaseBall) {
    this.store.onChange();
    inning.resultState = new ResultState(this.resultRowState, inning);

    if(inning.resourceId === ResourceIds.extraInning) {
      this.store.fulltimeResult.resultState = new ResultState(this.resultRowState, this.store.fulltimeResult);
    }
  }

  private adjustFinalScoreOnChange(isOnload = false) {
    this.changeScore();

    if ((_.isEmpty(this.store.fulltimeResult.homeValue) && _.isEmpty(this.store.fulltimeResult.awayValue))
      && (isOnload && this.store.fulltimeResult.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
      this.verificationService.autoFillScore(this.store.fulltimeResult);
    }
  }

  getTeamName(teamName: string) {
    return teamName.length > this.#maxTeamName ? `${teamName.substring(0, this.#maxTeamName)}...` : teamName;
  }
}

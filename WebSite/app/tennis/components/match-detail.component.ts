import { Component, OnInit, Input } from '@angular/core';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { Match } from '../models';
import { TennisService } from '../services';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { ResultStatus, SettlementStatusId } from '../../shared/constants';

@Component({
  selector: 'match-detail',
  templateUrl: './match-detail.component.html',
})
export class MatchDetailComponent implements OnInit {
  @Input() public match: Match;
  public resultDetail: ResultDetail[];
  public matchDetail: MatchDetail;

  constructor(public readonly tennisService: TennisService,
              private readonly intervalBackgroundPipe: IntervalBackgroundPipe) { }

  public ngOnInit() {
    this.matchDetail = this.match.matchDetail;
    if (this.match) {
      this.resultDetail = this.tennisService.getResultDetail(this.match.resultDetails);
      this.resultDetail.forEach(item => {
        item.className = this.getClass(item);
        item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
      });
    }
  }

  public getClass(resultDetail: ResultDetail) {
    let className = '';

    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalSets)) {
      className += 'final-score ';
    } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalGames)) {
      className += 'total-point ';
    }

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }
}
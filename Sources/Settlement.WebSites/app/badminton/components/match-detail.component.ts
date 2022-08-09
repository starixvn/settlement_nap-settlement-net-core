import { Component, OnInit, Input } from '@angular/core';
import { Match } from '../models';
import { BadmintonService } from '../services';
import { ResourcesIds } from '../constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { SettlementStatusId } from '../../shared/constants';

@Component({
  selector: 'match-detail',
  templateUrl: './match-detail.component.html',
})
export class MatchDetailComponent implements OnInit {
  @Input() public match: Match;
  @Input() public isEarlySettlement: boolean;
  public resultDetail: ResultDetail[];
  public matchDetail: MatchDetail;

  constructor(private readonly badmintonService: BadmintonService,
              private readonly intervalBackgroundPipe: IntervalBackgroundPipe) { }

  public ngOnInit() {
    this.matchDetail = this.match.matchDetail;
    if (this.match) {
      this.resultDetail = this.badmintonService.getResultDetail(this.match.resultDetails);
      this.resultDetail.forEach(item => {
        item.className = this.getClass(item);
        item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
      });
    }
  }

  public getClass(resultDetail: ResultDetail) {
    let className = '';
    if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalGames)) {
      className += 'final-score ';
    } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.totalPoints)) {
      className += 'total-point ';
    }

    return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
  }

  public refresh(){
    window.location.reload();
  }
}
import { Component, Input, OnInit } from '@angular/core';
import { MatchDetail } from './model/match.model';

@Component({
  selector: 'refund-match-detail',
  templateUrl: './refund-match-detail.component.html'
})
export class RefundMatchDetailComponent implements OnInit {
  @Input() public matchDetail: MatchDetail;
  public halfTimeHomeValueOriginal: number;
  public halfTimeAwayValueOriginal: number;
  public finalTimeHomeValueOriginal: number;
  public finalTimeAwayValueOriginal: number;
  constructor() { }
  ngOnInit(): void {
    this.halfTimeAwayValueOriginal = this.matchDetail.halfTimeAwayScore;
    this.halfTimeHomeValueOriginal = this.matchDetail.halfTimeHomeScore;
    this.finalTimeAwayValueOriginal = this.matchDetail.finalAwayScore;
    this.finalTimeHomeValueOriginal = this.matchDetail.finalHomeScore;
  }
}

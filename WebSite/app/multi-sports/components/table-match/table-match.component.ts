
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { MultiSportsStore } from '../../services/multi-sports.store';
import { RefreshMatchService, SportMatchService } from '../../services';
import { MultiSport, SportMatch } from '../../models';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, interval, map, takeUntil, Observable, BehaviorSubject } from 'rxjs';
import { LeagueComponent } from './league/league.component';
import { MatchComponent } from './match/match.component';
import { DynamicHeightDirective } from '../../../shared/directives';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'table-match',
  standalone: true,
  imports: [CommonModule, LeagueComponent, MatchComponent, DynamicHeightDirective, ScrollingModule],
  templateUrl: './table-match.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableMatchComponent implements OnInit {
  public sports: SportMatch[];
  private subscriber: Subscription;
  private readonly period = 6000;
  public intervalTimer = interval(this.period);
  ngUnsubscribe = new Subject();
  constructor(public store: MultiSportsStore,
    private readonly cd: ChangeDetectorRef,
    private readonly refreshMatchesService: RefreshMatchService) {
  }

  ngOnInit(): void {
    this.store.state$.pipe(
      takeUntil(this.ngUnsubscribe),
      map(state => state.sports),
    ).subscribe(data => {
      this.sports = data;

      this.cd.markForCheck();
    });
    this.refreshMatches();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(1);
    this.ngUnsubscribe.complete();
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  collapseSport(sport: SportMatch) {
    sport.collapse = !sport.collapse;
  }


  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (this.store.enableRefresh) {
        this.refreshMatchesService.refreshMatches(this.sports, this.store.request);
        this.cd.markForCheck();
      }
    });
  }
}

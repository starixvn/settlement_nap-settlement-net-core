
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MultiSportsStore } from '../../services/multi-sports.store';
import { RefreshMatchService } from '../../services';
import { SportMatch } from '../../models';
import * as _ from 'lodash';
import { CommonModule } from '@angular/common';
import { Subject, map, takeUntil } from 'rxjs';
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
  private readonly period = 4000;
  ngUnsubscribe = new Subject();
  refreshMatchesService = inject(RefreshMatchService);
  changeDetectorRef = inject(ChangeDetectorRef);
  store = inject(MultiSportsStore);

  ngOnInit() {
    this.store.state$.pipe(
      takeUntil(this.ngUnsubscribe),
      map(state => state.sports),
    ).subscribe(data => {
      this.sports = data;

      this.changeDetectorRef.markForCheck();
    });
    this.refreshMatches();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(1);
    this.ngUnsubscribe.complete();
  }

  collapseSport(sport: SportMatch) {
    sport.collapse = !sport.collapse;
  }

  private async refreshMatches() {
    let isChecking = false;
    while (true) {
      if (!isChecking) {
        isChecking = true;
        if (this.store.enableRefresh) {
          await this.refreshMatchesService.refreshMatches(this.sports, this.store.request);
          this.changeDetectorRef.markForCheck();
        }

        isChecking = false;
      }

      await new Promise((resolve) => setTimeout(resolve, this.period));
    }
  }
}

import { ChangeDetectionStrategy, Component, inject, input, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AioService } from '../../../services';
import { ManageLeagueComponent } from '../../../../score-source-setting/components';
import { LeagueOutsideSource } from '../../../../score-source-setting/models';
import { MatchDetail, Permission, ResultDetail } from '../../../models/sportsbook-sop';
import { CommonModule, DatePipe } from '@angular/common';
import { ScoreBySettlementPipe } from '../../../pipes/score-by-settlement.pipe';

@Component({
  selector: 'match-detail',
  standalone: true,
  imports: [DatePipe, CommonModule, ScoreBySettlementPipe],
  templateUrl: './match-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchDetailComponent {
  matchDetail = input<MatchDetail>();
  permission = input<Permission>();
  resultDetail = input<ResultDetail[]>([]);
  #aioService = inject(AioService);
  #dialog = inject(MatDialog);

  public manageOutSideSourcePopup() {
    this.#aioService.getLeagueSources(this.matchDetail().leagueId).subscribe((source: LeagueOutsideSource) => {
        source.leagueName = this.matchDetail().leagueName;
        source.leagueId = this.matchDetail().leagueId;
        source.sportName = this.matchDetail().sportName;
        this.#dialog.closeAll();
        this.#dialog.open(ManageLeagueComponent, {
            width: '500px',
            data: source
        }).afterClosed().subscribe((result) => {
            if (result && result.event === 'Save') {
                window.location.reload();
            }
        });
    });
}
}
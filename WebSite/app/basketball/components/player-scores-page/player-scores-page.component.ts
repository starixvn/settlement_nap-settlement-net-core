import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { TeamFilterPipe } from './team-filter.pipe';
import { MatchHeaderComponent } from './match-header/match-header.component';
import { PlayerScoresService } from './player-scores.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TeamSectionComponent } from './team-section/team-section.component';
import { PlayerScore, Player } from './models';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { ModalDialogMessage, ResultSettingQuery } from '../../../shared/models';
import { Match } from '../../models';
import { Language } from '../../../shared/language.native';
import { ResultSettingType } from '../../../shared/constants';
import { MatchDetail } from '../../../shared/models/sportsbook-sop';



@Component({
  selector: 'player-scores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, MatDialogModule, ToastContainerDirective, TeamFilterPipe, MatchHeaderComponent, TeamSectionComponent],
  templateUrl: './player-scores-page.component.html',
  styleUrl: './player-scores-page.component.css'
})
export class PlayerScoresPageComponent implements OnInit {

  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;

  private readonly dialogRef = inject(MatDialogRef<PlayerScoresPageComponent>);
  private readonly messageBoxService = inject(MessageBoxService);
  private readonly aioService = inject(AioService);
  private readonly toastService = inject(ToastrService);
  private readonly blockUiService = inject(BlockUIService);
  private readonly playerScoresMappingService = inject(PlayerScoresService);
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

  matchDetail: MatchDetail = new MatchDetail();
  blockUI = false;
  players: Player[] = [];
  isHomeTeamCollapsed = false;
  isAwayTeamCollapsed = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { matchId: number }) { }

  ngOnInit(): void {
    this.blockUiService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastService.overlayContainer = this.toastContainer;
    this.loadData();
  }

  public close() {
    this.dialogRef.close();
  }

  loadData() {
    this.blockUiService.startBlock(true);
    this.aioService.getResultsObservable<Match>({
      matchId: this.data.matchId
    }).subscribe((match) => {
      this.matchDetail = match.matchDetail;
      console.log(this.playerScoresMappingService.mapMatchToPlayerScores(match));
      // this.players = this.playerScoresMappingService.mapMatchToPlayerScores(match);
      this.blockUiService.stopBlock();
    });
  }

  holdResult(playerId: number) {
    this.toastService.clear();
    this.holdOrUnholdResult(playerId, true);
  }

  unholdResult(playerId: number) {
    this.toastService.clear();
    this.holdOrUnholdResult(playerId, false);
  }

  async unconfirmResult(playerId: number) {
    this.toastService.clear();
    this.confirmOrUnconfirmResult(playerId, false);

  }

  confirmResult(playerId: number) {
    this.toastService.clear();
    this.confirmOrUnconfirmResult(playerId, true);
  }


  toggleHomeTeam(): void {
    this.isHomeTeamCollapsed = !this.isHomeTeamCollapsed;
  }

  toggleAwayTeam(): void {
    this.isAwayTeamCollapsed = !this.isAwayTeamCollapsed;
  }

  onCheckboxChange(event: { playerId: number, checked: boolean }) {
    this.players = this.playerScoresMappingService
      .updatePlayers(this.players, event.playerId, event.checked);
  }

  private confirmOrUnconfirmResult(playerId: number, isConfirm: boolean) {
    const checkedScores = this.playerScoresMappingService
      .getCheckedScoresForPlayer(this.players, playerId);

    if (_.isEmpty(checkedScores)) {
      this.toastService.error(Language.noResourceSelected);
      return;
    }

    if (checkedScores.some(x => _.isEmpty(x.value) || x.isCalculated || x.isRefunded)) {
      this.toastService.error(Language.NotSpecifyValidResults);
      return;
    }

    this.showConfirmationDialog(checkedScores, isConfirm);
  }

  private showConfirmationDialog(checkedScores: PlayerScore[], isConfirm: boolean): void {
    this.confirmationDialogMessage.message = Language.confirmResultConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
      const resultDetails = checkedScores.map(score => PlayerScore.toResultDetail(score));
      const data = {
        matchId: this.matchDetail.matchId,
        resultDetails: resultDetails,
        isConfirm: isConfirm
      };

      const result = await this.aioService.updateResultDetails(data);
      if (!result.isSuccessful) {
        this.toastService.error(result.errMsg);
        return;
      }

      this.loadData();
    });
  }

  private holdOrUnholdResult(playerId: number, isHold: boolean) {
    const resourceIds = this.playerScoresMappingService
      .getCheckedScoresForPlayer(this.players, playerId)
      .map(x => x.resourceId).join(',');

    if (_.isEmpty(resourceIds)) {
      this.toastService.error(Language.noResourceSelected);
      return;
    }

    this.confirmationDialogMessage.message = isHold
      ? Language.holdResultConfirmMessage
      : Language.unholdResultConfirmMessage;

    this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
      const query = new ResultSettingQuery(
        this.matchDetail.matchId,
        ResultSettingType.holdResult,
        isHold,
        resourceIds);

      await this.aioService.changeResultSetting(query);
      this.loadData();
    });
  }
}

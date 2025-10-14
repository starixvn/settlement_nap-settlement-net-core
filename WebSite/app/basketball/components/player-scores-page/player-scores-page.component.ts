import { Component, Inject, inject, OnInit, ViewChild } from '@angular/core';
import { MatchDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { ResultSettingType } from '../../../shared/constants';
import { Match } from '../../models';
import * as _ from 'lodash';
import { Player } from './models';
import { ModalDialogMessage, ResultSettingQuery } from '../../../shared/models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';
import { TeamFilterPipe } from './team-filter.pipe';
import { MatchHeaderComponent } from './match-header.component';
import { TeamSectionComponent } from './team-section.component';
import { UrlHelper } from '../../../helper/url-helper';
import { PlayerScoresMappingService } from './player-scores-mapping.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';



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
  readonly dialogRef = inject(MatDialogRef<PlayerScoresPageComponent>);

  private readonly messageBoxService = inject(MessageBoxService);
  private readonly aioService = inject(AioService);
  private readonly toastService = inject(ToastrService);
  private readonly blockUiService = inject(BlockUIService);
  private readonly playerScoresMappingService = inject(PlayerScoresMappingService);
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

  public close() {
    this.dialogRef.close();
  }

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

  loadData() {
    this.aioService.getResultsObservable<Match>({
      matchId: this.data.matchId
    }).subscribe((match) => {
      this.matchDetail = match.matchDetail;
      this.players = this.playerScoresMappingService.mapMatchToPlayerScores(match);
    });
  }


  holdResult(playerId: number) {
    this.toastService.clear();
    this.holdOrUnholdResult(playerId, true);
  }

  private holdOrUnholdResult(playerId: number, isHold: boolean) {
    const resourceIds = this.players
      .filter(x => x.playerId === playerId)
      .flatMap(x => x.scores)
      .filter(x => x && x.checked)
      .map(x => x.resourceId)
      .join(',');

    if (_.isEmpty(resourceIds)) {
      this.toastService.error(Language.noResourceSelected);
      return;
    }

    this.confirmationDialogMessage.message = isHold ? Language.holdResultConfirmMessage : Language.unholdResultConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
      const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult, isHold, resourceIds);
      await this.aioService.changeResultSetting(query)
    });
  }

  unholdResult(playerId: number) {
    this.toastService.clear();
    this.holdOrUnholdResult(playerId, false);
  }

  async unconfirmResult(playerId: number) {
    this.toastService.clear();
    
  }

  async confirmResult(playerId: number) {
    this.toastService.clear();
    const checkedScores = this.players
      .filter(x => x.playerId === playerId)
      .flatMap(x => x.scores)
      .filter(x => x && x.checked);
      
      if(_.isEmpty(checkedScores)) {
        this.toastService.error(Language.noResourceSelected);
        return;
      }
      
      this.confirmationDialogMessage.message = Language.confirmResultConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
        const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult, true, checkedScores.map(x => x.resourceId).join(','));
        await this.aioService.changeResultSetting(query)
      });
      
  }


  toggleHomeTeam(): void {
    this.isHomeTeamCollapsed = !this.isHomeTeamCollapsed;
  }

  toggleAwayTeam(): void {
    this.isAwayTeamCollapsed = !this.isAwayTeamCollapsed;
  }

  onCheckboxChange(playerId: number) {
    this.players = this.players.map(x => x.playerId === playerId ? { ...x, checked: !x.checked } : x);
  }
}

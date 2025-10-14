import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GeneralMatch, MatchDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AioService, BlockUIService, MessageBoxService } from '../../../shared/services';
import { BasketballApiKeys } from '../../constants';
import { ResultSettingType, SportType } from '../../../shared/constants';
import { Match } from '../../models';
import * as _ from 'lodash';
import { Player, PlayerScore, playerScoreType } from './models';
import { ModalDialogMessage, ResultSettingQuery } from '../../../shared/models';
import { OnlyIntegerDirective } from '../../../shared/directives/only-integer.directive.native';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';


@Component({
  selector: 'player-scores-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyIntegerDirective, ToastContainerDirective],
  templateUrl: './player-scores-page.component.html',
  styleUrl: './player-scores-page.component.css'
})
export class PlayerScoresPageComponent implements OnInit, SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective;

  private readonly messageBoxService = inject(MessageBoxService);
  private readonly aioService = inject(AioService);
  private readonly toastService = inject(ToastrService); 
  private readonly blockUiService = inject(BlockUIService);

  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

  getMatch(matchId: number): void {
    console.log(matchId);
  }

  matchDetail: MatchDetail = new MatchDetail();

  blockUI = false;
  players: Player[] = [];
  matchId: number = 0;



  ngOnInit(): void {
    this.blockUiService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    this.toastService.overlayContainer = this.toastContainer;
    this.loadData();
  }

  private loadData() {
    this.aioService.getResultsObservable<Match>({
      matchId: 83817665
    }).subscribe((match) => {
      this.matchDetail = match.matchDetail;
      const playerScores = match.resultDetails.map(x => PlayerScore.fromResultDetail(x));

      const playerScoresByPlayer = _.groupBy(playerScores, 'playerId');
      
      const players = _.map(playerScoresByPlayer, (scores, key) => {
        return ({
          playerId: +key,
          playerName: scores[0].playerName,
          teamId: scores[0].teamId,
          checked: false,
          scores: this.createFullScoreArray(scores),
        }) as Player;
      });
      
      this.players = players;
    });
  }

  private createFullScoreArray(existingScores: PlayerScore[]): PlayerScore[] {
    console.log(existingScores);
    const allScoreTypes: playerScoreType[] = ['points', 'threePointFG', 'rebounds', 'assists', 'blocks', 'steals'];
    const fullScores: PlayerScore[] = [];
  
    allScoreTypes.forEach(scoreType => {
      const existingScore = existingScores.find(score => score.key === scoreType);
      
      if (existingScore) {
        fullScores.push(existingScore);
      } else {
        fullScores.push(null);
      }
    });
  
    return fullScores;
  }

  async holdResult(playerId: number) {
    this.toastService.clear();
    const resourceIds = this.players
      .filter(x => x.playerId === playerId)
      .flatMap(x => x.scores)
      .filter(x => x && x.checked)
      .map(x => x.resourceId)
      .join(',');

    if (_.isEmpty(resourceIds)) {
      this.toastService.error('Error: no result selected.');
      return;
    }

    this.confirmationDialogMessage.message = Language.holdResultConfirmMessage;
    this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
      const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult, true, resourceIds);
      await this.aioService.changeResultSetting(query)
    });
  }

  async unholdResult(playerId: number) {
    const resourceIds = this.players
      .filter(x => x.playerId === playerId)
      .flatMap(x => x.scores)
      .filter(x => x.checked)
      .map(x => x.resourceId)
      .join(',');

    const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult, false, resourceIds);
    await this.aioService.changeResultSetting(query)
  }

  async unconfirmResult(playerId: number) {
  }

  async confirmResult(playerId: number) {
  }
}

import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { Player, PlayerScore, playerScoreType } from './models';
import { Match } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PlayerScoresService {
  
  mapMatchToPlayerScores(match: Match): Player[] {
    const playerScores = this.mapResultDetailsToPlayerScores(match.resultDetails);
    const players = this.groupPlayerScoresByPlayer(playerScores);
    
    return players;
  }

  private mapResultDetailsToPlayerScores(resultDetails: ResultDetail[]): PlayerScore[] {
    return resultDetails.map(resultDetail => PlayerScore.fromResultDetail(resultDetail));
  }

  private groupPlayerScoresByPlayer(playerScores: PlayerScore[]): Player[] {
    const playerScoresByPlayer = _.groupBy(playerScores, 'playerId');
    
    return _.map(playerScoresByPlayer, (scores, key) => {
      return {
        playerId: +key,
        playerName: scores[0].playerName,
        teamId: scores[0].teamId,
        checked: false,
        scores: this.createFullScoreArray(scores),
      } as Player;
    });
  }

  private createFullScoreArray(existingScores: PlayerScore[]): PlayerScore[] {
    const allScoreTypes: playerScoreType[] = [
      'points', 
      'threePointFG', 
      'rebounds', 
      'assists', 
      'blocks', 
      'steals'
    ];
    
    const fullScores: PlayerScore[] = [];

    allScoreTypes.forEach(scoreType => {
      const existingScore = existingScores.find(score => score.key === scoreType);
      fullScores.push(existingScore || null);
    });

    return fullScores;
  }


  updatePlayers(players: Player[], playerId: number, checked: boolean): Player[] {
    return players.map(player => 
      player.playerId === playerId 
        ? this.updatePlayerScores(player, checked)
        : player
    );
  }

  private updatePlayerScores(player: Player, checked: boolean): Player {
    return {
      ...player,
      scores: player.scores.map(score => 
        score ? { ...score, checked } : score
      )
    };
  }

  getCheckedScoresForPlayer(players: Player[], playerId: number): PlayerScore[] {
    return players
      .filter(player => player.playerId === playerId)
      .flatMap(player => player.scores)
      .filter(score => score && score.checked);
  }
}
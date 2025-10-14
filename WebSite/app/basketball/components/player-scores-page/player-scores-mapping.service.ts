import { Injectable } from '@angular/core';
import { Match, MatchDetail } from '../../models';
import * as _ from 'lodash';
import { PlayerScore, playerScoreType } from './models';
import { Player } from './models';

@Injectable({
  providedIn: 'root'
})
export class PlayerScoresMappingService {
  
  mapMatchToPlayerScores(match: Match): Player[] {
    const playerScores = this.mapResultDetailsToPlayerScores(match.resultDetails);
    const players = this.groupPlayerScoresByPlayer(playerScores);
    
    return players;
  }

  private mapResultDetailsToPlayerScores(resultDetails: any[]): PlayerScore[] {
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
}
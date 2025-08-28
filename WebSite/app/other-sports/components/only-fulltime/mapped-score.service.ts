import { Injectable } from '@angular/core';
import { MappedScore } from '../../models';

@Injectable()
export class MappedScoreService {
  public getMappedScore(homeValue: number, awayValue: number): MappedScore {
    // Check for home KO (homeValue 1-5, awayValue 0)
    if (this.isHomeKnockout(homeValue, awayValue)) {
      return this.createHomeKOScore(homeValue);
    }
    
    // Check for away KO (homeValue 0, awayValue 1-5)
    if (this.isAwayKnockout(homeValue, awayValue)) {
      return this.createAwayKOScore(awayValue);
    }
    
    // Check for home decision (homeValue 6, awayValue 0)
    if (this.isHomeDecision(homeValue, awayValue)) {
      return this.createHomeDecisionScore();
    }
    
    // Check for away decision (homeValue 0, awayValue 6)
    if (this.isAwayDecision(homeValue, awayValue)) {
      return this.createAwayDecisionScore();
    }
    
    // Check for draw decision (homeValue 6, awayValue 6)
    if (this.isDrawDecision(homeValue, awayValue)) {
      return this.createDrawDecisionScore();
    }
    
    return { 
      home: homeValue, 
      away: awayValue, 
      round: "" 
    };
  }

  private isHomeKnockout(homeValue: number, awayValue: number): boolean {
    return homeValue >= 1 && homeValue <= 5 && awayValue === 0;
  }

  private isAwayKnockout(homeValue: number, awayValue: number): boolean {
    return homeValue === 0 && awayValue >= 1 && awayValue <= 5;
  }

  private isHomeDecision(homeValue: number, awayValue: number): boolean {
    return homeValue === 6 && awayValue === 0;
  }

  private isAwayDecision(homeValue: number, awayValue: number): boolean {
    return homeValue === 0 && awayValue === 6;
  }

  private isDrawDecision(homeValue: number, awayValue: number): boolean {
    return homeValue === 6 && awayValue === 6;
  }

  private createHomeKOScore(round: number): MappedScore {
    return { home: 1, away: 0, round: round.toString() };
  }

  private createAwayKOScore(round: number): MappedScore {
    return { home: 0, away: 1, round: round.toString() };
  }

  private createHomeDecisionScore(): MappedScore {
    return { home: 5, away: 0, round: "" };
  }

  private createAwayDecisionScore(): MappedScore {
    return { home: 0, away: 5, round: "" };
  }

  private createDrawDecisionScore(): MappedScore {
    return { home: 5, away: 5, round: "" };
  }
}

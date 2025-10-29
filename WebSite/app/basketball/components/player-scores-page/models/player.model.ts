import { IPlayerScore } from "./player-score.model";



export interface Player {
  playerId: number;
  playerName: string;
  teamId: number;
  checked: boolean;
  scores: IPlayerScore[];
}


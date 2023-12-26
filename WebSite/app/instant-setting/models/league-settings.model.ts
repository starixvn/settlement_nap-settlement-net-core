export class LeagueSettings {
  leagueName: string;
  autoSetting: number;
  waitingTime: number;
  retryTime: number;
  mainResultSettings: ResultSettings;
  earlyResultSettings: ResultSettings;
}


export type ResultSettings = {
  hasTrader: boolean;
  minimumTrader: 1 | 2;
  primaryTrader: string;
  secondaryTrader: string;
}
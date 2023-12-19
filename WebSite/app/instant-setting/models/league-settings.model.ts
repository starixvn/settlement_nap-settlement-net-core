export type LeagueSettings = {
  LeagueName: string;
  AutoSetting: number;
  WaitingTime: number;
  RetryTime: number;
  MainResultSetting: ResultSettings;
  EarlyResultSetting: ResultSettings;
}


export type ResultSettings = {
  NeedTrader: boolean;
  MinimumTrader: 1 | 2;
  PrimaryTrader: string[];
  SecondaryTrader: string[];
}
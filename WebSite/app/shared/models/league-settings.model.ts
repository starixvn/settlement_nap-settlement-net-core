export class LeagueSettings {
  leagueId: number;
  leagueName: string;
  autoSetting: number;
  waitingTime: number;
  retryTime: number;
  mainResultSettings: ResultSettings;
  earlyResultSettings: ResultSettings;
  providers: ProviderSource[];
}

export type ProviderSource = {
  sourceId: number;
  sourceName: string;
  priority: number;
}
export type ResultSettings = {
  hasTrader: boolean;
  minimumProvider: 1 | 2;
  primaryProvider: string;
  secondaryProvider: string;
}
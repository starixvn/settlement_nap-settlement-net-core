export class AutoSettings {
  leagueId: number;
  leagueName: string;
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
  minimumProvider: 0 | 1 | 2;
  primaryProvider: string;
  secondaryProvider: string;
  inactiveProvider: string;
  waitingTime: number;
}
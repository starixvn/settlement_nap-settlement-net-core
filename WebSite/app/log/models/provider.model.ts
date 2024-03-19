export interface ProviderName {
  sourceId: number;
  sourceName: string;
}

export interface MatchDetail {
  sportName: string;
  leagueName: string;
  homeName: string;
  awayName: string;
  eventDate: string;
}

export interface ProviderResultLog {
  resourceId: number;
  resourceName: string;
  sourceName: string;
  createDate: string;
  resultValue: string;
  remark: string;
  action: string;
  autoPayoutStatus: number
}

export interface ProviderLog {
  matchDetail: MatchDetail;
  providerResultLog: ProviderResultLog[];
}

export class ProviderFilter {
  public matchId: number;
  public resourceIds = "";
  public resourceName = "";
  public sourceIds	: string;
  public latestRecord: boolean;
}


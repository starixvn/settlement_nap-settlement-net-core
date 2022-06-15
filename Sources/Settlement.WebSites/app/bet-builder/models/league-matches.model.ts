import { MatchDetail } from './match-detail.model';
export class LeagueMatches {
    public leagueId: number;
    public leagueName: string;
    public matches: MatchDetail[];
    public collapse = false;
    public isAutoSettingForLeague: boolean;
}

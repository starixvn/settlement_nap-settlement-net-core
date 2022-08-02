import { Match } from './match.model';
import { AutoSetting } from './auto-setting.model';

export class LeagueMatch {
    public leagueId: number;
    public name: string;
    public matches: Match[];
    public collapse = false;
    public isCheckedCalcMP: boolean;
    public disableCheckCalcMP: boolean;
    public isMergedParlay: boolean;
    public autoCalcSetting: AutoSetting;
}

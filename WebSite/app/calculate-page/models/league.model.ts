import { CalculationMatch } from "./calculation-match.model";
import { AutoSetting } from "../../shared/models";

export class League {
    public leagueId: number;
    public leagueName: string;
    public directWaitingTime: number;
    public instantWaitingTime: number;
    public autoCalcSetting: AutoSetting;
    public matches: CalculationMatch[];
}
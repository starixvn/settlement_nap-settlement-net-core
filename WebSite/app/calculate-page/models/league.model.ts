import { CalculationMatch } from "./calculation-match.model";
import { AutoSetting } from "../../shared/models";

export class League {
    public leagueId: number;
    public name: string;
    public directWaitingTime: number;
    public instantWaitingTime: number;
    public refundWaitingTime: number;
    public autoCalcSetting: AutoSetting;
    public enabledAutoRefund: boolean;
    public matches: CalculationMatch[];
}
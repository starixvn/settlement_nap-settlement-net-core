import { CalculationMatch } from "./calculation-match.model";

export class League {
    public leagueId: number;
    public leagueName: string;
    public matches: CalculationMatch[];
}
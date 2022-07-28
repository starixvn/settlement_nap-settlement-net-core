import { FastMarketResult } from "./fast-market-result.model";
import { ResultItemLabel } from "./result-item-label.model";
export class BetType {
    public betTypeId: number;
    public betTypeName: string;
    public checked: boolean;
    public collapsed: boolean;
    public resultName: ResultItemLabel;
    public fastMarketResults: FastMarketResult[];
}
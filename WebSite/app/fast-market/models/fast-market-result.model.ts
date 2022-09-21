import { ResultItem } from "./result-item.model";
import { ValidationItem } from "./validation-item.model";
import { EventResultItem } from "./event-result-item.model";
export class FastMarketResult {
    public betType: number;
    public position: number;
    public positionName: string;
    public result: number;
    public resultStatus: number;
    public resultStatusName: string;
    public ticketStatus: number;
    public ticketStatusName: string;
    public checked: boolean;
    public relatedEventCounter: boolean;
    public resultItem: ResultItem;
    public hasBackground: boolean;
    public radioResult: number;
    public isShow: boolean;
    public validationItem?: ValidationItem;
    public isResultMismatch: boolean;
    public eventResultItem: EventResultItem;
    public homeGoal: string;
    public awayGoal: string;
}
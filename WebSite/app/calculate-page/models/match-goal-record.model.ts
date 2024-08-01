import { Result } from "../../shared/models";

export class MatchCheckingResult extends Result {
    isExistHtFgNg: boolean;
    isExistFgNg: boolean;
    isExistFg: boolean;
    isExistHtFg: boolean;
    goalRecord: string;
    betStatus: string;
}
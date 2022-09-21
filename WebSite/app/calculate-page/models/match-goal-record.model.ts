import { Result } from "../../shared/models";

export class MatchGoalRecord extends Result {
    isExistHtFgNg: boolean;
    isExistFgNg: boolean;
    isExistFg: boolean;
    isExistHtFg: boolean;
    goalRecord: string;
    betStatus: string;
}
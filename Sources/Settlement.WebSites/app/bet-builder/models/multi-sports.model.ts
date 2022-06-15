import { SportLeagues } from "./sports-leagues.model";
import { Permission } from "./permission.model";
import { MatchWaitingRequest } from './match-waiting-request.model';
export class MultiSports {
    public request: MatchWaitingRequest;
    public permission: Permission;
    public sportLeagues: SportLeagues[];
}
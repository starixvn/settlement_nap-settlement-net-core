import { MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { Match } from "../models/match.model";


export interface Store {
  getMatchDetail() : MatchDetail;
  getResultChecked(): ResultDetail[];
  getActionSubmit(): string;
  isReSettledTickets(): boolean;
  setReSettledTickets(value: boolean): void;
  isLeader(): boolean;
  isScoreDirect(): boolean;
  getMatch(): Match;
  getApplyingHedgeMatch(): boolean;
  getOriginalResultDetails() : ResultDetail[]; 
}
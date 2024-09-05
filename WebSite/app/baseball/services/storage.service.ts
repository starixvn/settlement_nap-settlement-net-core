import { MatchDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { Match } from "../models/match.model";
import { ResultRowStateService } from "./result-row-state.service";


export interface Storage {
  getMatchDetail() : MatchDetail;
  getResultChecked(): ResultDetail[];
  getResultDetails(): ResultDetail[];
  getActionSubmit(): string;
  isReSettledTickets(): boolean;
  setReSettledTickets(value: boolean): void;
  isLeader(): boolean;
  isScoreDirect(): boolean;
  getMatch(): Match;
  getApplyingHedgeMatch(): boolean;
  getOriginalResultDetails() : ResultDetail[];
  setResultsCheckedState?: (service: ResultRowStateService) => void;
}
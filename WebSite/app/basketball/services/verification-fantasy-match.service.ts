import { Injectable } from "@angular/core";
import { FantasyRelatedMatch } from "../models/fantasy.model";
import {  chain, isEqual, isNil } from "lodash";
import { EventStatus } from "../../shared/constants/event-status.native";
import { ResourceIds } from "../../shared/constants/resource-id.native";
import { ResultStatusId } from "../../shared/constants/result-status-id.native";
import { ExternalResultDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from "../../shared/constants";
@Injectable()
export class VerificationFantasyMatchService {
  public isExistHoldMatch(relatedMatches: FantasyRelatedMatch[]) {
    return relatedMatches.some(
      (match) =>
        match.remark.isKeyHold ||
        match.remark.isMtdHold ||
        match.remark.isPending ||
        match.remark.isUndecided ||
        match.remark.isUnderSettle
    );
  }

  public isRelatedMatchesInsufficient(
    relatedTeams: string[],
    relatedMatches: FantasyRelatedMatch[]
  ) {
    return (
      relatedMatches.length * 2 < relatedTeams.length ||
      relatedTeams.some((teamId) => {
        const findMatch = relatedMatches.find(
          (match) =>
            isEqual(match.homeId.toString(), teamId) ||
            isEqual(match.awayId.toString(), teamId)
        );
        return isNil(findMatch);
      })
    );
  }

  public isExistNotCalculatedMatch(relatedMatches: FantasyRelatedMatch[]) {
    const isExistNotCalculatedMatch = relatedMatches.some(
      (match) =>
        !isEqual(
          match.eventStatus.toLowerCase(),
          EventStatus.completed.toLowerCase()
        ) || !this.isCaculatedFTMatch(match) || this.isMatchRefunded(match)
    );

    return isExistNotCalculatedMatch;
  }
  public isResultRelatedMatchesNotCalc(selectedResult: ResultDetail[], relatedMatches: FantasyRelatedMatch[]) {
    const selectedResourceIds = selectedResult.map(x => x.resourceId);
    const results = chain(relatedMatches).flatMap(x => x.results).value();
    const checkingResults = results.filter(x => selectedResourceIds.includes(x.resourceId));
    
    return checkingResults.some(x => x.settlementStatusId !== SettlementStatusId.Calculated);
  }

  private isMatchRefunded(match: FantasyRelatedMatch) {
    return match.betStatus && match.betStatus.toLowerCase().includes("refund");
  }

  private isCaculatedFTMatch(match: FantasyRelatedMatch) {
    return (match.results ?? []).some(
      (result) =>
        result.resourceId === ResourceIds.fullTime &&
        [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted].includes(
          result.resultStatusId
        )
    );
  }
}

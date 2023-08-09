import { Injectable } from "@angular/core";
import { FantasyRelatedMatch } from "../models/fantasy.model";
import {  isEqual, isNil } from "lodash";

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
}

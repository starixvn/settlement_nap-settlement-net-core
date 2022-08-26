import { Injectable } from "@angular/core";
import { Match } from "../models";
import { ResourcesIds } from "../constants";
import { SportType } from "../../shared/constants";
import * as _ from "lodash";

@Injectable()
export class GameTotalService {
    public getBetStatus(isUnCal: boolean, match: Match) {
        if (match.matchDetail.sportType !== SportType.volleyBall) {
            return null;
        }

        const betStatus: string[] = [];
        const refund = !match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalGames).checked
          && match.matchDetail.betStatus
          && _.includes(match.matchDetail.betStatus, 'Refund')
          ? 'Refund;' : '';
        if (!match.isScoreDirect) {
          const submitedSets = match.resultDetails.filter((map) =>
            map.resourceId !== ResourcesIds.totalPoints && map.resourceId !== ResourcesIds.totalGames);
          submitedSets.forEach((map) => {
            betStatus.push(map.checked
              ? !isUnCal ? `${Number(map.homeValue)}-${Number(map.awayValue)}` : `0-0`
              : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
          });
        }

        return refund + betStatus.join(',');
    }
}
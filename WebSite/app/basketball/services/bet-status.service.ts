import { Match } from "../models";
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { ResourcesIds } from "../constants";
import { ResultDetail } from "../../shared/models/sportsbook-sop";


@Injectable()
export class BetStatusService {

    public getBetStatus(isUncalc: boolean, match: Match, resultDetail: ResultDetail[]) {
        let betStatus: string[] = [];
        const finalChecked = match.resultDetails.find((map) => map.resourceId === ResourcesIds.finalScore).checked;
        const refund = !finalChecked
            && match.matchDetail.betStatus
            && _.includes(match.matchDetail.betStatus, 'Refund')
            ? 'Refund;' : '';
        const submittedQuarters = resultDetail.filter((map) =>
            map.resourceId !== ResourcesIds.htScore && map.resourceId !== ResourcesIds.finalScore);
        if (!match.isScoreDirect) {
            if (isUncalc) {
                betStatus = this.uncalculateBetStatus(submittedQuarters, finalChecked);
            } else {
                betStatus = this.calculateBetStatus(submittedQuarters, finalChecked);
            }
        }
        return refund + betStatus.join(',');
    }

    private calculateBetStatus(resultDetail: ResultDetail[], finalChecked: boolean) {
        const betStatus: string[] = [];
        resultDetail.forEach((map) => {
            betStatus.push(map.checked || (map.resourceId === ResourcesIds.ot && finalChecked)
                ? `${Number(map.homeValue)}-${Number(map.awayValue)}`
                : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
        });
        return betStatus;
    }

    private uncalculateBetStatus(resultDetail: ResultDetail[], finalChecked: boolean) {
        const betStatus: string[] = [];
        resultDetail.forEach((map) => {
            betStatus.push(map.checked || (map.resourceId === ResourcesIds.ot && finalChecked)
                ? `0-0`
                : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
        });
        return betStatus;
    }
}
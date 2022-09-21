import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { KickOffTime, ResourcesIds } from "../../constants";
import { MatchDetail } from "../../models";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { MessageBoxService } from "../../../shared/services";
import { RequestService } from "../../services/request.service";
import { Result } from "../../../shared/models";
import { CalculateAction, MatchStatus } from '../../../shared/constants';

@Injectable()
export class GameTotalMatchService {
    constructor(private readonly messageBoxService: MessageBoxService,
            private readonly requestService: RequestService){}

    public isReadyMatch(matchDetail: MatchDetail) {
        return this.isCompletedOrConfirmScore(matchDetail) || matchDetail.playTime >= KickOffTime.playTime;
    }

    private isCompletedOrConfirmScore(matchDetail: MatchDetail) {
        return matchDetail.confirmHT > 0 || matchDetail.confirmFT > 0
            || _.isEqual(matchDetail.eventStatus, MatchStatus.Completed);
    }

    public resetHomeAway(matchDetail: MatchDetail, resultDetails: ResultDetail[], isLeader: boolean) {
        resultDetails.forEach((map) => {
            const showScore = (isLeader || matchDetail.isCalculated)
                && !matchDetail.isCalRefund;
            map.homeValue = showScore ? map.homeValue : "";
            map.awayValue = showScore ? map.awayValue : "";
        });
    }

    public getResultDetail(matchDetail: MatchDetail, resultDetailList: ResultDetail[]): ResultDetail[] {
        const resultDetail = resultDetailList.filter((map) => map.resourceId.length < 5);
        const last = resultDetail.pop();
        const totalPoints = new ResultDetail();
        totalPoints.resourceId = ResourcesIds.totalPoints;
        totalPoints.ticketStatus = last.ticketStatus;
        if (!matchDetail.isCalRefund) {
            const games = resultDetail.filter((game) => game.resourceId !== ResourcesIds.totalSets
                && !_.isEmpty(game.homeValue) && !_.isEmpty(game.awayValue));

            if (games.length > 0) {
                totalPoints.homeValue = _.sumBy(games, (game) => Number(game.homeValue)).toString();
                totalPoints.awayValue = _.sumBy(games, (game) => Number(game.awayValue)).toString();
            }
        }

        resultDetail.push(totalPoints);
        resultDetail.push(last);
        return resultDetail;
    }

    public sumTotalPoints(resultDetails: ResultDetail[], totalPoints: ResultDetail) {
        const sets = this.getSetsOnly(resultDetails);
        if (resultDetails.length > 0) {
            totalPoints.homeValue = _.sumBy(sets, (set) => Number(set.homeValue)).toString();
            totalPoints.awayValue = _.sumBy(sets, (set) => Number(set.awayValue)).toString();
        } else {
            totalPoints.homeValue = "";
            totalPoints.awayValue = "";
        }
    }

    public computeTotalSets(resultDetails: ResultDetail[], totalSets: ResultDetail) {
        const sets = this.getSetsOnly(resultDetails);
        if (resultDetails.length > 0) {
            totalSets.homeValue = (_.countBy(sets, (set) => Number(set.homeValue) > Number(set.awayValue)).true ?? 0).toString();
            totalSets.awayValue = (_.countBy(sets, (set) => Number(set.homeValue) < Number(set.awayValue)).true ?? 0).toString();
        } else {
            totalSets.homeValue = "";
            totalSets.awayValue = "";
        }
    }

    private getSetsOnly(resultDetails: ResultDetail[]) {
        return resultDetails.filter(result => !_.isEqual(result.resourceId, ResourcesIds.totalPoints)
            && !_.isEqual(result.resourceId, ResourcesIds.totalSets));
    }

    public async refund(matchId: number, hedgeMatchId: number, totalSets: ResultDetail) {
        const params = {
            matchId,
            action: CalculateAction.refund,
            hedgeMatchId,
            finalHomeScore: Number(totalSets.homeValue),
            finalAwayScore: Number(totalSets.awayValue),
        };

        const result = await this.requestService.refund(params).toPromise() as Result;
        return this.getMessage(matchId, result);
    }

    public async refundParlay(matchId: number, hedgeMatchId: number) {
        const params = {
            matchId,
            action: CalculateAction.refund,
            hedgeMatchId,
        };

        const result = await this.requestService.refundParlay(params) .toPromise() as Result;
        return this.getMessage(matchId, result);
    }

    private getMessage(matchId: number, result: Result){
        if (result.isSuccessful) {
            this.messageBoxService.closePopup();
            return "";
        } else {
            return result.errMsg;
        }
    }
}
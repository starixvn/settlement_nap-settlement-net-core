import { Injectable } from "@angular/core";
import { Match, ResettleLogDetail } from "../models";
import * as _ from 'lodash';
import { SportType } from "../../shared/constants";
import { BetType, BetTypeWithNo, MappingValue, MappingValueWithBettype } from "../constants/bet-type";

@Injectable()
export class ResultOtherSportService {

    public getResultValue(match: Match, logDetail: ResettleLogDetail, homeName: string, awayName: string) {
        if (_.isEmpty(logDetail.homeValue) || _.includes(logDetail.action.toLocaleLowerCase(), 'refund')) {
            return '-';
        }

        if (!_.isEmpty(logDetail.homeValue) && !_.isEmpty(logDetail.awayValue)) {
            return `${logDetail.homeValue} - ${logDetail.awayValue}`;
        }

        if (_.isEqual(match.sportType, SportType.cricket) && _.includes(BetType.relatePlayer, logDetail.betType)) {
            return this.getPlayerName(match.playerNames, logDetail.otherInfo, logDetail.homeValue)
        }

        return this.getHomeValue(logDetail, homeName, awayName, match.sportType);
    }


    private getHomeValue(logDetail: ResettleLogDetail, homeName: string, awayName: string, sportType: number) {
        if (_.isEqual(logDetail.homeValue, 'H') || _.isEqual(logDetail.homeValue, 'A')) {
            return _.isEqual(logDetail.homeValue, 'H') ? homeName : awayName;
        }

        if(_.isEqual(logDetail.homeValue, 'N')){
            return _.includes(BetTypeWithNo[sportType], logDetail.betType)  ? 'No' : 'None';
        }

        if (MappingValue[logDetail.homeValue] !== undefined) {
            return MappingValue[logDetail.homeValue];
        }

        if (MappingValueWithBettype[`${logDetail.homeValue}-${logDetail.betType}`] !== undefined) {
            return MappingValueWithBettype[`${logDetail.homeValue}-${logDetail.betType}`];
        }

        return logDetail.homeValue;
    }

    private getPlayerName(players: string[], otherInfo: string, homeValue: string) {
        if(_.isNull(homeValue) || _.isNull(otherInfo)) {
            return "-";
        }
        
        const playerIds = otherInfo.split(',');
        const values = homeValue.split(',');
        const listPlayer = [];
        playerIds.forEach((value, index) => {
            const player = players.find(item => item.includes(value))?.split(',');
            if(_.isUndefined(player)){
                listPlayer.push(`${values[index]}`);
            } else {
                listPlayer.push(`${values[index]}(${player[1] ?? player[0] ?? ""})`);
            }
        });

        return listPlayer.join('; ');
    }
}
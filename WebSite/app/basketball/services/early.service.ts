import { Injectable } from '@angular/core';
import { EarlyBaseService } from '../../core/services/early-base.service';
import * as _ from 'lodash';
import { ResultDetail, GroupMap, MatchDetail } from '../../shared/models/sportsbook-sop';
import { ResultControlGroup } from '../constants/result-control-group.native';
import { Language } from '../../shared/language.native';
import { isEqual } from 'lodash';

@Injectable()
export class EarlyService extends EarlyBaseService {
    public getGroupMap(resultDetail: ResultDetail[], matchDetail: MatchDetail) {
        const list = _.uniqBy(resultDetail, (item) => item.groupName);
        const maps: GroupMap[] = [];

        list.forEach((item) => {
            const newResultDetail = resultDetail.filter((x) => x.groupName === item.groupName);
            maps.push(new GroupMap(item.groupName, newResultDetail));
        });
        maps.forEach(item => {
            item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult);
            item.groupName = this.ReplaceTeamName(item.groupName, matchDetail);
            item.resultDetail.forEach(i => {
                i.groupName = item.groupName;
            });
        });

        return maps;
    }


    private ReplaceTeamName(groupName: string, matchDetail: MatchDetail) {
        const teamNamePattern = /@teamName-(\d+)/;
        const match = groupName.match(teamNamePattern);

        if (match) {
            const teamId = parseInt(match[1]);
            return teamId === matchDetail.homeId
                ? groupName.replace(teamNamePattern, matchDetail.homeName)
                : groupName.replace(teamNamePattern, matchDetail.awayName);
        }

        return groupName;
    }


    getConfirmMessage(resultDetails: ResultDetail[], matchDetail: MatchDetail) {
        let confirmMessage = `${Language.CalculationConfirmMessageEarly}<br/>`;
        resultDetails.forEach((x: ResultDetail) => {
            let value: string;
            if (x.inputType === ResultControlGroup.teamSelection) {
                value = this.getHomeAwayValue(x, matchDetail);
            } else if (x.inputType === ResultControlGroup.textBox) {
                value = `${x.homeValue}`;
            } else if (x.inputType === ResultControlGroup.playerSelect) {
                value = this.getPlayerResultName(x);
            } else if (x.inputType === ResultControlGroup.yesNoNone) {
                value = this.getYesNoValue(x);
            } else {
                value = '';
            }
            confirmMessage += `${x.betTypeName}: ${value}<br/>`;
        });

        return confirmMessage;
    }   


    private getPlayerResultName(resultDetail: ResultDetail): string {
        return resultDetail.oddFlex.find(item => isEqual(item.info.playerId, resultDetail.homeValue))?.info.playerName ?? '';
    }

    private getHomeAwayValue(resultDetail: ResultDetail, matchDetail: MatchDetail): string {
        if (isEqual(resultDetail.homeValue, "H")) {
          return matchDetail.homeName;
        }
    
        if (isEqual(resultDetail.homeValue, "A")) {
          return matchDetail.awayName;
        }
    
        return "Neither";
    
      }
    
      private getYesNoValue(resultDetail: ResultDetail): string {
        if (isEqual(resultDetail.homeValue, "Y")) {
          return "Yes";
        }
    
        if (isEqual(resultDetail.homeValue, "N")) {
          return "No";
        }
    
        return "";
    
      }

}
import { Injectable } from '@angular/core';
import { EarlyBaseService } from '../../core/services/early-base.service';
import * as _ from 'lodash';
import { ResultDetail, GroupMap, MatchDetail } from '../../shared/models/sportsbook-sop';

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
}
import { Injectable } from '@angular/core';
import { EarlyBaseService } from '../../core/services/early-base.service';
import * as _ from 'lodash';
import { ResultDetail, GroupMap } from '../../shared/models/sportsbook-sop';

@Injectable()
export class EarlyService extends EarlyBaseService {
    public getGroupMap(resultDetail: ResultDetail[]) {
        const list = _.uniqBy(resultDetail, (item) => item.groupName);
        const maps: GroupMap[] = [];

        list.forEach((item) => {
            const newResultDetail = resultDetail.filter((x) => x.groupName === item.groupName);
            maps.push(new GroupMap(item.groupName, newResultDetail));
        });
        maps.forEach(item => {
            item.isHoldResult = item.resultDetail.every(i => i.resultSettingData.isHoldResult);
        });

        return maps;
    }
}
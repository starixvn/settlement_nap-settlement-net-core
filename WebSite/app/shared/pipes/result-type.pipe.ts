import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from '../models/sportsbook-sop';
import * as _ from 'lodash';

@Pipe({ name: 'resultType' })
export class ResultTypePipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string) {
        return resultDetails.filter((item) => {
            const hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.groupName);

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private isExistedItem(hasResultStatus: boolean, item: ResultDetail) {
        if (hasResultStatus) {
            item.isShow = true;
            return true;
        } else {
            item.isShow = false;
            return false;
        }
    }
}

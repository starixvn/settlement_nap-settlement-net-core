import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../models/sportsbook-sop';

@Pipe({ name: 'ticketStatus' })
export class TicketStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string[]) {
        return resultDetails.filter((item) => {
            let hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.ticketStatus);
            if(!_.includes(args, "Running;") && _.isEqual(item.ticketStatus, "Running") && args.length > 0) {
                hasResultStatus = false;
            }

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
import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../models/sportsbook-sop';
import { TicketStatusText } from '../constants';

@Pipe({ name: 'ticketStatus', standalone: false })
export class TicketStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string) {
        return resultDetails.filter((item) => {
            let hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.ticketStatus)
                || this.filterConfirmedTrader(args, item);
            if(!_.includes(args, "Running;") && _.isEqual(item.ticketStatus, "Running") && args.length > 0) {
                hasResultStatus = false;
            }

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private filterConfirmedTrader(args: string, resultDetail: ResultDetail) {
        if (_.includes(args, 'Confirmed by Trader')) {
            return resultDetail.resultStatusId === 3;       
        }
        return false;
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

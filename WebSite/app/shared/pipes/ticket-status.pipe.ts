import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { ResultDetail } from '../models/sportsbook-sop';
import { TicketStatusText } from '../constants';

@Pipe({ name: 'ticketStatus', standalone: false })
export class TicketStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string, allowNoTicketStatus: string[] = []) {
        return resultDetails.filter((item) => {
            let hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.ticketStatus)
                || this.filterConfirmedTrader(args, item);
         
            if(this.isRunning(args, item) || this.isNoTicket(args, item, allowNoTicketStatus)) {
                hasResultStatus = false;
            }

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private isRunning(args: string, item: ResultDetail) {
        return !_.isNil(args) && !_.includes(args, "Running;") && _.isEqual(item.ticketStatus, TicketStatusText.running) && args.length > 0;
    }

    private isNoTicket(args: string, item: ResultDetail, allowNoTicketStatus: string[]) {
        return _.includes(args, TicketStatusText.noTicket) && item.ticketStatus === TicketStatusText.noTicket && !_.includes(allowNoTicketStatus, item.betType);
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

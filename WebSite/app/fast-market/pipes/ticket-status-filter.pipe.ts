import { Pipe, PipeTransform } from '@angular/core';
import { FastMarketResult } from "../models";
import { FastMarketBetType } from '../constants';
import * as _ from 'lodash';
@Pipe({
    name: 'ticketStatusFilter',
})

export class TicketStatusPipe implements PipeTransform {
    public transform(fastMarketItem: FastMarketResult[], args: string[]) {
        return fastMarketItem.filter((item) => {
            const hasTicketStatus = _.isNil(args)
                || args.length === 0
                || _.indexOf(args, item.ticketStatus.toString()) !== -1;

            return this.isExistedItem(hasTicketStatus, item);
        });
    }

    private isExistedItem(hasTicketStatus: boolean, item: FastMarketResult) {
        if (hasTicketStatus || item.betType === FastMarketBetType.timeMachineOverUnder
            || item.betType === FastMarketBetType.timeMachineHDP) {
            item.isShow = true;
            return true;
        } else {
            item.isShow = false;
            return false;
        }
    }
}
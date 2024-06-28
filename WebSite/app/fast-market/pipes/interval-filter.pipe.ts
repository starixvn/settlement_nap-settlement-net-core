import { Pipe, PipeTransform } from '@angular/core';
import { FastMarketBetType } from '../constants';
import * as _ from 'lodash';
@Pipe({
    name: 'intervalFilter',
})

export class IntervalPipe implements PipeTransform {
    public transform(fastMarketItem: any, args: number[]) {
        return fastMarketItem.filter((item) => {
            const hasPosition = _.isNil(args)
                || args.length === 0
                || _.indexOf(args, item.position) !== -1;

            return this.isExistedItem(hasPosition, item);
        });
    }

    private isExistedItem(hasPosition: boolean, item: any) {
        if (hasPosition || item.betType === FastMarketBetType.timeMachineOverUnder
            || item.betType === FastMarketBetType.timeMachineHDP) {
            item.isShow = true;
            return true;
        } else {
            item.isShow = false;
            return false;
        }
    }
}
import { Pipe, PipeTransform } from '@angular/core';
import { FastMarketResult } from "../models";
import { FastMarketBetType, ResultStatus } from '../constants';
import * as _ from 'lodash';
@Pipe({
    name: 'resultStatusFilter',
})

export class ResultStatusPipe implements PipeTransform {
    public transform(fastMarketItem: FastMarketResult[], args: string[]) {
        return fastMarketItem.filter((item) => {
            const hasResultStatus = _.isNil(args)
                || args.length === 0
                || this.isResultStatusMatched(item, args);

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private isExistedItem(hasResultStatus: boolean, item: FastMarketResult) {
        if (hasResultStatus || item.betType === FastMarketBetType.timeMachineOverUnder
            || item.betType === FastMarketBetType.timeMachineHDP) {
            item.isShow = true;
            return true;
        } else {
            item.isShow = false;
            return false;
        }
    }

    private isResultStatusMatched(item: FastMarketResult, args: string[]) {
        return _.indexOf(args, item.resultStatus.toString()) !== -1;
    }
}
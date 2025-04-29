import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from "../models/sportsbook-sop";
import * as _ from 'lodash';
@Pipe({
    name: 'resultStatusPipe',
})

export class ResultStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string) {
        console.log(args);
        return resultDetails.filter((item) => {
            const hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.resultStatus)
                || this.filterConfirmRefundMatch(args, item)
                || this.filterConfirmedTraderMatch(args, item);

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private filterConfirmRefundMatch(args: string, resultDetail: ResultDetail) {
        if(_.includes(args, 'Confirmed')){
            return resultDetail.resultSettingData.isConfirmedRefund;
        }
        return false;
    }

    private filterConfirmedTraderMatch(args: string, resultDetail: ResultDetail) {
        if(_.includes(args, '3')){
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

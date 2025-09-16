import { Pipe, PipeTransform } from '@angular/core';
import { ResultDetail } from "../models/sportsbook-sop";
import * as _ from 'lodash';
import { SettlementStatusId } from '../constants';
@Pipe({
    name: 'resultStatusPipe',
    standalone: false
})

export class ResultStatusPipe implements PipeTransform {
    public transform(resultDetails: ResultDetail[], args: string) {
        return resultDetails.filter((item) => {
            const hasResultStatus = _.isNil(args)
                || args.length === 0
                || _.includes(args, item.resultStatus)
                || this.filterConfirmRefundMatch(args, item)
                || this.filterConfirmedTraderMatch(args, item)
                || this.filterRefundWithSettleDeterminedMatch(args, item);

            return this.isExistedItem(hasResultStatus, item);
        });
    }

    private filterRefundWithSettleDeterminedMatch(args: string, resultDetail: ResultDetail) {
        if(_.includes(args, 'Refund')){
            return resultDetail.settlementStatusId === SettlementStatusId.RefundSettleDetermined;
        }
        return false;
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

import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { SettlementStatusId } from '../constants';

@Pipe({
    name: 'intervalBackground',
    standalone: true
})
export class IntervalBackgroundPipe implements PipeTransform {
    public transform(settlementStatusId: number) {
        if (_.isEqual(settlementStatusId, SettlementStatusId.Calculated)) {
            return "calculated";
        } else if (_.isEqual(settlementStatusId, SettlementStatusId.Refund) || _.isEqual(settlementStatusId, SettlementStatusId.RefundSettleDetermined)) {
            return "refunded";
        }
        return "";
    }
}
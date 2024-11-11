import {Pipe, PipeTransform} from "@angular/core";
import {AutoSettleType, ResourceType} from "./types";

@Pipe({
    name: 'settleTypeName',
    standalone: true,
})
export class SettleTypeNamePipe implements PipeTransform {
    transform(value: AutoSettleType, ...args: any[]): any {
        if(value === AutoSettleType.AutoPayout) {
            return 'Auto Payout';
        }
        if(value === AutoSettleType.AutoRefund) {
            return 'Auto Refund';
        }

        if(value === AutoSettleType.AutoDirect) {
            return 'Direct';
        }

        return  'Auto Payout';
    }
}
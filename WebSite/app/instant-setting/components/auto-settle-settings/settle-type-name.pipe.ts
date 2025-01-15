import { Pipe, PipeTransform } from "@angular/core";
import { AutoSettleType } from "../../../shared/constants/auto-settle-type.native";

@Pipe({
    name: 'settleTypeName',
    standalone: true,
})
export class SettleTypeNamePipe implements PipeTransform {
    transform(value: AutoSettleType): string {
        if (value === AutoSettleType.AutoPayout) {
            return 'Auto Payout';
        }
        if (value === AutoSettleType.AutoRefund) {
            return 'Auto Refund';
        }

        if (value === AutoSettleType.AutoDirect) {
            return 'Direct';
        }

        return 'Auto Payout';
    }
}
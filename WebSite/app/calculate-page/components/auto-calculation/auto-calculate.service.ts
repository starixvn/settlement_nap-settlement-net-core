import { Injectable } from "@angular/core";
import { ItemsSelect } from "../../../shared/models";

@Injectable()
export class AutoCalculateService {
    public createAutoPayoutFilter() {
        const autoPayout = new ItemsSelect(1, '1', 'Auto Payout', true, true, true, []);
        const direct = new ItemsSelect(2, '16', ' Direct Settlement', true, true, true, []);
        const off = new ItemsSelect(3, '0', 'OFF', true, true, true, []);
        return [autoPayout, direct, off];
    }
}

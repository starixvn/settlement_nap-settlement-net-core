import { Injectable } from "@angular/core";
import { ItemsSelect } from "../../../shared/models";
import { CalculationMatch, League } from '../../models';

@Injectable()
export class AutoCalculateService {
    public createAutoPayoutFilter() {
        const autoPayout = new ItemsSelect(1, '1', 'Auto Payout', true, true, true, []);
        const direct = new ItemsSelect(2, '16', ' Direct Payout', true, true, true, []);
        const off = new ItemsSelect(3, '0', 'OFF', true, true, true, []);
        return [autoPayout, direct, off];
    }

    private  getFormattedStatus(label: string): string {
        return label === 'OFF' ? 'OFF' : `<div>ON <div class='auto-type'>(${label})</div></div>`;
    }

    public  getStatusAutoPayoutMatch(match: CalculationMatch, league: League): string {
        const { isAutoPayoutForMatch, isDirectPayoutForMatch } = match.autoCalcSetting;
        const { enabledAutoRefundMatch } = match;
        const { enabledAutoRefund } = league;
        const isRefund = enabledAutoRefundMatch ?? enabledAutoRefund;
        const label = this.getStatusLabel(isAutoPayoutForMatch, isDirectPayoutForMatch, isRefund);
        return this.getFormattedStatus(label);
    }

    public  getStatusAutoPayoutLeague(league: League): string {
        const { isAutoPayoutForLeague, isDirectPayoutForLeague } = league.autoCalcSetting;
        const { enabledAutoRefund } = league;
        const label = this.getStatusLabel(isAutoPayoutForLeague, isDirectPayoutForLeague, enabledAutoRefund);
        return this.getFormattedStatus(label);
    }

    private  getStatusLabel(auto: boolean, direct: boolean, refund: boolean): string {
        if (auto && direct) {
            return 'Auto & Direct';
        } else if (auto && refund) {
            return 'Auto & Refund';
        } else if (direct && refund) {
            return 'Direct & Refund';
        } else if (auto) {
            return 'Auto';
        } else if (direct) {
            return 'Direct';
        } else if (refund) {
            return 'Refund';
        } else {
            return 'OFF';
        }
    }
}

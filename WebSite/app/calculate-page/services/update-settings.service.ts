import { Injectable } from "@angular/core";
import { CalculationMatch, League } from "../models";
import { AutoSettleSetting } from "../models/auto-settle-settings";
import { AutoSettleType } from "../../shared/constants/auto-settle-type.native";
import { ResultSetting } from "../../shared/models/settings";
import { EventStatus } from "../../shared/constants";

@Injectable()
export class UpdateSettingsService {

    public setAutoCalcSettingLeague(league: League, setting: AutoSettleSetting): void {
        const autoPayoutEnabled = this.getSettingValue(setting, AutoSettleType.AutoPayoutSoccer, 'enabled') as boolean;
        const directPayoutEnabled = this.getSettingValue(setting, AutoSettleType.AutoDirect, 'enabled') as boolean;
        const refundWaitingTime = this.getSettingValue(setting, AutoSettleType.AutoRefund, 'waitingTime') as number;
        const directWaitingTime = this.getSettingValue(setting, AutoSettleType.AutoDirect, 'waitingTime') as number;
        const autoRefundEnabled = this.getSettingValue(setting, AutoSettleType.AutoRefund, 'enabled') as boolean;

        league.autoCalcSetting.isAutoPayoutForLeague = autoPayoutEnabled;
        league.autoCalcSetting.isDirectPayoutForLeague = directPayoutEnabled;
        league.refundWaitingTime = refundWaitingTime;
        league.directWaitingTime = directWaitingTime;
        league.enabledAutoRefund = autoRefundEnabled;

        league.matches.forEach(match => {
            if (this.isMatchEligibleForAutoCalc(match.eventStatus)) {
                match.autoCalcSetting.isAutoPayoutForMatch = this.isChildMatchApplicable(setting, AutoSettleType.AutoPayoutSoccer) 
                    ? autoPayoutEnabled 
                    : match.autoCalcSetting.isAutoPayoutForMatch;
                match.autoCalcSetting.isDirectPayoutForMatch = this.isChildMatchApplicable(setting, AutoSettleType.AutoDirect) 
                    ? directPayoutEnabled 
                    : match.autoCalcSetting.isDirectPayoutForMatch;
                match.enabledAutoRefundMatch = this.isChildMatchApplicable(setting, AutoSettleType.AutoRefund) 
                    ? autoRefundEnabled 
                    : match.enabledAutoRefundMatch;
            }
        });
    }

    public setAutoCalcSettingMatch(match: CalculationMatch, setting: AutoSettleSetting) {
        match.autoCalcSetting.isAutoPayoutForMatch = this.getSettingValue(setting, AutoSettleType.AutoPayoutSoccer, 'enabled') as boolean;
        match.autoCalcSetting.isDirectPayoutForMatch = this.getSettingValue(setting, AutoSettleType.AutoDirect, 'enabled') as boolean;
        match.refundWaitingTimeMatch = this.getSettingValue(setting, AutoSettleType.AutoRefund, 'waitingTime') as number;
        match.directWaitingTimeMatch = this.getSettingValue(setting, AutoSettleType.AutoDirect, 'waitingTime') as number;
        match.enabledAutoRefundMatch = this.getSettingValue(setting, AutoSettleType.AutoRefund, 'enabled') as boolean;
    }

    private getSettingValue(setting: AutoSettleSetting, settleType: AutoSettleType, key: keyof ResultSetting): any {
        return setting.resultSettings.find(x => x.settleType === settleType)?.[key];
    }

    private isMatchEligibleForAutoCalc(eventStatus: string): boolean {
        const lowerCaseStatus = eventStatus.toLowerCase();
        return lowerCaseStatus.includes('refund ht') ||
               lowerCaseStatus === EventStatus.running.toLowerCase() ||
               lowerCaseStatus === EventStatus.closed.toLowerCase();
    }


    private isChildMatchApplicable(setting: AutoSettleSetting, settleType: AutoSettleType): boolean {
        return this.getSettingValue(setting, settleType, 'isApplyChildMatches');
    }
}
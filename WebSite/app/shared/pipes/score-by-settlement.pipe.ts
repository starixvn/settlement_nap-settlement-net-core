import { Pipe, PipeTransform } from '@angular/core';
import { SettlementStatusId } from '../constants';
import { Language } from '../language.native';

@Pipe({
    name: 'scoreBySettlement',
    standalone: true
})
export class ScoreBySettlementPipe implements PipeTransform {
    public transform(score: string, settlementStatusId: number = -1) {
        switch (settlementStatusId) {
            case SettlementStatusId.Running: 
            case SettlementStatusId.Calculated:
                return score === null || score === '' ? '-' : score;

            case SettlementStatusId.Refund:
                return Language.RefundSymbol.All;
            case SettlementStatusId.RefundSettleDetermined:
                return score === null || score === "" ? Language.RefundSymbol.All : score;

            case SettlementStatusId.RefundHalfTime:
                return Language.RefundSymbol.HalfTime;

            case SettlementStatusId.RefundFullTime:
                return Language.RefundSymbol.FullTime;

            default:
                return '-';
        }
    }
}
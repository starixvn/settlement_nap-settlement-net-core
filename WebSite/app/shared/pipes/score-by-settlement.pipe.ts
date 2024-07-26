import { Pipe, PipeTransform } from '@angular/core';
import { SettlementStatusId } from '../constants';
import { Language } from '../language.native';

@Pipe({
    name: 'scoreBySettlement',
    standalone: true
})
export class ScoreBySettlementPipe implements PipeTransform {
    private readonly refundSymbolMap: Record<number, string> = {
        [SettlementStatusId.RefundHalfTime]: Language.RefundSymbol.HalfTime,
        [SettlementStatusId.RefundFullTime]: Language.RefundSymbol.FullTime,
        [SettlementStatusId.Refund]: Language.RefundSymbol.All,
      };

    public transform(score: string, settlementStatusId = -1) {
        const refundSymbol = this.refundSymbolMap[settlementStatusId];
        if (refundSymbol) {
          return refundSymbol;
        }
        
        if (this.isRunningOrCalculatedStatus(settlementStatusId)) {
            return this.getScoreOrDash(score);
        }

        if (settlementStatusId === SettlementStatusId.RefundSettleDetermined) {
            return this.getScoreOrRefundSymbol(score);
        }

        return '-';
    }

    private isRunningOrCalculatedStatus(statusId: number) {
        return statusId === SettlementStatusId.Running || statusId === SettlementStatusId.Calculated;
    }

    private getScoreOrDash(score: string) {
        return score === null || score === '' ? '-' : score;
    }

    private getScoreOrRefundSymbol(score: string) {
        return score === null || score === "" ? Language.RefundSymbol.All : score;
    }
}
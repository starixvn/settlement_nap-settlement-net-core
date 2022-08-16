import { Pipe, PipeTransform } from '@angular/core';
import { SettlementStatusId } from '../../shared/constants';

@Pipe({ name: 'scoreByPermission' })
export class ScoreByPermissionPipe implements PipeTransform {
    public transform(score: string, settlementStatusId: number, isLeader: boolean) {
        return isLeader || settlementStatusId === SettlementStatusId.Calculated ||
            settlementStatusId === SettlementStatusId.Refund ||
            settlementStatusId === SettlementStatusId.RefundHalfTime ||
            settlementStatusId === SettlementStatusId.RefundFullTime ? score : '-';
    }
}
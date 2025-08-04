import { Pipe, PipeTransform } from '@angular/core';
import { SettlementStatusId } from '../../shared/constants';
import { isEmpty, isEqual, isNull } from 'lodash';

@Pipe({
  name: 'resourceStatus',
  standalone: true
})
export class ResourceStatusPipe implements PipeTransform {
  transform(settlementStatusId: number): string {
    if (isEqual(settlementStatusId, SettlementStatusId.Running) || isNull(settlementStatusId)) {
      return "";
    } else if (isEqual(settlementStatusId, SettlementStatusId.Calculated)) {
      return "calculated";
    } else {
      return "refunded";
    }
  }
}
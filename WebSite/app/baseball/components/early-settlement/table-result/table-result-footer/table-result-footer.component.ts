import { CalculateAction } from './../../../../../shared/constants/calculate-action.native';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { EarlySettlementStore } from '../../../../services/early-settlement/early-settlement.store';
import { CommonModule } from '@angular/common';
import { Permission, SettleQuery } from '../../../../../shared/models/sportsbook-sop';
import { NotifyService } from '../../../../services/notify.service';
import { EarlySettlementService } from '../../../../services/early-settlement/early-settlement.service';
import { BaseballApiKeys } from '../../../../constants/api-keys.constant';
import { Language } from '../../../../../shared/language.native';
import { find, join } from 'lodash';

@Component({
  selector: 'div[table-result-footer]',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-result-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableResultFooterComponent {
  permission = input<Permission>();
  #store = inject(EarlySettlementStore);
  #notifyService = inject(NotifyService);
  #earlySettlementService = inject(EarlySettlementService);
  isDisableAction = this.#store.disableAction;
  isShowRefundButton = false;

  calculate() {
    this.#notifyService.clearError();
    this.#store.setActionSubmit(CalculateAction.earlyCalculate);
    this.#earlySettlementService.calculate();
  }

  unCalculate() {
    this.#notifyService.clearError();
    this.#store.setActionSubmit(CalculateAction.earlyUnCalculate);
    this.#earlySettlementService.unCalculate();

  }

  saveResult() {
    this.#notifyService.clearError();
    this.#notifyService.confirm(Language.eSports.saveScore, () => {
      this.#earlySettlementService.saveScore();
    })
  }

  confirmRefund() {
    this.#notifyService.clearError();
    const selected = this.#store.getResultChecked();
    const resourceIds = join(selected.map(item => item.resourceId), ',');
    const existResultConfirmed = find(selected, item => item.resultSettingData.isConfirmedRefund);
    if (existResultConfirmed) {
      this.#earlySettlementService.unConfirmResult(resourceIds);
    } else {
      this.#earlySettlementService.confirmResult(resourceIds);
    }
  }

  refund() {
    this.#notifyService.clearError();
    this.#store.setActionSubmit(CalculateAction.earlyRefund);
    this.#earlySettlementService.refund();
  }

}

import { CalculateAction } from './../../../../../shared/constants/calculate-action.native';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Permission, SettleQuery } from '../../../../../shared/models/sportsbook-sop';
import { NotifyService } from '../../../../services/notify.service';
import { EarlySettlementService } from '../../../../services/early-settlement/early-settlement.service';
import { Language } from '../../../../../shared/language.native';
import { find, join } from 'lodash';
import { EarlySettlementStorage } from '../../../../services/early-settlement/early-settlement.storage';

@Component({
  selector: 'div[table-result-footer]',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-result-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableResultFooterComponent {
  permission = input<Permission>();
  readonly #storage = inject(EarlySettlementStorage);
  readonly #notifyService = inject(NotifyService);
  readonly #earlySettlementService = inject(EarlySettlementService);
  
  isDisableAction = this.#storage.disableAction;
  isShowRefundButton = false;
  isReadyMatch = this.#storage.isReadyMatch();

  calculate() {
    this.#notifyService.clearError();
    this.#storage.setActionSubmit(CalculateAction.earlyCalculate);
    this.#earlySettlementService.calculate();
  }

  unCalculate() {
    this.#notifyService.clearError();
    this.#storage.setActionSubmit(CalculateAction.earlyUnCalculate);
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
    const selected = this.#storage.getResultChecked();
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
    this.#storage.setActionSubmit(CalculateAction.earlyRefund);
    this.#earlySettlementService.refund();
  }

}

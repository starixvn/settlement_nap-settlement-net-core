import { ChangeDetectorRef, Component, computed, EventEmitter, inject, Input, Output } from "@angular/core";
import { ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { isEqual } from "lodash";
import { EarlyResourcesIds } from "../../constants";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { SettlementStatusId } from "../../../shared/constants/settlement-status-id.native";
import { EarlyStore } from "../../store/early.store";

abstract class InputBaseComponent {
  getDropdownTooltip(result: string, maxLength: number, homeTeam: string, awayTeam: string) {
    const tooltip = isEqual(result, "H")
      ? homeTeam : isEqual(result, "A")
        ? awayTeam : '';
    return this.getTextTooltip(tooltip, maxLength);
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  hasNoneOption(betType: string) {
    return !isEqual(EarlyResourcesIds.fullTime[0], betType);
  }
}

@Component({
  template: '',
  standalone: true,
  providers: [VerificationBaseService],
})
export class InputFinalBaseComponent extends InputBaseComponent {
  @Input({ required: true }) item: ResultDetail;
  @Input({ required: true }) enable: boolean;
  @Input() updateView: () => void;
  readonly #verificationBaseService = inject(VerificationBaseService);

  checkResultIsMatched(resultDetail: ResultDetail) {
    resultDetail.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    this.updateView();
  }
}

@Component({
  template: '',
  standalone: true,
  providers: [VerificationBaseService, EarlyStore],
})
export class InputOutSideBaseComponent extends InputBaseComponent {
  @Input({ required: true }) resultDetail: ResultDetail;
  @Input({ required: true }) externalResult: ExternalResultDetail;
  @Input({ required: true }) enable: boolean;
  @Input() updateView: () => void;
  readonly #verificationBaseService = inject(VerificationBaseService);
  readonly #earlyStore = inject(EarlyStore);
  readonly #matchDetail = computed(() => this.#earlyStore.matchDetail()); 

  verifyAndAutoFillResult(resultDetail: ResultDetail) {
    this.#matchDetail().isSavedScore = false;
    if (resultDetail.settlementStatusId !== SettlementStatusId.Calculated) {
      resultDetail.homeValue = '';
      resultDetail.awayValue = '';
    }

    this.#verificationBaseService.autoFillEarlyResult(resultDetail);
    resultDetail.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    this.updateView();
  }
}
import { Component, computed, inject, Input } from "@angular/core";
import { ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { isEqual } from "lodash";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { SettlementStatusId } from "../../../shared/constants/settlement-status-id.native";
import { EarlyStore } from "../../store/early.store";
import { MixMultiStatsService } from "../../services/mix-multi-stats.service";
import { MixDoubleDoubleService } from "../../services/mix-double-double.service";
import { MixHeadHeadService } from "../../services/mix-head-head.service";

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
}

@Component({
  template: '',
  standalone: true,
  providers: [VerificationBaseService],
})
export class InputFinalBaseComponent extends InputBaseComponent{
  @Input({ required: true }) item: ResultDetail;
  @Input({ required: true }) enable: boolean;
  @Input() isLeader: boolean;
  @Input() isRefundWithSettleDetermined: boolean;
  readonly #verificationBaseService = inject(VerificationBaseService);
  readonly #mixMultiStatsService = inject(MixMultiStatsService);
  readonly #mixDoubleDoubleService = inject(MixDoubleDoubleService);
  readonly #mixHeadHeadService = inject(MixHeadHeadService);
  readonly #earlyStore = inject(EarlyStore);

  checkResultIsMatched(resultDetail: ResultDetail) {
    resultDetail.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(resultDetail);
     this.#mixMultiStatsService.autoFillMixReboundsAssists(this.#earlyStore.resultDetails(), resultDetail);
     this.#mixDoubleDoubleService.autoFillMixDoubleDouble(this.#earlyStore.resultDetails(), resultDetail);
     this.#mixHeadHeadService.autoFillMixHeadHead(this.#earlyStore.resultDetails(), resultDetail);
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
  readonly #verificationBaseService = inject(VerificationBaseService);
  readonly #mixMultiStatsService = inject(MixMultiStatsService);
  readonly #mixDoubleDoubleService = inject(MixDoubleDoubleService);
  readonly #mixHeadHeadService = inject(MixHeadHeadService);
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
    this.#mixMultiStatsService.autoFillMixReboundsAssists(this.#earlyStore.resultDetails(), resultDetail);
    this.#mixDoubleDoubleService.autoFillMixDoubleDouble(this.#earlyStore.resultDetails(), resultDetail);
    this.#mixHeadHeadService.autoFillMixHeadHead(this.#earlyStore.resultDetails(), resultDetail);
  }
}
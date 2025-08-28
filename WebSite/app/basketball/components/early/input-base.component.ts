import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { isEqual } from "lodash";
import { EarlyResourcesIds } from "../../constants";
import { VerificationBaseService } from "../../../core/services/verification-base.service";

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
})
export class InputFinalBaseComponent extends InputBaseComponent {
   @Input() item: ResultDetail ;
   @Input() enable: boolean;
   verificationBaseService = inject(VerificationBaseService);

   checkResultIsMatched(resultDetail: ResultDetail) {
    resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    
  }
}

@Component({
  template: '',
})
export class InputOutSideBaseComponent extends InputBaseComponent {
   @Input() resultDetail: ResultDetail ;
   @Input() externalResult: ExternalResultDetail;
   @Input() enable: boolean;
   verificationBaseService = inject(VerificationBaseService);

   checkResultIsMatched(resultDetail: ResultDetail) {
    resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    
  }
}
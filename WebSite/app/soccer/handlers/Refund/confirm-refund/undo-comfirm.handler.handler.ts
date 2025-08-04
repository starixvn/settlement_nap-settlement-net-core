import { AbstractHandler } from "../../abstract.handler.native";
import { inject } from "@angular/core";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";
import { filter } from "lodash";
import { Language } from "../../../../shared/language.native";

export class UndoConfirmHandler extends AbstractHandler {
    public handle(storage: RefundBaseStorage): void {
      const resultDetails = storage.getSelectedResource() as ResultDetail[];
      const resultConfirmed = filter(resultDetails, item => 
        (item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt)
      );
      
      if (resultConfirmed.length === resultDetails.length) {
        super.handle(storage);
      } else {
        storage.error(Language.confirmRefund.differentStates);
      }
    }
}
import { LogicService } from "../../../components/sop-refund/services/logic.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { inject } from "@angular/core";
import { RefundBaseStorage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { find } from "lodash";
import { ResultDetail } from "../../../models";

export class DoubleCheckConfirmRefundHandler extends AbstractHandler {
    #logicService = inject(LogicService); 
    public handle(storage: RefundBaseStorage): void {
        const selectedResources = storage.getSelectedResource() as ResultDetail[];
        const existResultConfirmed = find(selectedResources, item => 
            (item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt)
          );
        storage.setConfirmMessage(existResultConfirmed ? Language.confirmRefund.undoConfirm : Language.confirmRefund.confirmRefund);
        this.#logicService.showConfirmMessage(async () => {
            super.handle(storage);
        });
    }
} 
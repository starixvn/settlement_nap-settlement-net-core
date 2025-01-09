import { TicketStatusText } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";

export class VerifySettledResultHandler extends AbstractHandler{
  handle(storage: Storage) {
    const { resultDetails} = storage.getMatch();
    const resultSelected = resultDetails.filter((resultDetail) => resultDetail.checked);
    const isExistSettledResult = resultSelected.some((resultDetail) => resultDetail.ticketStatus === TicketStatusText.calculated);

    if(isExistSettledResult) {
      storage.error(Language.saveScore.specificSettledResult.replace('{0}', resultSelected.map((resultDetail) => resultDetail.resourceName).join(', ')));
    } else {
      super.handle(storage);
    }
  }
}
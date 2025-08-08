import { ResultStatusId } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";

export class VerifySettledResultHandler extends AbstractHandler {
  handle(storage: CalculateBaseStorage) {
    const { resultDetails } = storage.getMatch();
    const settledResult = resultDetails.filter((resultDetail) => resultDetail.checked
      && (resultDetail.resultStatusId === ResultStatusId.AutoCompleted
        || resultDetail.resultStatusId === ResultStatusId.ManualCompleted));

    if (settledResult.length > 0) {
      storage.error(Language.saveScore.specificSettledResult.replace('{0}', settledResult.map((resultDetail) => resultDetail.resourceName).join(', ')));
    } else {
      super.handle(storage);
    }
  }
}
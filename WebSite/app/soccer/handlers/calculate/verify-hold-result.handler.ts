import { inject } from "@angular/core";
import { CalculateAction } from "../../../shared/constants";
import { ResourceIds } from "../../constants";
import { CalculateBaseStorage } from "../../storage/storage.service.native";
import { AbstractHandler } from "../abstract.handler.native";
import { RequestService } from "../../components/calc/services/request.service";
import { Language } from "../../../shared/language.native";

export class VerifyHoldResultHandler extends AbstractHandler {
  readonly #requestService = inject(RequestService);

  async handle(storage: CalculateBaseStorage) {
    const { matchDetail } = storage.getMatch();
    let newestResultDetails = await this.#requestService.getResultDetail(matchDetail.matchId);
    if (storage.getCalculateAction() === CalculateAction.calculateHalfTime) {
      newestResultDetails = newestResultDetails.filter((resultDetail) => resultDetail.resourceId === ResourceIds.fullTime);
    }

    const existResultHeld= newestResultDetails.some((resultDetail) => resultDetail.resultSettingData.isHoldResult);

    if(existResultHeld) {
      storage.error(Language.ResultHeld.replace('{0}', newestResultDetails.map((resultDetail) => resultDetail.resourceName).join(', ')));
    } {
      super.handle(storage);
    }
  }
}
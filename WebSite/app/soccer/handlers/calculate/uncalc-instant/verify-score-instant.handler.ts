import { inject } from "@angular/core";
import { RequestService } from "../../../components/calc/services/request.service";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { isEmpty }from "lodash";

export class VerifyScoreInstantHandler extends AbstractHandler {
  #requestService = inject(RequestService);

  async handle(storage: Storage): Promise<void> {
    const { matchDetail } = storage.getMatch();
    const result = await this.#requestService.undoCheckingScore(matchDetail.matchId);
    const errorMessage = result.errMsg;
    if (isEmpty(errorMessage)) {
      storage.setInstantScore(result);
      super.handle(storage);
    } else {
      storage.error(errorMessage);
    }
  }
}
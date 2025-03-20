import { AbstractHandler } from "../../abstract.handler.native";
import { Storage } from "../../../storage/storage.service.native";
import { Language } from "../../../../shared/language.native";
import { TicketStatusText } from "../../../../shared/constants";
import { MessageBoxService } from "../../../../shared/services";
import { inject } from "@angular/core";

export class ConfirmFtNoTicketHandler extends AbstractHandler {
  #messageBoxService = inject(MessageBoxService);

  async handle(storage: Storage) {
    const { matchDetail } = storage.getMatch();
    const halfTimeResult = storage.getHalfTimeResult();
    const confirmMessage = `${Language.soccer.confirmAutoSelectFtNoTicket}`;
    
    // if(!halfTimeResult.checked && matchDetail.ftStatus === TicketStatusText.noTicket) {
    //   storage.setConfirmMessage(confirmMessage);
    //   this.#messageBoxService.confirm(storage.getConfirmMessage(), () => {
    //     halfTimeResult.homeValue = '0';
    //     halfTimeResult.awayValue = '0';
    //     halfTimeResult.checked = true;
    //     super.handle(storage);
    //   });
    // }
    super.handle(storage);
    console.log('ConfirmFtNoTicketHandler')
  }
}
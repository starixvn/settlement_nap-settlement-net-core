import { Injectable } from "@angular/core";
import { DialogBoxService } from "../../shared/services";
import { DialogDataIframe } from "../../shared/models";
import { Language } from "../../shared/language";
import { MatchDetail } from "../models";
import { EventStatus } from "../constants";

@Injectable()
export class PopupService {
    constructor(private readonly dialogBoxService: DialogBoxService) { }

    public popupLog(matchId: number, fromDate: string, toDate: string, netCoreUrl: string) {
        const src = `${netCoreUrl}/apps/log/?matchCode=${matchId}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=BBD`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.SettlementLog, frameSrc);
        this.dialogBoxService.popup(dialogData, '1011px', '800px');
    }

    public popupCalc(match: MatchDetail, netCoreUrl: string) {
        const src = `${netCoreUrl}/apps/bet-builder?matchId=${match.matchId}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.BetBuilderPopupTitle, frameSrc);
        this.dialogBoxService.popup(dialogData, '1011px', '800px').subscribe(result => {
            if (result) {
                match.eventStatus = EventStatus.waiting;
                match.isShowLink = false;
            }
        });
    }

}
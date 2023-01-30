import { Injectable } from "@angular/core";
import { DialogBoxService } from './../../shared/services';
import { DialogDataIframe } from './../../shared/models';

@Injectable()
export class PopupService {

    constructor(private readonly dialogBoxService: DialogBoxService) {

    }
    public popupLog(matchCode: string, fromDate: string, toDate: string) {
        const src = `home/log?matchCode=${encodeURIComponent(matchCode)}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
        const dialogData = new DialogDataIframe("", src);
        this.dialogBoxService.popup(dialogData, '1011px', '800px');
    }
}

import { Injectable } from '@angular/core';
import { DialogBoxService } from '../../shared/services';
import { DialogDataIframe } from '../../shared/models/dialog-data.model';
import { Language } from '../../shared/language.native';
import { MatDialog } from '@angular/material/dialog';
import { ReCalculationComponent } from '../components/recalculation.component';
import { Ball, ReCalculationModel} from '../models';
import * as _ from 'lodash';


@Injectable()

export class PopupService {

    public dialogData: DialogDataIframe;
    constructor(private readonly dialogBoxService: DialogBoxService,
                private readonly dialog: MatDialog) {
    }

    public popupLog(matchId: number, fromDate: string, toDate: string) {
        const src = `home/log/?matchCode=${matchId}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=NBG`;
        const frameSrc = encodeURI(src);
        this.dialogData = new DialogDataIframe(Language.SettlementLog, frameSrc);
        this.dialogBoxService.popup(this.dialogData, '1011px', '800px');
    }

    public popupReCalc(model: ReCalculationModel) {
        this.dialog.closeAll();
        this.dialog.open(ReCalculationComponent, {
            width: '800px',
            height: '350px',
            data: model
        }).afterClosed().subscribe((result: Ball[]) => {
            if (!_.isEmpty(result)) {
                const numbers = [];
                _.each(result, item => item.numberBall !== 0 ? numbers.push(_.toString(item.numberBall)) : '');
                const match = model.matchDetail;
                match.number = numbers.join(',');
                match.eventStatus = result[0].eventStatus;
            }
        });
    }
}


import { Injectable } from '@angular/core';
import { DialogBoxService } from '../../shared/services';
import { DialogDataIframe } from '../../shared/models/dialog-data.model';
import { Language } from '../../shared/language.native';
import { EventStatus } from '../../shared/constants';
import { MatDialog } from '@angular/material/dialog';
import { ReCalculationComponent } from '../components/recalculation.component';
import { RefundComponent } from '../components/refund.component';
import { Ball, PopupModel } from '../models';
import { BallService } from '../services';
import * as _ from 'lodash';
@Injectable()
export class PopupService {

    public dialogData: DialogDataIframe;
    constructor(
        private readonly dialogBoxService: DialogBoxService,
        private readonly ballService: BallService,
        private readonly dialog: MatDialog) {
    }

    public popupLog(matchId: number, fromDate: string, toDate: string) {
        const src = `home/log/?matchCode=${matchId}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=HPF`;
        const frameSrc = encodeURI(src);
        this.dialogData = new DialogDataIframe(Language.SettlementLog, frameSrc);
        this.dialogBoxService.popup(this.dialogData, '1600px', '800px');
    }

    public popupReCalc(model: PopupModel) {
        this.dialog.closeAll();
        this.dialog.open(ReCalculationComponent, {
            width: '450px',
            height: '400px',
            data: model
        }).afterClosed().subscribe((balls: Ball[]) => {
            if (!_.isEmpty(balls)) {
                const match = model.matchDetail;
                match.balls = balls;
                match.eventStatus = EventStatus.completed;
                this.ballService.resetValueOnCurrentMatch(match);
            }
        });
    }

    public popupRefund(model: PopupModel) {
        this.dialog.closeAll();
        this.dialog.open(RefundComponent, {
            width: '450px',
            height: '400px',
            data: model
        }).afterClosed().subscribe((balls: Ball[]) => {
            if (!_.isEmpty(balls)) {
                const match = model.matchDetail;
                match.balls = balls;
                match.eventStatus = EventStatus.refund;
                this.ballService.resetValueOnCurrentMatch(match);
            }
        });
    }
}

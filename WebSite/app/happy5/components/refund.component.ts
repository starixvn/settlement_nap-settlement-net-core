import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { MatchDetail, PopupModel, Ball, SettleQuery } from '../models';
import { ModalDialogMessage, Result } from '../../shared/models';
import { CalculateAction } from '../../shared/constants';
import { RedBall } from '../constants';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Language } from '../../shared/language.native';
import { QueryService, VerifyBallService } from '../services';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';

@Component({
    selector: 'refund',
    templateUrl: './refund.component.html',
    providers:[
        QueryService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        VerifyBallService
    ]
})

export class RefundComponent implements OnInit {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: MatchDetail;
    public balls: Ball[];
    private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        private readonly toastrService: ToastrService,
        private readonly queryService: QueryService,
        private readonly messageBoxService: MessageBoxService,
        public dialogRef: MatDialogRef<RefundComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PopupModel) {
        this.confirmationDialogMessage.title = Language.gaming.reCalculateConfirmationBox;
        this.match = data.matchDetail;
        this.dialogRef.disableClose = true;
    }

    public async ngOnInit() {
        this.toastrService.overlayContainer = this.toastContainer;
        this.balls = await this.queryService.getBalls(this.match.matchId);
    }

    public closePopup() {
        this.dialogRef.close();
    }

    public refund() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.gaming.refundConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doRefund();
        });
    }

    public getColorBall(ball: Ball) {
        return _.includes(RedBall, ball.numberBall) ? "red" : "blue";
    }

    private doRefund() {
        this.balls.forEach((ball) => {
            ball.numberBall = 0;
        });

        const query = new SettleQuery(this.match.matchId, this.balls, CalculateAction.refund);

        this.queryService.settle(query).subscribe((result: Result) => {
            if (result.isSuccessful) {
                this.dialogRef.close(this.balls);
            } else {
                this.toastrService.error(result.errMsg);
            }
        });
    }
}
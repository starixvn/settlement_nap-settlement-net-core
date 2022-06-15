import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MatchDetail, PopupModel, Ball, SettleQuery } from '../models';
import { CalculateAction } from '../../shared/constants';
import { ModalDialogMessage, Result } from '../../shared/models';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { QueryService, VerifyBallService } from '../services';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Language } from '../../shared/language';
@Component({
    selector: 're-calculation',
    templateUrl: './recalculation.component.html',
    providers:[
        QueryService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        VerifyBallService
    ]
})

export class ReCalculationComponent implements OnInit {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public isPressedCalculate = false;
    public match: MatchDetail;
    public balls: Ball[];

    constructor(
        private readonly toastrService: ToastrService,
        private readonly queryService: QueryService,
        private readonly verifyBallService: VerifyBallService,
        private readonly messageBoxService: MessageBoxService,
        public dialogRef: MatDialogRef<ReCalculationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PopupModel) {
        this.confirmationDialogMessage.title = Language.gaming.reCalculateConfirmationBox;
        this.match = data.matchDetail;
        this.dialogRef.disableClose = true;
    }

    public async ngOnInit() {
        this.toastrService.overlayContainer = this.toastContainer;
        this.queryService.apiUrl = this.data.apiUrl;
        this.balls = await this.queryService.getBalls(this.match.matchId);
    }

    public reCalculate() {
        this.toastrService.clear();
        this.isPressedCalculate = true;
        if (this.verifyBallService.emptyBall(this.balls)) {
            this.toastrService.error(Language.gaming.emptyBall);
        } else if(this.verifyBallService.outOfRangeBall(this.balls)) {
            const errorMessage = Language.gaming.outOfRangeBall.replace(/MIN/g, "1").replace(/MAX/g, "20");
            this.toastrService.error(errorMessage);
        } else if(this.verifyBallService.isDuplicateBall(this.balls)) {
            this.toastrService.error(Language.gaming.duplicationBalls);
        } else {
            this.confirmationDialogMessage.message = Language.gaming.reCalculateConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doReCalculate();
            });
        }
    }

    public isWarningOnBall(value: number) {
        const minBall = 1;
        const maxBall = 20;
        return this.isPressedCalculate && (!value || Number(value) > maxBall || Number(value) < minBall);
    }

    private doReCalculate() {
        const query = new SettleQuery(this.match.matchId, this.balls, CalculateAction.calculate);
        this.queryService.settle(query).subscribe((result: Result) => {
            if (result.isSuccessful) {
                this.dialogRef.close(this.balls);
            } else {
                this.toastrService.error(result.errMsg);
            }
        });
    }

    public closePopup() {
        this.dialogRef.close();
    }
}
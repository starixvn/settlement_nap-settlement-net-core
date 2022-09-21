import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ReCalculationModel, MatchDetail, Ball, SettleQuery } from '../models';
import { RedBall } from '../constants';
import { Language } from '../../shared/language';
import { ModalDialogMessage, Result } from '../../shared/models';
import { MessageBoxService, HttpRequestService, BlockUIService } from '../../shared/services';
import { QueryService, VerifyBallService } from '../services';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
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
    public balls: Ball[];
    public matchDetail: MatchDetail;
    constructor(
        private readonly toastrService: ToastrService,
        private readonly queryService: QueryService,
        private readonly verifyBallService: VerifyBallService,
        private readonly messageBoxService: MessageBoxService,
        public dialogRef: MatDialogRef<ReCalculationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ReCalculationModel) {
        this.confirmationDialogMessage.title = Language.gaming.reCalculateConfirmationBox;
        this.matchDetail = data.matchDetail;
        this.dialogRef.disableClose = true;
    }
    public ngOnInit() {
        this.toastrService.overlayContainer = this.toastContainer;
        this.getBalls();
    }

    public closePopup() {
        this.dialogRef.close();
    }

    public getBalls() {
        this.queryService.getBallsByMatchId(this.matchDetail.matchId).subscribe((balls: Ball[]) => {
            this.balls = this.getAllBalls(balls);
        });
    }

    private getAllBalls(balls: Ball[]) {
        const allBalls = [1, 2, 3];
        const result: Ball[] = [];
        allBalls.forEach((seqNumber) => {
            const singleBall = balls.find((ball) => ball.seq === seqNumber);
            singleBall ? result.push(singleBall) : result.push(new Ball(this.matchDetail.matchId, seqNumber, null));
        });

        return result;
    }

    public onCheckBoxChange(ball: Ball) {
        if (ball.isNA) {
            if (ball.seq === 1) {
                this.balls[1].isDisableCheckbox = ball.isNA;
                this.balls[2].isDisableCheckbox = ball.isNA;
                this.balls[1].isNA = ball.isNA;
                this.balls[2].isNA = ball.isNA;
            } else if (ball.seq === 2) {
                this.balls[2].isDisableCheckbox = ball.isNA;
                this.balls[2].isNA = ball.isNA;
            }
        } else if (ball.seq !== 3) {
            this.balls[ball.seq].isDisableCheckbox = false;
        }
    }

    public reCalculate() {
        this.toastrService.clear();
        this.isPressedCalculate = true;
        const balls = this.balls.filter((ball) => !ball.isNA);
        if (this.verifyBallService.emptyBall(balls)) {
            this.toastrService.error(Language.gaming.emptyBall);
        } else if(this.verifyBallService.outOfRangeBall(balls)) {
            const errorMessage = Language.gaming.outOfRangeBall.replace(/MIN/g, "1").replace(/MAX/g, "75");
            this.toastrService.error(errorMessage);
        } else if(this.verifyBallService.isDuplicateBall(balls)) {
            this.toastrService.error(Language.gaming.duplicationBalls);
        } else {
            this.confirmationDialogMessage.message = Language.gaming.reCalculateConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doReCalculate();
            });
        }
    }

    private doReCalculate() {
        this.balls.forEach((ball) => ball.color = _.includes(RedBall, Number(ball.numberBall)) ? "r" : "b");
        const query = new SettleQuery(this.matchDetail.matchId, this.balls.filter((ball) => !ball.isNA));
        query.action = this.queryService.getAction(this.balls);
        this.queryService.settle(query).subscribe((result: Result) => {
            if (result.isSuccessful) {
                this.queryService.getBallsByMatchId(this.matchDetail.matchId).subscribe((balls: Ball[]) => {
                    this.dialogRef.close(balls);
                });
            } else {
                this.toastrService.error(result.errMsg);
            }
        });
    }

    public isWarningOnBall(value: number) {
        const ball = new Ball(this.matchDetail.matchId, 1, value);
        return this.isPressedCalculate && !_.isNil(this.verifyBallService.outOfRangeBall([ball]));
    }

    public getColorBall(ball: Ball) {
        if (this.verifyBallService.outOfRangeBall([ball])) {
            return "disable";
        } else {
            return _.includes(RedBall, Number(ball.numberBall)) ? "red" : "blue";
        }
    }
}
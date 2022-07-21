import { Component, OnInit } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { MoveRunningTicketsService } from "./move-running-tickets.service";
import { MessageBoxService } from "../../../shared/services";
import { ModalDialogMessage, Result } from "../../../shared/models";
import { Language } from "../../../shared/language";
import { GetMoveTicketsRequest, MoveRunningTicketsRequest, ValidateMatchesRequest } from "../../models";
import { Match } from "../../models/match.model";
import { MoveTicketsService } from "../cricket/move-tickets.service";
import { DatePipe } from "@angular/common";

@Component({
    selector: 'running-tickets',
    templateUrl: './running-tickets.component.html',
    providers: [
        DatePipe
    ],
})
export class RunningTicketsComponent implements OnInit {
    public isSourceMatchChanged = false;
    public isTargetMatchChanged = false;
    public sourceMatchId = '';
    public targetMatchId = '';
    public isMatchReadyToMove = false;
    public sourceMatch: Match;
    public targetMatch: Match;
    public sourceMatchFormControl = new FormControl('', [Validators.required]);
    public targetMatchFormControl = new FormControl('', [Validators.required]);
    public dialogMessage = new ModalDialogMessage();
    public isOverrideResult = true;

    constructor(private readonly moveRunningTicketsService: MoveRunningTicketsService,
        private readonly messageBoxService: MessageBoxService,
        private readonly moveTicketsService: MoveTicketsService,
        private readonly datePipe: DatePipe) { }
    
    public ngOnInit() {}
    public isCheckMatchesButtonDisabled() {
        return _.isEmpty(this.sourceMatchId) || _.isEmpty(this.targetMatchId);
    }

    public isMoveButtonDisabled() {
        return !this.isMatchReadyToMove;
    }

    public changeSourceMatch() {
        this.isSourceMatchChanged = true;
        this.isMatchReadyToMove = false;
    }

    public changeTargetMatch() {
        this.isTargetMatchChanged = true;
        this.isMatchReadyToMove = false;
    }

    public checkMatches() {
        if (Number(this.sourceMatchId) === Number(this.targetMatchId)) {
            this.isMatchReadyToMove = false;
            this.dialogMessage.title = "Warning";
            this.dialogMessage.message = Language.moveTickets.matchDifferentError;
            this.messageBoxService.alert(this.dialogMessage);
        } else {
            this.validateAndGetMatches();
        }
    }

    public async validateAndGetMatches() {
        const request: ValidateMatchesRequest = {
            matchId: Number(this.sourceMatchId),
            targetMatchId: Number(this.targetMatchId)
        };

        await this.moveRunningTicketsService.validateMatches(request).toPromise().then((result: Result) => {
            if (result.isSuccessful) {
                this.getMatches();
            } else {
                this.isMatchReadyToMove = false;
                this.dialogMessage.title = "Warning";
                this.dialogMessage.message = result.errMsg;
                this.messageBoxService.alert(this.dialogMessage);
            }
        });
    }

    private async getMatches() {
        const matchIds = [this.sourceMatchId, this.targetMatchId];
        const request: GetMoveTicketsRequest = {
            matchIds: matchIds.join(',')
        };

        await this.moveRunningTicketsService.getMoveTicketsMatches(request).toPromise().then((matches: Match[]) => {
            this.sourceMatch = _.find(matches, (match) => match.matchId === Number(this.sourceMatchId));
            this.targetMatch = _.find(matches, (match) => match.matchId === Number(this.targetMatchId));
            this.isMatchReadyToMove = !_.isNil(this.sourceMatch) && !_.isNil(this.targetMatch);
        });
    }

    public async moveTickets() {
        this.dialogMessage.title = Language.confirmationBox;
        this.dialogMessage.message = Language.moveTickets.confirmMoveRunningTickets;
        this.messageBoxService.confirm(this.dialogMessage, async () => {
            const request: MoveRunningTicketsRequest = {
                matchId: Number(this.sourceMatchId),
                destinationMatchId: Number(this.targetMatchId),
                isOverrideResult: this.isOverrideResult
            };
            const result = await this.moveRunningTicketsService.moveRunningTickets(request).toPromise() as Result;
            if (result.isSuccessful) {
                this.dialogMessage.title = "Information Box";
                this.dialogMessage.message = "Moved running tickets successfully";
                this.messageBoxService.alert(this.dialogMessage);
            } else {
                this.dialogMessage.title = Language.warningTitle;
                this.dialogMessage.message = result.errMsg;
                this.messageBoxService.alert(this.dialogMessage);
            }
        });
    }

    public getLog(matchId: number) {
        const currentDate = new Date();
        const previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - 1);
        const currentDay = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
        const previousDay = this.datePipe.transform(previousDate, 'yyyy-MM-dd');
        this.moveTicketsService.popupLog(matchId, previousDay, currentDay);
    }
}
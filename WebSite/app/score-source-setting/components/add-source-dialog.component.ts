import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DefaultGames, sportSupport } from "../constants";
import { MessageBoxService, HttpRequestService, BlockUIService } from "../../shared/services";
import { ModalDialogMessage } from "../../shared/models";
import { Language } from "../../shared/language";
import * as _ from 'lodash';
import { QueryService } from "../services";
import { OutsideSource } from "../models/outside-source.model";
import { AddSourceResult, RequestNewOutsideSource } from "../models";

@Component({
    selector: 'add-source-dialog',
    templateUrl: 'add-source-dialog.component.html',
    providers: [
        MessageBoxService,
        QueryService,
        HttpRequestService,
        BlockUIService,
    ],
    standalone: true,
    imports:[CommonModule, FormsModule]
})
export class AddSourceDialogComponent implements OnInit{
    public isButtonClicked: boolean;
    public sourceName: string;
    public sourceLink: string;
    public games = _.cloneDeep(DefaultGames);
    public errorMessage: string;
    private readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public sports = sportSupport.outsideSource;
    public sportSelected: number;

    constructor(public dialogRef: MatDialogRef<AddSourceDialogComponent>,
                private readonly messageBoxService: MessageBoxService,
                private readonly queryService: QueryService,
                @Inject(MAT_DIALOG_DATA) public data: RequestNewOutsideSource) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit(){
       this.sportSelected = this.data.sportType;
    }

    public get disableGameType(): boolean {
        return !_.includes(sportSupport.gameTypes, this.sportSelected);
    }

    public changeSport() {
        if(this.disableGameType){
            this.games = _.cloneDeep(DefaultGames);
        }
    }

    public closePopup(): void {
        this.dialogRef.close({ event: 'Close'});
    }

    public addNewSource() {
        this.isButtonClicked = true;
        this.confirmAddSource();
    }

    private confirmAddSource() {
        if (_.isEmpty(this.sourceName)) {
            this.errorMessage = Language.Settings.EmptySourceNameError;
        } else {
            this.dialogMessage.title = Language.Settings.ConfirmationTitle;
            this.dialogMessage.message = Language.Settings.AddSourceConfirmMessage;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.doAddSource();
            });
        }
    }

    private doAddSource() {
        const query = new OutsideSource();
        query.sourceName = this.sourceName;
        query.remark = this.sourceLink;
        query.games = this.disableGameType ? [] : this.games;
        query.sportType = this.sportSelected;
        this.queryService.add(query).subscribe((result: AddSourceResult) => {
            if (result.isSuccessful) {
                query.sourceId = result.sourceId;
                query.sourceStatus = true;
                query.games = this.disableGameType ? DefaultGames : this.games;
                query.sportName = this.sports.find(item => item.sportType === query.sportType).sportName;
                this.dialogRef.close({event: 'Add', newData: query});
            } else {
                this.errorMessage = result.errMsg;
            }
        });
    }

    public isErrorWhenSubmit() {
        return this.isButtonClicked && _.isEmpty(this.sourceName);
    }
}
import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DefaultGames, sportSupport } from "../constants";
import { OutsideSource } from "../models";
import * as _ from 'lodash';
import { ModalDialogMessage, Result } from "../../shared/models";
import { MessageBoxService, HttpRequestService, BlockUIService } from "../../shared/services";
import { QueryService } from "../services";
import { Language } from "../../shared/language";

@Component({
    selector: 'edit-source-dialog',
    templateUrl: 'edit-source-dialog.component.html',
    providers: [
        MessageBoxService,
        QueryService,
        HttpRequestService,
        BlockUIService,
    ]
})
export class EditSourceDialogComponent {
    public isButtonClicked: boolean;
    public outsideSource: OutsideSource;
    public errorMessage: string;
    public disabledGameType: boolean;
    private readonly dialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(public dialogRef: MatDialogRef<EditSourceDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: OutsideSource,
                @Inject(MAT_DIALOG_DATA) public newApi: string,
                private readonly messageBoxService: MessageBoxService,
                private readonly queryService: QueryService) {
        this.outsideSource = _.cloneDeep(data);
        this.dialogRef.disableClose = true;
        this.disabledGameType = !_.includes(sportSupport.gameTypes, data.sportType);
    }

    saveSource() {
        this.isButtonClicked = true;
        this.confirmEditSource();
    }

    closePopup(): void {
        this.dialogRef.close({event: 'Close'});
    }

    private confirmEditSource() {
        if (_.isEmpty(this.outsideSource.sourceName)) {
            this.errorMessage = Language.Settings.EmptySourceNameError;
        } else {
            this.dialogMessage.title = Language.Settings.ConfirmationTitle;
            this.dialogMessage.message = Language.Settings.EditSourceConfirmMessage;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.updateSource();
            });
        }
    }

    private updateSource() {
        this.queryService.updateOutsideSource(this.outsideSource).subscribe((result: Result) => {
            if (result.isSuccessful) {
                this.dialogRef.close({event: 'Save', newData: this.outsideSource});
            } else {
                this.errorMessage = result.errMsg;
            }
        });
    }

    public isErrorWhenSubmit() {
        return this.isButtonClicked && _.isEmpty(this.outsideSource.sourceName);
    }
}
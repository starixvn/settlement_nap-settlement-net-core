import * as _ from 'lodash';
import { Component } from '@angular/core';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { MessageBoxService, VerifyDateService } from '../../services';
import { ModalDialogMessage } from '../../models';
import { Language } from '../../language.native';
@Component({
    selector: "filter-base",
    template: "",
    standalone: true,
})
export class FilterBaseComponent {
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public isDisabled = false;

    constructor(
        protected verifyDateService: VerifyDateService,
        protected messageBoxService: MessageBoxService) {
    }

    public onSelectFromDate(value: NgbDateStruct) {
        this.fromDate = value;
        this.isDisabled = !this.verifyDate();
    }

    public onSelectToDate(value: NgbDateStruct) {
        this.toDate = value;
        this.isDisabled = !this.verifyDate();
    }

    public verifyDate() {
        const isValid = this.verifyDateService.validDate(this.fromDate, this.toDate);
        if (isValid) {
            return true;
        } else {
            this.warningDialogMessage.title = Language.warningTitle;
            this.warningDialogMessage.message = Language.gaming.invalidDate;
            this.messageBoxService.alert(this.warningDialogMessage);
            return false;
        }
    }
}
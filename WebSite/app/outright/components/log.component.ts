import { _isNumberValue } from '@angular/cdk/coercion';
import { CommonModule } from "@angular/common";
import { Component, Injector, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from "../../shared/services";
import { DatepickerComponent } from "../../shared/components/date-picker/date-picker.component";
import { DynamicHeightDirective } from "../../shared/directives";
import { OutrightService } from "../services";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { OutrightLog } from "../models/outright-log.model";
import { ModalDialogMessage } from "../../shared/models";
import { Resources } from "../constants/resources";
import { LogRequest } from "../models/log-request.model";
import { Status } from "../constants";
import * as _ from 'lodash';

@Component({
    selector: 'log',
    templateUrl: './log.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MatDialogModule, DynamicHeightDirective],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, BlockUIService],
})
export default class LogComponent {
    private verifyDateService: VerifyDateService;
    private outrightService: OutrightService;
    private messageBoxService: MessageBoxService;

    public outrightLogs: OutrightLog[] | null = null;
    @Input() request: LogRequest;
    @Input() isPage = false;

    public blockUI = true;
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public matchCode: string;
    public leagueId: number;
    public matchId: number | null;


    public warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        protected injector: Injector,
    ) { }

    ngOnInit(): void {
        this.verifyDateService = this.injector.get(VerifyDateService);
        this.outrightService = this.injector.get(OutrightService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);


        this.initialData();
    }

    public get fromDateStr() {
        return this.verifyDateService.dateFormat(this.fromDate)
    }

    public get toDateStr() {
        return this.verifyDateService.dateFormat(this.toDate)
    }

    private initialData() {
        const date = new Date();
        const fromDateValue = this.request?.fromDate ? this.verifyDateService.convertToDateStruct(this.request.fromDate) : ({ day: date.getDate() - 1, month: date.getMonth() + 1, year: date.getFullYear() });
        const toDateValue = this.request?.toDate ? this.verifyDateService.convertToDateStruct(this.request.toDate) : ({ day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() });

        this.fromDate = fromDateValue;
        this.toDate = toDateValue;
        this.matchCode = this.request?.matchCode ?? '';
        this.leagueId = this.request?.leagueId ?? 0;
        this.matchId = this.request?.matchId ?? null;
        this.request && this.search();
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
        }
    }


    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }

    public submit() {
        this.search(true);
    }

    public search(isSubmit: boolean = false) {

        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);

        if (!this.matchCode) {
            this.showWarningMessage(Resources.matchCode);
            return;
        }

        if (!this.isValidInput(this.fromDate, this.toDate)) {
            this.showWarningMessage(Resources.invalidDate);
            return;
        }

        if (fromDate && toDate && this.matchCode) {
            const request: LogRequest = {
                fromDate,
                toDate,
                matchCode: this.matchCode,
                leagueId: this.leagueId,
                matchId: !isSubmit ? this.matchId : null,
                isSubmit
            }
            this.outrightService.getLogs(request).subscribe(res => {
                this.adjustRemark(res);
                this.outrightLogs = res;
            })
        }
    }

    private adjustRemark(OutrightLogs: OutrightLog[]){
        OutrightLogs.forEach( OutrightLog => {
            OutrightLog.outrightLogDetails.forEach(log => {
                if(_.isEqual(log.result.toLowerCase(), Status.won) && _isNumberValue(log.remark)){
                    log.remarkName = Number(log.remark)> 0 ? `isDeadHeat(yes:${Number(log.remark)})` : `isDeadHeat(no)`;
                    return;
                }

                if(!_.isEmpty(log.result) || _.includes(log.actionNameEn.toLowerCase(), Status.undo)) {
                    log.remarkName = '';
                }
            })
        })
    }

    public onCollapsedClick(outrightLog: OutrightLog) {
        outrightLog.collapsed = !outrightLog.collapsed;
    }

    public getBackgroundIcon(isCollapsed: boolean) {
        return isCollapsed ? "btn-right-up" : "btn-right";
    }

    private showWarningMessage(message: string) {
        this.warningDialogMessage.title = Resources.warningTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }
}
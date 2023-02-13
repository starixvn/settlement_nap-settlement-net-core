import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LogRequest } from '../../models/log-request.model';
import { OutrightLog } from '../../models/outright-log.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicHeightDirective } from '../../../shared/directives';
import { ModalDialogMessage } from '../../../shared/models';
import { Resources } from '../../constants/resources';

@Component({
    selector: 'log',
    templateUrl: './log-popup.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MatDialogModule, DynamicHeightDirective],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, BlockUIService,
        // { provide: MAT_DIALOG_DATA },
    ],
    encapsulation: ViewEncapsulation.None,
})
export class LogPopupComponent implements OnInit {
    private verifyDateService: VerifyDateService;
    private outrightService: OutrightService;
    private messageBoxService: MessageBoxService;
    private dialogRef: MatDialogRef<LogPopupComponent>;

    public blockUI = true;
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public matchCode: string;
    public leagueId: number;
    public matchId: number;
    public outrightLogs: OutrightLog[] = [];
    public warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        protected injector: Injector,
        @Inject(MAT_DIALOG_DATA) public data: LogRequest
    ) { }

    ngOnInit(): void {
        this.verifyDateService = this.injector.get(VerifyDateService);
        this.outrightService = this.injector.get(OutrightService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.dialogRef = this.injector.get(MatDialogRef<LogPopupComponent>);
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
        this.fromDate = this.verifyDateService.convertToDateStruct(this.data?.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(this.data?.toDate);
        this.matchCode = this.data.matchCode;
        this.leagueId = this.data.leagueId;
        this.matchId = this.data.matchId;
        this.search();
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
                this.outrightLogs = res;
            })
        }
    }

    public onCollapsedClick(outrightLog: OutrightLog) {
        outrightLog.collapsed = !outrightLog.collapsed;
    }

    public getBackgroundIcon(isCollapsed: boolean) {
        return isCollapsed ? "btn-right-up" : "btn-right";
    }

    public close() {
        this.dialogRef.close();
    }

    private showWarningMessage(message: string) {
        this.warningDialogMessage.title = Resources.warningTitle;
        this.warningDialogMessage.message = message;
        this.messageBoxService.alert(this.warningDialogMessage);
    }

}

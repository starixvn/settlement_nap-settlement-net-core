import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services/outright.service';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LogRequest } from '../../models/log-request.model';
import { OutrightLog } from '../../models/outright-log.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'log',
    templateUrl: './log.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent, MatDialogModule],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService, BlockUIService,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class LogComponent implements OnInit {
    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public matchCode: string;
    public leagueId: number;
    public outrightLogs: OutrightLog[] = [];
    public blockUI = true;

    constructor(
        private readonly verifyDateService: VerifyDateService,
        private readonly outrightService: OutrightService,
        private readonly blockUIService: BlockUIService,
        public dialogRef: MatDialogRef<LogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: LogRequest,

    ) { }

    ngOnInit(): void {
        console.log(this.data);
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);

        this.initialData();
    }

    private initialData() {
        this.fromDate = this.verifyDateService.convertToDateStruct(this.data.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(this.data.toDate);
        this.matchCode = this.data.matchCode;
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

    public search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);

        if (fromDate && toDate && this.matchCode) {
            const request: LogRequest = {
                fromDate,
                toDate,
                matchCode: this.matchCode,
                leagueId: this.leagueId
            }
            this.outrightService.getLogs(request).subscribe(res => {

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

}

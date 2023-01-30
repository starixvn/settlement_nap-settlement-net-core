import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services/outright.service';
import { HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LogRequest } from '../../models/log-request.model';
import { OutrightLog } from '../..//models/outright-log.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';

@Component({
    selector: 'log',
    templateUrl: './log.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DatepickerComponent],
    providers: [VerifyDateService, OutrightService, HttpRequestService, MessageBoxService]

})
export class LogComponent implements OnInit {

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public matchCode: string;
    public leagueId: number;
    public outrightLogs: OutrightLog[];

    constructor(private readonly verifyDateService: VerifyDateService,
        private readonly outrightService: OutrightService
    ) { }

    ngOnInit(): void {
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

        const request: LogRequest = {
            fromDate,
            toDate,
            matchCode: this.matchCode,
            leagueId: this.leagueId
        }

        console.log('request', request);

        this.outrightService.getLogs(request).subscribe(res => {

        })
    }

    public onCollapsedClick(outrightLog: OutrightLog) {
        outrightLog.collapsed = !outrightLog.collapsed;
    }

    public getBackgroundIcon(isCollapsed: boolean) {
        return isCollapsed ? "btn-right-up" : "btn-right";
    }

}

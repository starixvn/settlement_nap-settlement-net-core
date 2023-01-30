import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services/outright.service';
import { VerifyDateService } from '../../../shared/services';
import { LogRequest } from '../../models/log-request.model';
import { OutrightLog } from '../..//models/outright-log.model';

@Component({
    selector: 'log',
    templateUrl: './log.component.html'
})
export class LogComponent implements OnInit {

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;
    public matchCode: string;
    public leagueId: number;
    public outrightLog: OutrightLog;

    public get outrightLogDetails() {
        return this.outrightLog?.outrightDetails ?? [];
    }

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

        this.outrightService.getLogs(request).subscribe(res => {

        })
    }

}

import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { League, Sport } from '../../models';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { Statuses } from '../../constants/Status';
import { VerifyDateService } from '../../../shared/services';
import { OutrightService } from '../../services/outright.service';
// import { CustomNgbDateParserFormatter } from 'shared/components/date-picker/custom-ngb-date-parser-formatter';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent implements OnInit {

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;

    public sportSelected: string;
    public sportOptions: Sport[] = [];

    public leagueSelected: string;
    public leagueOptions: League[] = [];

    public statusOptions: any[] = Statuses;
    public statusSelected: string;

    constructor(
        private verifyDateService: VerifyDateService,
        private outrightService: OutrightService) { }

    ngOnInit(
    ): void {
        this.renderLeague();
        this.renderSport();
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            // this.getSport(this.fromDate, this.toDate);
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
            // this.getSport(this.fromDate, this.toDate);
        }
    }

    private async renderLeague() {
        const all: League = {
            leagueId: 0,
            leagueName: '--- Show ALL Leagues ---'
        }

        this.leagueOptions = [all];
    }

    private renderSport() {
        const soccer: Sport = {
            sportId: 1,
            sportName: 'Soccer'
        }

        this.sportOptions = [soccer];
    }

    private async getSports(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);
    //    const sports = await this.outrightService.getSport(params).toPromise() as  Sport[];
        this.sportOptions = [];
    }

    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }


    search() { }

}

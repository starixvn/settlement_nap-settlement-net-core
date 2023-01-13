import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { League, Sport } from '../../models';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { allLeague, Statuses } from '../../constants/Options';
import { VerifyDateService } from '../../../shared/services';
import { OutrightService } from '../../services/outright.service';
import { FilterRequest } from '../../models/filter-request.model';
// import { CustomNgbDateParserFormatter } from 'shared/components/date-picker/custom-ngb-date-parser-formatter';

@Component({
    selector: 'filter',
    templateUrl: './filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly requestEmitter = new EventEmitter();
    @Output() public readonly enableRefresh = new EventEmitter();

    public fromDate: NgbDateStruct;
    public toDate: NgbDateStruct;

    public sportSelected: number;
    public sportOptions: Sport[] = [];

    public leagueSelected: number;
    public leagueOptions: League[] = [];

    public statusOptions: any[] = Statuses;
    public statusSelected: number;

    public moveBetsDay: NgbDateStruct;

    constructor(
        private verifyDateService: VerifyDateService,
        private outrightService: OutrightService) { }

    ngOnInit(
    ): void {
        this.initFilterData();
    }

    private initFilterData() {
        this.outrightService.getFilterView().subscribe((res: any) => {
            this.fromDate = this.verifyDateService.convertToDateStruct(res.fromDate);
            this.toDate = this.verifyDateService.convertToDateStruct(res.toDate);
            this.moveBetsDay = this.verifyDateService.convertToDateStruct(res.moveBetsDay);

            this.sportOptions = res.sports;
            this.leagueOptions = [allLeague, ...res.leagues];
            this.leagueSelected = 0;
            this.sportSelected = 1;
            this.statusSelected = 0;
        })
    }

    public onSelectFromDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.fromDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
        }
    }

    public onSelectToDate(value: NgbDateStruct) {
        if (value.day !== undefined) {
            this.toDate = value;
            this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
        }
    }

    public onSelectSport(value: any) {
        this.sportSelected = value;
        this.renderLeague(this.fromDate, this.toDate, this.sportSelected)
    }

    private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct, sportType: number) {
        const fromDateValue = this.verifyDateService.dateFormat(fromDate);
        const toDateValue = this.verifyDateService.dateFormat(toDate);

        this.outrightService.getLeagues({ fromDate: fromDateValue, toDate: toDateValue, sportType }).subscribe(res => {
            this.leagueOptions = [allLeague, ...res]
        })
    }


    private isValidInput(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        return this.verifyDateService.validDate(fromDate, toDate);
    }


    search() {
        const fromDate = this.verifyDateService.dateFormat(this.fromDate);
        const toDate = this.verifyDateService.dateFormat(this.toDate);
        const moveBetsDay = this.verifyDateService.dateFormat(this.moveBetsDay);

        const request: FilterRequest = {
            fromDate: fromDate,
            toDate,
            statusId: this.statusSelected,
            sportType: this.sportSelected,
            leagueId: this.leagueSelected,
            moveBetsDay
        }

        console.log(request)

        if (!this.isValidInput(this.fromDate, this.toDate)) {
            return;
        }

        if (this.sportSelected < 0) {
            return;
        }

        if (this.leagueSelected < 0) {
            return;
        }

        this.outrightService.filter(request).subscribe(res => {
            this.searchAction.emit(res);
            this.requestEmitter.emit(request);
        })
    }
}

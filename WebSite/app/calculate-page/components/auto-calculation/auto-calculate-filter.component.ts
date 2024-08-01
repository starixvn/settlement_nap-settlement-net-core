import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { FilterAutoQuery, LeagueQuery } from '../../models';
import { RequestService } from '../../services';
import * as _ from 'lodash';
import { ItemsSelect, League, MultipleSelect } from '../../../shared/models';
import { AutoCalculateService } from './auto-calculate.service';
import { Statuses } from '../../constants';
import { FilterBaseComponent } from '../../../shared/components/gaming/filter-base.component';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';

@Component({
    selector: 'auto-calculate-filter',
    templateUrl: './auto-calculate-filter.component.html',
    providers: [DatePipe,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
    standalone: true,
    imports: [
    DatepickerComponent,
    ReactiveFormsModule,
    FormsModule,
    NewMultipleSelectComponent
],
})
export class AutoCalculateFilterComponent extends FilterBaseComponent implements OnInit {
    @Output() public readonly searchAction = new EventEmitter();
    @Output() public readonly disableRefresh = new EventEmitter();
    public statuses = Statuses;
    public leagues: League[];
    private readonly completedWithRunningTicket = "16";
    public readonly query = new FilterAutoQuery();
    public payoutSelect = new MultipleSelect();
    constructor(
        protected verifyDateService: VerifyDateService,
        protected messageBoxService: MessageBoxService,
        private readonly requestService: RequestService,
        private readonly autoCalculateService: AutoCalculateService
    ) {
        super(verifyDateService, messageBoxService);
    }

    public ngOnInit() {
        this.defaultDateFilter();
        this.initFilterData();
    }

    private defaultDateFilter() {
        this.query.statusId = Number(this.statuses[0].value);
        this.query.leagueId = '0';
        this.payoutSelect.items = this.autoCalculateService.createAutoPayoutFilter();
        this.statuses = this.statuses.filter(status => status.value !== this.completedWithRunningTicket);
    }

    public async initFilterData() {
        const date = await this.requestService.getDate();
        this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
        this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
        this.renderLeague(this.fromDate, this.toDate);
    }

    public onSelectFromDate(value: NgbDateStruct) {
        this.fromDate = value;
        this.isDisabled = !this.verifyDate();
        this.renderLeague(this.fromDate, this.toDate);
    }

    public onSelectToDate(value: NgbDateStruct) {
        this.toDate = value;
        this.isDisabled = !this.verifyDate();
        this.renderLeague(this.fromDate, this.toDate);
    }

    private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
        const allLeague = new League();
        allLeague.leagueId = 0;
        allLeague.leagueName = '--- Show ALL Leagues ---';

        if (this.verifyDateService.validDate(this.fromDate, this.toDate)) {
            const fromDateValue = this.verifyDateService.dateFormat(fromDate);
            const toDateValue = this.verifyDateService.dateFormat(toDate);
            const query = new LeagueQuery(fromDateValue, toDateValue);
            const league = await this.requestService.getLeague(query);
            this.leagues = [allLeague, ...league];
        } else {
            this.leagues = [allLeague];
        }
    }

    public async search() {
        this.query.fromDate = this.verifyDateService.dateFormat(this.fromDate);
        this.query.toDate = this.verifyDateService.dateFormat(this.toDate);

        this.disableRefresh.emit(true);
        this.requestService.searchAutoCalculation(this.query).then(calculation => {
            this.searchAction.emit({ calculation, filterQuery: this.query });
            this.disableRefresh.emit(false);
        });
    }

    public onSelectPayout(value: ItemsSelect[]) {
        this.query.autoSetting = value.length > 0 && value.length < this.payoutSelect.items.length ? value.map(item => Number(item.value)).join() : '';
    }
}

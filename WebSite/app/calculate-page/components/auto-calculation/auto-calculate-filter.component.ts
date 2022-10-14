import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { Calculation, FilterAutoQuery, LeagueQuery } from '../../models';
import { RequestService } from '../../services';
import * as _ from 'lodash';
import { FilterCalculateBaseComponent } from '../base-component';
import { ItemsSelect, League, Match, MultipleSelect } from '../../../shared/models';
import { AutoCalculateService } from './auto-calculate.service';

@Component({
  selector: 'auto-calculate-filter',
  templateUrl: './auto-calculate-filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class AutoCalculateFilterComponent extends FilterCalculateBaseComponent implements OnInit {
  private readonly completedWithRunningTicket = "16";
  public readonly query = new FilterAutoQuery();
  public payoutSelect= new MultipleSelect();
  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    protected requestService: RequestService,
    private readonly autoCalculateService: AutoCalculateService
  ) {
    super(verifyDateService, messageBoxService, requestService);
  }

  public ngOnInit() {
    this.defaultDateFilter();
    this.initFilterData();
  }

  public async initFilterData () {
    const date = await this.requestService.getDate().toPromise();
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

  public async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
    const allLeague = new League();
    allLeague.leagueId = 0;
    allLeague.leagueName = '--- Show ALL Leagues ---';

    if (this.verifyDateService.validDate(this.fromDate, this.toDate)) {
      const fromDateValue = this.verifyDateService.dateFormat(fromDate);
      const toDateValue = this.verifyDateService.dateFormat(toDate);
      var query = new LeagueQuery(fromDateValue, toDateValue);
      const league = await this.requestService.getLeague(query).toPromise() as League[];
      this.leagues = [allLeague, ...league];
    } else {
      this.leagues = [allLeague];
    }
  }

  private defaultDateFilter() {
    this.query.statusId = Number(this.statuses[0].value);
    this.query.leagueId = '0';
    this.payoutSelect.items = this.autoCalculateService.createAutoPayoutFilter();
    this.statuses = this.statuses.filter(status => status.value !== this.completedWithRunningTicket);
  }

  public async search() {
    this.query.fromDate = this.verifyDateService.dateFormat(this.fromDate);
    this.query.toDate = this.verifyDateService.dateFormat(this.toDate);

    this.requestService.searchAutoCalculation(this.query).subscribe((calculation: Calculation) => {
      this.searchAction.emit({ calculation, filterQuery: this.query });
    });
  }

  public onSelectPayout(value: ItemsSelect[]) {
    this.query.autoSetting = value.length > 0 && value.length < this.payoutSelect.items.length ? value.map(item => Number(item.value)).join() : '';
  }
}

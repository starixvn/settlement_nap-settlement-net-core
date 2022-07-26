import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FilterBaseComponent } from '../../shared/components/gaming/filter-base.component';
import { CustomNgbDateParserFormatter } from '../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../shared/services';
import { FilterQuery, LeagueQuery, Matches } from '../models';
import { Statuses } from '../Constants';
import { CalculatePageService } from '../services';
import { League } from '../../shared/models';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent extends FilterBaseComponent implements OnInit, OnChanges {
  @Output() public readonly searchAction = new EventEmitter();
  public query = new FilterQuery();
  public readonly statuses = Statuses;
  public leagues: League[];

  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    private readonly calculatePageService: CalculatePageService) {
    super(verifyDateService, messageBoxService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    throw new Error('Method not implemented.');
  }

  async ngOnInit(): Promise<void> {
    this.query.statusId = Number(this.statuses[0].value);
    this.query.leagueId = '0';
    const date = await this.calculatePageService.getDate().toPromise();
    this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
    this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
    this.renderLeague(this.fromDate, this.toDate);
  }

  public async search() {
    const fromDate = this.verifyDateService.dateFormat(this.fromDate);
    const toDate = this.verifyDateService.dateFormat(this.toDate);
    this.query.fromDate = this.verifyDateService.dateFormat(this.fromDate);
    this.query.toDate = this.verifyDateService.dateFormat(this.toDate);

    this.calculatePageService.search(this.query).subscribe((matches: Matches) => {
      this.searchAction.emit({ matches, fromDate, toDate });
    });
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
    allLeague.leagueName = '--- Show ALl Leagues ---';

    if (this.verifyDateService.validDate(this.fromDate, this.toDate)) {
      const fromDateValue = this.verifyDateService.dateFormat(fromDate);
      const toDateValue = this.verifyDateService.dateFormat(toDate);
      var query = new LeagueQuery(fromDateValue, toDateValue);
      const league = await this.calculatePageService.getLeague(query).toPromise() as League[];
      this.leagues = [allLeague, ...league];
    } else {
      this.leagues = [allLeague];
    }
  }

}

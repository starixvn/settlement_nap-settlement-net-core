import { GenerateFilterService } from './../../services';
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { Calculation, FilterQuery, LeagueQuery } from '../../models';
import { RequestService } from '../../services';
import * as _ from 'lodash';
import { ItemsSelect, League, MultipleSelect } from '../../../shared/models';
import { FilterBaseComponent } from '../../../shared/components/gaming/filter-base.component';
import { MatchType, OverStatus } from '../../constants';
import { _isNumberValue } from '@angular/cdk/coercion';
import { Language } from '../../../shared/language.native';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { AutoReFilterComponent } from '../../../shared/components/auto-re-filter/auto-re-filter.component';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
  standalone: true,
  imports: [
    CommonModule,
    DatepickerComponent,
    ReactiveFormsModule,
    FormsModule,
    NewMultipleSelectComponent,
    AutoReFilterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent extends FilterBaseComponent implements OnInit {
  @Output() public readonly searchAction = new EventEmitter();
  @Output() public readonly disableRefund = new EventEmitter();
  @Output() public readonly disableRefresh = new EventEmitter();
  private readonly defaultValue = '0';
  public query = new FilterQuery();
  public overStatus = OverStatus;
  public matchTypes = MatchType;
  public leagues: League[];
  public leagueSelect = new MultipleSelect();
  public matchStatusSelect = new MultipleSelect();
  public holdStatusSelect = new MultipleSelect();
  private readonly leagueWidth = "70%";
  private readonly MatchStatusWidth = "200px";
  previousQuery: FilterQuery | null = null;
  countdown = signal(null);
  disableAutoReFilter = true;

  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    private readonly requestService: RequestService,
    private readonly generateFilterService: GenerateFilterService,
    private readonly changeDetectorRef: ChangeDetectorRef) {
    super(verifyDateService, messageBoxService);
  }

  public ngOnInit() {
    this.query.filterOver = 0;
    this.query.matchType = 0;
    this.generateFilter();
    this.initFilterData();
  }

  public async search() {
    this.query.fromDate = this.verifyDateService.dateFormat(this.fromDate);
    this.query.toDate = this.verifyDateService.dateFormat(this.toDate);
    if (this.validateQuery()) {
      return;
    }
    this.filter(this.query);
    this.previousQuery = { ...this.query };
    this.disableAutoReFilter = false;
  }

  private async filter(query: FilterQuery) {
    this.disableRefresh.emit(true);
    this.requestService.search(query).then(calculation => {
      this.disableRefund.emit(_.isEmpty(query.matchCode) && !_.isEqual(query.filterOver.toString(), this.overStatus[0].value));
      this.searchAction.emit({ calculation, filterQuery: query });
      this.disableRefresh.emit(false);
    });
  }

  private generateFilter() {
    this.matchStatusSelect.items = this.generateFilterService.renderMatchStatus();
    this.holdStatusSelect.items = this.generateFilterService.renderRemarks();
    this.matchStatusSelect.haveGroup = true;
    this.matchStatusSelect.maxWidth = this.MatchStatusWidth;
    this.holdStatusSelect.maxWidth = this.MatchStatusWidth;
    this.leagueSelect.maxWidth = this.leagueWidth;
  }

  public async initFilterData() {
    const date = await this.requestService.getDate();
    this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
    this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
    this.renderLeague(this.fromDate, this.toDate);
  }

  public onSelectFromDate(value: NgbDateStruct) {
    this.fromDate = value;
    this.renderLeague(this.fromDate, this.toDate);
  }

  public onSelectToDate(value: NgbDateStruct) {
    this.toDate = value;
    this.renderLeague(this.fromDate, this.toDate);
  }

  private initLeague(leagues: League[]) {
    const showAllLeagues = "--- Show All Leagues ---";
    this.leagueSelect = new MultipleSelect();
    this.leagueSelect.allItemsCheckedText = showAllLeagues;
    this.leagueSelect.maxWidth = this.leagueWidth;
    this.leagueSelect.enableSearchBox = true;
    this.leagueSelect.disableCheckAll = true;
    this.leagueSelect.items = this.generateFilterService.renderLeagues(leagues);
  }

  private async renderLeague(fromDate: NgbDateStruct, toDate: NgbDateStruct) {
    const fromDateValue = this.verifyDateService.dateFormat(fromDate);
    const toDateValue = this.verifyDateService.dateFormat(toDate);
    if (this.verifyDateService.validDate(this.fromDate, this.toDate)) {
      const query = new LeagueQuery(fromDateValue, toDateValue);
      const league = await this.requestService.getLeague(query);
      this.initLeague(league);
    } else {
      this.initLeague([]);
    }
    this.changeDetectorRef.detectChanges();
  }

  public onSelectLeague(value: ItemsSelect[]) {
    this.query.leagueIds = value.length > 0 ? value.map(item => Number(item.value)).join() : this.defaultValue;
  }

  public onSelectMatchStatus(value: ItemsSelect[]) {
    this.query.matchStatus = value.length > 0 ? value.map(item => Number(item.value)).join() : this.defaultValue;
  }

  public onSelectHoldStatus(value: ItemsSelect[]) {
    this.query.holdStatus = value.length > 0 ? value.map(item => Number(item.value)).join() : this.defaultValue;
  }

  private validateQuery() {
    if ((_.isEmpty(this.query.matchCode) || _.isUndefined(this.query.matchCode))
      && _.isEqual(this.query.leagueIds, this.defaultValue)
      && _.isEqual(this.query.filterOver.toString(), this.overStatus[0].value)
      && _.isEqual(this.query.matchType.toString(), this.matchTypes[0].value)) {
      this.warningDialogMessage.title = Language.warningTitle;
      this.warningDialogMessage.message = Language.calculatePageWarning;
      this.messageBoxService.alert(this.warningDialogMessage);
      return true;
    }

    return false;
  }

  refilter() {
    if (this.previousQuery) {
      this.filter(this.previousQuery);
    }
  }
}

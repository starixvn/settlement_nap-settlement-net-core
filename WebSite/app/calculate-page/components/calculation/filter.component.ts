import { GenerateFilterService } from './../../services';
import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
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
  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    private readonly requestService: RequestService,
    private readonly generateFilterService: GenerateFilterService) {
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

    this.disableRefresh.emit(true);
    this.requestService.search(this.query).subscribe((calculation: Calculation) => {
      this.disableRefund.emit(_.isEmpty(this.query.matchCode) && !_.isEqual(this.query.filterOver.toString(), this.overStatus[0].value));
      this.searchAction.emit({ calculation, filterQuery: this.query });
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
      var query = new LeagueQuery(fromDateValue, toDateValue);
      const league = await this.requestService.getLeague(query);
      this.initLeague(league);
    } else {
      this.initLeague([]);
    }
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
}

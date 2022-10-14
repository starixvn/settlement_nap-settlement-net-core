import { Component, EventEmitter, Output } from '@angular/core';
import {  NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FilterBaseComponent } from '../../../shared/components/gaming/filter-base.component';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { FilterQuery, LeagueQuery } from '../../models';
import { Statuses } from '../../constants';
import { RequestService } from '../../services';
import { League } from '../../../shared/models';
import * as _ from 'lodash';

@Component({
  selector: 'filter-calculate-base',
  template: '',
})
export class FilterCalculateBaseComponent extends FilterBaseComponent{
  @Output() public readonly searchAction = new EventEmitter();
  public statuses = Statuses;
  public leagues: League[];

  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    protected requestService: RequestService) {
    super(verifyDateService, messageBoxService);
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

}

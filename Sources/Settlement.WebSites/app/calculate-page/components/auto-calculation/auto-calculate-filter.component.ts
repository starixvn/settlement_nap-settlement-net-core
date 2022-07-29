import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { Matches } from '../../models';
import { RequestService } from '../../services';
import * as _ from 'lodash';
import { FilterCalculateBaseComponent } from '../base-component';
import { ItemsSelect, Match, MultipleSelect } from '../../../shared/models';
import { AutoCalculateService } from './auto-calculate.service';

@Component({
  selector: 'auto-calculate-filter',
  templateUrl: './auto-calculate-filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class AutoCalculateFilterComponent extends FilterCalculateBaseComponent implements OnInit {
  private readonly completedWithRunningTicket = "16";
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
    this.initData();
  }

  private async initData() {
    const date = await this.requestService.getDate().toPromise();
    this.fromDate = this.verifyDateService.convertToDateStruct(date.fromDate);
    this.toDate = this.verifyDateService.convertToDateStruct(date.toDate);
    this.renderLeague(this.fromDate, this.toDate);
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

    this.requestService.search(this.query).subscribe((matches: Matches) => {
      this.searchAction.emit({ matches, filterQuery: this.query });
    });
  }

  public onSelectPayout(value: ItemsSelect[]) {
    this.query.autoSetting = value.map(item => Number(item.value)).join();
  }

  public getCLassInstant(match: Match){
    
  }
}

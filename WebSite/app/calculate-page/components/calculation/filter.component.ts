import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { MessageBoxService, VerifyDateService } from '../../../shared/services';
import { Calculation } from '../../models';
import { RequestService } from '../../services';
import * as _ from 'lodash';
import { FilterCalculateBaseComponent } from '../base-component';

@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  providers: [DatePipe,
    { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],
})
export class FilterComponent extends FilterCalculateBaseComponent implements OnInit{
  constructor(
    protected verifyDateService: VerifyDateService,
    protected messageBoxService: MessageBoxService,
    protected requestService: RequestService) {
    super(verifyDateService, messageBoxService, requestService);
  }

  async ngOnInit() {
    this.query.statusId = Number(this.statuses[0].value);
    this.query.leagueId = '0';
    this.query.filterOver = 0;
    this.initFilterData();
  }

  public async search() {
    this.query.fromDate = this.verifyDateService.dateFormat(this.fromDate);
    this.query.toDate = this.verifyDateService.dateFormat(this.toDate);

    this.requestService.search(this.query).subscribe((calculation: Calculation) => {
      this.searchAction.emit({ calculation, filterQuery: this.query });
    });
  }
}

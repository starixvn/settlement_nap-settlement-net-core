import { FilterQuery } from './../../models/filter-query.model';
import { Component, ElementRef } from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { PageBaseComponent } from '../base-component';
import { MatchesComponent } from './matches.component';

import { FilterComponent } from './filter.component';

@Component({
    selector: 'calculate-page',
    templateUrl: './page.component.html',
    providers: [
        ReCheckInService,
    ],
    standalone: true,
    imports: [
    FilterComponent,
    MatchesComponent
],
})
export class PageComponent extends PageBaseComponent {
  public disableRefund: boolean;
  public filterQuery: FilterQuery;
  public disableRefresh: boolean;
  constructor(protected reCheckInService: ReCheckInService,
    protected elementRef: ElementRef<HTMLElement>,
  ) { super(reCheckInService, elementRef); }

    public getInfoDisableRefund(event) {
      this.disableRefund = event;
    }

    public search($event) {
      this.calculation = $event.calculation;
      this.filterQuery = $event.filterQuery;
  }

  public getInfoDisableRefresh(event){
    this.disableRefresh = event;
  }
}

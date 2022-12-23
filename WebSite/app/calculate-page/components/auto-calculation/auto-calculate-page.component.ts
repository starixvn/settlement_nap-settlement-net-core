import { FilterAutoQuery } from './../../models/filter-auto-query.model';
import { Component, ElementRef } from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { PageBaseComponent } from '../base-component';

@Component({
  selector: 'auto-calculate-page',
  templateUrl: './auto-calculate-page.component.html'
})
export class AutoCalculatePageComponent extends PageBaseComponent {
  public filterQuery: FilterAutoQuery;
  public disableRefresh: boolean;
  constructor(protected reCheckInService: ReCheckInService,
    protected elementRef: ElementRef<HTMLElement>) {
    super(reCheckInService, elementRef);
  }

  public search($event) {
    this.calculation = $event.calculation;
    this.filterQuery = $event.filterQuery;
  }

  public getInfoDisableRefresh(event){
    this.disableRefresh = event;
  }
}

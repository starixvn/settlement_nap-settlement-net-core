import { Component, ElementRef} from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { PageBaseComponent } from '../base-component';
import { AutoCalculateService } from './auto-calculate.service';

@Component({
  selector: 'auto-calculate-page',
  templateUrl: './auto-calculate-page.component.html'
})
export class AutoCalculatePageComponent extends PageBaseComponent {
  constructor(protected reCheckInService: ReCheckInService,
    protected elementRef: ElementRef<HTMLElement>) { 
      super(reCheckInService, elementRef);
    }
}

import { Component, ElementRef} from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { PageBaseComponent } from '../base-component';

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

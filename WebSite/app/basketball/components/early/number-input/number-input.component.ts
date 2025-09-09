import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFinalBaseComponent, InputOutSideBaseComponent } from '../input-base.component';
import { OnlyIntegerDirective } from '../../../../shared/directives/only-integer.directive.native';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <input type="text" myOnlyInteger [(ngModel)]="item.homeValue" [disabled]="!enable"  (ngModelChange)="checkResultIsMatched(item)">
  `
})
export class NumberInputComponent extends InputFinalBaseComponent {
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, OnlyIntegerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <input type="text" myOnlyInteger [(ngModel)]="externalResult.homeValue" [disabled]="!enable" (ngModelChange)="verifyAndAutoFillResult(resultDetail)">
  `
})
export class NumberInputOutSideComponent extends InputOutSideBaseComponent {
}

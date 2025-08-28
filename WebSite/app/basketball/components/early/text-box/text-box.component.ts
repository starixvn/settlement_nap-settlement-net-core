import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputFinalBaseComponent, InputOutSideBaseComponent } from '../input-base.component';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <input type="text" [(ngModel)]="item.homeValue" [disabled]="!enable"  (ngModelChange)="checkResultIsMatched(item)">
  `
})
export class TextBoxComponent extends InputFinalBaseComponent {
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <input type="text" [(ngModel)]="externalResult.homeValue" [disabled]="!enable" (ngModelChange)="checkResultIsMatched(resultDetail)">
  `
})
export class TextBoxOutSideComponent extends InputOutSideBaseComponent {
}

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputFinalBaseComponent, InputOutSideBaseComponent } from "../input-base.component";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <select [disabled]="!enable" [value]="item.homeValue">
    <option value="Y">Yes</option>
    <option value="N">No</option>
    <option value="None">None</option>
  </select>
  `
  })
export class YesNoNoneComponent extends InputFinalBaseComponent {
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <select [disabled]="!enable" [value]="externalResult.homeValue">
    <option value="Y">Yes</option>
    <option value="N">No</option>
    <option value="None">None</option>
  </select>
  `
})
export class YesNoNoneOutSideComponent extends InputOutSideBaseComponent {
}
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'resettle-checker',
  templateUrl: './resettle-checker.component.html',
})
export class ResettleCheckerComponent {
  @Output() public proceedEvent = new EventEmitter();
  @Input() public checked: boolean;

  public onCheckboxChange(isChecked: boolean) {
    this.proceedEvent.emit(isChecked);
  }
}
import { FormsModule } from '@angular/forms';
import { Component, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'resettle-checker',
  templateUrl: './resettle-checker.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class ResettleCheckerComponent {
  @Output() public proceedEvent = new EventEmitter();
  @Input() public checked: boolean;

  onCheckboxChange(isChecked: boolean) {
    this.proceedEvent.emit(isChecked);
  }
}
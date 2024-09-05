import { Component, input, output } from "@angular/core";

@Component({
  templateUrl:'./sdtsettle-checker.component.html',
})
export class SdtSettleCheckerComponent {
  checked = input<boolean>(false);
  onSdtChange = output<boolean>();

  onChange(value: boolean) {
    this.onSdtChange.emit(value);
  }
}
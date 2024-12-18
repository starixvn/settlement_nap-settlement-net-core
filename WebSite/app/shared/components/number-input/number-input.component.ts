import { Component, forwardRef, Input, input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "app-number-input",
  standalone: true,
  imports: [],
  templateUrl: "./number-input.component.html",
  styleUrl: "./number-input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
})
export class NumberInputComponent implements ControlValueAccessor {
  @Input() min? = 0;
  @Input() max? = 9999;

  private onChange = (value: number) => {};
  private onTouched = () => {};

  currentValue : number | null = 0;
  disabled = false;

  onInputChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const inputValue = input.value === "" ? null : parseInt(input.value);
    if (this.isValidNumber(inputValue)) {
      this.currentValue = inputValue;
      this.onChange(inputValue);
    } else {
      input.value = "0"
      this.onChange(0)
    }
  }

  writeValue(value: number): void {
    this.currentValue = value;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private isValidNumber(value: number | null): boolean {
    if (value === null || isNaN(value)) {
      return false;
    }
    if (this.min !== undefined && value < this.min) return false;
    if (this.max !== undefined && value > this.max) return false;
    return true;
  }
}

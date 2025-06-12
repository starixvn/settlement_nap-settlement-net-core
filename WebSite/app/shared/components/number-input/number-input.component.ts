import { Component, forwardRef, Input } from "@angular/core";
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

  private onChange = (value: number | null) => {};
  private onTouched = () => {};

  currentValue : number | null = null;
  disabled = false;

  onInputChange($event: Event) {
    const input = $event.target as HTMLInputElement;
    const inputValue = input.value;
    if(inputValue === '') {
      this.currentValue = 0;
      this.onChange(this.currentValue);
      input.value = "0";
      return;
    }
    
    const cleanedValue = inputValue.replace(/[^0-9\-+]/g, '');
    const isValidInteger = /^[-+]?\d*$/.test(cleanedValue);
    if(isValidInteger && this.isValidNumber(+cleanedValue)) {
      this.currentValue = +cleanedValue;
      this.onChange(this.currentValue);
    } else { 
      input.value = this.currentValue?.toString() || "";
    }
  }

  writeValue(value: number | null): void {
    this.currentValue = value;
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private isValidNumber(value: number | null): boolean {
    if (this.min !== undefined && value < this.min) {
      return false;
    }

    if (this.max !== undefined && value > this.max) {
      return false;
    }
    
    return true;
  }
}

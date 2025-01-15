import {Component, forwardRef, Input} from "@angular/core";
import {NgClass, NgIf} from "@angular/common";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
    selector: "app-switch",
    templateUrl: './switch.component.html',
    styleUrls: ['./switch.component.less'],
    imports: [
        NgClass,
        NgIf
    ],
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SwitchComponent),
            multi: true,
        },
    ],
})
export class SwitchComponent implements ControlValueAccessor {
    @Input() labelOff = 'No';
    @Input() labelOn = 'Yes';
    @Input() variant = '';
    @Input() size = 'mini';

    private onChange: (value: boolean) => void = () => {};
    private onTouched: () => void = () => {};

    checked = true;
    disabled = false;

    writeValue(value: boolean): void {
        this.checked = value;
    }

    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    toggleSwitch() {
        if(this.disabled) {
            return;
        }
        this.checked = !this.checked;
        this.onChange(this.checked);
        this.onTouched();

    }
}

import {Component, forwardRef, Input, OnInit} from "@angular/core";
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
    @Input() labelOff: string = 'No';
    @Input() labelOn: string = 'Yes';
    @Input() variant: string = 'yes';
    @Input() size: string = 'mini';

    private onChange: (value: boolean) => void = () => {};
    private onTouched: () => void = () => {};

    checked: boolean = true;
    disabled: boolean = false;

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

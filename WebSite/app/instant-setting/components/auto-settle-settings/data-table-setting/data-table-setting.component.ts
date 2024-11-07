import {Component, OnInit} from "@angular/core";
import {OnlyIntegerDirective} from "../../../../shared/directives";
import {ReactiveFormsModule} from "@angular/forms";
import {ToastContainerModule} from "ngx-toastr";
import {ZeroFallbackDirective} from "../../../../shared/directives/zero-fall-back.directive.native";
import {AutoSetting} from "../types";
import {NgClass} from "@angular/common";

@Component({
    selector: "app-auto-setting",
    templateUrl: `./data-table-setting.component.html`,
    imports: [
        OnlyIntegerDirective,
        ReactiveFormsModule,
        ToastContainerModule,
        ZeroFallbackDirective,
        NgClass
    ],
    standalone: true
})
export class DataTableSettingComponent implements OnInit {
    ngOnInit(): void {
    }
    public title: string = "ABCDEFGHIJKLMNOPQRS";
    public minProviderOptions = [0,1,2];
    public autoSettings : AutoSetting[] =[{
        typeObject: "League",
        typeSettle: "Payout",
        typeResult: "Main",
        enabled: true,
        isTraderRequired: true,
        waitingTime: 18000,
        minProvider: 1,
        providers: [{
            priority: 1,
            sourceName: "XX",
            sourceId: 1
        }]
    }]

    submit() {}

    cancel() {}
}
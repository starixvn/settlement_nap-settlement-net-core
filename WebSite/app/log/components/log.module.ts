import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {NewMultipleSelectComponent} from "../../shared/components/multiple-select/multiple-select.component";
import { MaterialModule } from "../../shared/material-module";

import {
    BlockUIService,
    DialogBoxService,
    HttpRequestService,
    MessageBoxService,
    ReCheckInService,
    VerifyDateService
} from "../../shared/services";
import { ProviderService } from '../services'
@NgModule({
    imports: [
        MaterialModule,
        NewMultipleSelectComponent,
        NoopAnimationsModule
    ],
    declarations: [
    ],
    providers: [
        VerifyDateService,
        MessageBoxService,
        BlockUIService,
        HttpRequestService,
        NgbActiveModal,
        ReCheckInService,
        DialogBoxService,
        ProviderService
    ]
})

export class LogModule { }
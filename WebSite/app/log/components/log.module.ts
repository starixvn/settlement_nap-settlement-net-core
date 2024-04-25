import { NgModule } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DatePipe } from '@angular/common';

import {
    BlockUIService,
    DialogBoxService,
    HttpRequestService,
    MessageBoxService,
    ReCheckInService,
    VerifyDateService
} from "../../shared/services";
import {
    SearchService,
    ResultSoccerService,
    ResultOtherSportService,
    ProviderService
} from '../services';


@NgModule({
    providers: [
        DatePipe,
        VerifyDateService,
        MessageBoxService,
        BlockUIService,
        HttpRequestService,
        NgbActiveModal,
        ReCheckInService,
        DialogBoxService,
        ProviderService,
        SearchService,
        ResultOtherSportService,
        ResultSoccerService,
        DatePipe,

    ],
})

export class LogModule { }
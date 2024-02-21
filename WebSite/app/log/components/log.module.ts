import { NgModule } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

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
    ProviderService } from '../services';
@NgModule({
    providers: [
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
        ResultSoccerService
    ]
})

export class LogModule { }
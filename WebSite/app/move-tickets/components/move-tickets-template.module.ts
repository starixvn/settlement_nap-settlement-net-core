import { NgModule } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { MoveTicketsService } from "../components/cricket";
import {
    BlockUIService,
    DialogBoxService,
    GenerateFilterService,
    HttpRequestService,
    MessageBoxService,
    ReCheckInService,
    SportMatchService,
    VerifyDateService
} from "../../shared/services";
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
    ],
    declarations: [
    ],
    providers: [
        DatePipe,
        VerifyDateService,
        MessageBoxService,
        MoveTicketsService,
        GenerateFilterService,
        BlockUIService,
        HttpRequestService,
        NgbActiveModal,
        ReCheckInService,
        DialogBoxService,
        SportMatchService
    ]
})

export class MoveTicketsTemplateModule { }
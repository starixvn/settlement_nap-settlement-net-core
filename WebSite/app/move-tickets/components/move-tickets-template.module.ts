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
import { MoveRunningTicketsService } from "./running-tickets/move-running-tickets.service";

@NgModule({
    imports: [
    ],
    declarations: [
    ],
    providers: [
        VerifyDateService,
        MessageBoxService,
        MoveTicketsService,
        GenerateFilterService,
        BlockUIService,
        HttpRequestService,
        NgbActiveModal,
        ReCheckInService,
        DialogBoxService,
        SportMatchService,
        MoveRunningTicketsService,
    ]
})

export class MoveTicketsTemplateModule { }
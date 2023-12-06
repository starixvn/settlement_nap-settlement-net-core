import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from "ngx-toastr";
import { TicketCountComponent } from "../components/ticket-count/ticket-count.component";
import { ResettleCheckerComponent } from "../components/resettle-checker/resettle-checker.component";
import { AioService, BlockUIService, HttpRequestService } from "../services";
import { MessageBoxService } from "../services/message-box.service.native";
import { NotReadyMatchComponent } from "../components/not-ready-match/not-ready-match.component";
import { ExternalSourceNamePipe } from "../pipes/external-source-name.pipe";
import { MatDialogModule } from '@angular/material/dialog';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { ResultByTeamNamePipe } from '../pipes/result-by-team-name.pipe';
import { IntervalBackgroundPipe } from '../pipes/interval-background.pipe';
import { OnlyIntegerDirective } from '../../shared/directives';

@NgModule({
        exports: [FormsModule, CommonModule, ToastContainerModule, ResettleCheckerComponent, TicketCountComponent,
                NotReadyMatchComponent, ExternalSourceNamePipe, MatTooltipModule, MatDialogModule, ExternalLinkPipe, OnlyIntegerDirective],
        imports: [ResettleCheckerComponent, TicketCountComponent, NotReadyMatchComponent, ExternalSourceNamePipe, ExternalLinkPipe, OnlyIntegerDirective,
                ],
        providers: [
                MessageBoxService,
                ToastrService,
                BlockUIService,
                HttpRequestService,
                AioService,
                ResultByTeamNamePipe,
                IntervalBackgroundPipe]
})
export class CalculateCommonModule {
}
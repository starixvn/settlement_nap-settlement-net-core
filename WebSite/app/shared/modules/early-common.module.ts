import { NewMultipleSelectComponent } from "./../components/multiple-select/multiple-select.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ToastrModule, ToastrService } from "ngx-toastr";
import { TicketCountComponent } from "../components/ticket-count/ticket-count.component";
import { ResettleCheckerComponent } from "../components/resettle-checker/resettle-checker.component";
import { AioService, BlockUIService, HttpRequestService } from "../services";
import { MessageBoxService } from "../services/message-box.service.native";
import { NotReadyMatchComponent } from "../components/not-ready-match/not-ready-match.component";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { PipesModule } from "../pipes/pipes.module.native";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ResultByTeamNamePipe } from "../pipes/result-by-team-name.pipe";
import { IntervalBackgroundPipe } from "../../shared/pipes/interval-background.pipe";
import { ExternalSourceNamePipe } from "../pipes/external-source-name.pipe";
import { OnlyIntegerDirective } from "../../shared/directives";

@NgModule({
  exports: [
    FormsModule,
    CommonModule,
    ToastrModule,
    ResettleCheckerComponent,
    TicketCountComponent,

    NotReadyMatchComponent,
    MatTooltipModule,
    NewMultipleSelectComponent,
    PipesModule,
    ExternalLinkPipe,
    ExternalSourceNamePipe,
    OnlyIntegerDirective,
  ],
  imports: [
    ResettleCheckerComponent,
    TicketCountComponent,
    NotReadyMatchComponent,
    NewMultipleSelectComponent,
    ExternalLinkPipe,
    ExternalSourceNamePipe,
    OnlyIntegerDirective,
  ],
  providers: [
    MessageBoxService,
    ToastrService,
    BlockUIService,
    HttpRequestService,
    AioService,
    VerificationBaseService,
    ResultByTeamNamePipe,
    IntervalBackgroundPipe,
  ],
})
export class EarlyCommonModule {}

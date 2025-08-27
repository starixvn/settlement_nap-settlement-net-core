import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    AioService,
    BlockUIService,
    ClosePopupService,
    HttpRequestService,
    MessageBoxService,
    ReCheckInService,
} from '../../shared/services';
import { OnlyIntegerDirective } from '../../shared/directives';
import { FullTimeService } from './only-fulltime/fulltime.service';
import { FullTimeVerificationService } from './only-fulltime/fulltime-verification.service';
import { FullTimeCalculationComponent } from './only-fulltime/fulltime-calculation.component';
import { FullTimeRefundComponent } from './only-fulltime/fulltime-refund.component';
import { ScorePipe, ResourceHeaderPipe, ResultPipe, ScoreByPermissionPipe, ScoreMatchByPermissionPipe } from '../pipes';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { GameTotalVerificationService } from './game-total/game-total-verification.service';
import { GameTotalCalculationComponent } from './game-total/game-total-calculation.component';
import { GameTotalRefundComponent } from './game-total/game-total-refund.component';
import { GameTotalService } from './game-total/game-total.service';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { HalfTimeFullTimeCalculationComponent } from './halftime-fulltime/halftime-fulltime-calculation.component';
import { HalfTimeFullTimeRefundComponent } from './halftime-fulltime/halftime-fulltime-refund.component';
import { RequestService } from '../services/request.service';
import { VerificationService } from './halftime-fulltime/verification.service';
import { ToastNoAnimationModule } from 'ngx-toastr';
import { HalfTimeFullTimeService } from './halftime-fulltime/halftime-fulltime.service';
import { GameTotalMatchCalculationComponent } from './game-total-match-flow/game-total-match-calculation.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameTotalMatchVerificationService } from './game-total-match-flow/game-total-match-verification.service';
import { GameTotalMatchService } from './game-total-match-flow/game-total-match.service';
import { GameTotalMatchRefundComponent } from './game-total-match-flow/game-total-match-refund.component';
import { OtherRefundComponent } from './other/other-refund.component';
import { OtherService } from './other/other.service';
import { OtherCalculationComponent } from './other/other-calculation.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { ResultDetailsService } from './bandy/resultdetails.service';
import { ValidationService } from './bandy/validation.service';
import { MappedScoreService } from './only-fulltime/mapped-score.service';
@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        PipesModule,
        BrowserAnimationsModule,
        ToastNoAnimationModule.forRoot({
            disableTimeOut: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'inline',
            maxOpened: 1,
        }),

        ResettleCheckerComponent,
        NotReadyMatchComponent,
        TicketCountComponent,
        OnlyIntegerDirective,
    ],
    declarations: [
        FullTimeCalculationComponent,
        FullTimeRefundComponent,
        GameTotalCalculationComponent,
        GameTotalRefundComponent,
        ScorePipe,
        ResourceHeaderPipe,
        ResourceNameByIdPipe,
        ResultPipe,
        HalfTimeFullTimeCalculationComponent,
        HalfTimeFullTimeRefundComponent,
        OtherRefundComponent,
        ScoreByPermissionPipe,
        GameTotalMatchCalculationComponent,
        GameTotalMatchRefundComponent,
        ScoreMatchByPermissionPipe,
        OtherCalculationComponent
    ],
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ReCheckInService,
        ClosePopupService,
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ReCheckInService,
        ClosePopupService,
        FullTimeVerificationService,
        FullTimeService,
        RequestService,
        VerificationService,
        HalfTimeFullTimeService,
        GameTotalService,
        AioService,
        GameTotalVerificationService,
        IntervalBackgroundPipe,
        ResourceNameByIdPipe,
        ScoreByPermissionPipe,
        GameTotalMatchVerificationService,
        GameTotalMatchService,
        OtherService,
        ResultDetailsService,
        ValidationService,
        MappedScoreService
    ]
})

export class SportTemplateModule { }

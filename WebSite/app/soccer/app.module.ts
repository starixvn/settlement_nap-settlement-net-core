import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective, OnlyFirstTenScoreDirective } from '../shared/directives';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { AppComponent } from './components/app.component';
import { EarlySettlementComponent } from './components/early/early-settlement.component';
import { MatchDetailComponent } from './components/early/match-detail.component';
import { GroupNameByIdPipe } from './pipes/group-name-by-id.pipe';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { CalculationComponent } from './components/calc/calculation.component';
import {
    FantasyComponent,
    GoalHistoryComponent,
    CalculationMatchDetailComponent,
    RefundChildMatchComponent,
    SoccerTicketCountComponent
} from './components/calc';
import { ScorePipe } from './pipes/score.pipe';
import { MaterialModule } from '../shared/material-module';
import { OnlyGoalRecordDirective } from './directives/only-goal-record.directive.native';
import { ToastContainerModule, ToastNoAnimationModule } from 'ngx-toastr';
import { RefundComponent } from './components/refund/refund.component';
import { RefundMatchDetailComponent } from './components/refund/refund-match-detail.component';
import { SpecificBettypeComponent } from './components/refund/specific-bettype.component';
import { ConfirmRefundComponent } from './components/refund/confirm-refund.component';
import { ConfirmScoreComponent } from './components/refund/confirm-score.component';
import { MoveBetComponent } from './components/refund/move-bet.component';
import { TicketCountComponent } from '../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from '../shared/components/not-ready-match/not-ready-match.component';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        PipesModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot({
            disableTimeOut: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'inline',
            maxOpened: 1,
        }),
        ToastContainerModule,
        TicketCountComponent,
        ResettleCheckerComponent,
        NotReadyMatchComponent
    ],
    declarations: [
        AppComponent,
        MatchDetailComponent,
        ModalDialogComponent,
        OnlyIntegerDirective,
        OnlyFirstTenScoreDirective,
        EarlySettlementComponent,
        GroupNameByIdPipe,
        CalculationComponent,
        FantasyComponent,
        GoalHistoryComponent,
        CalculationMatchDetailComponent,
        RefundChildMatchComponent,
        ScorePipe,
        OnlyGoalRecordDirective,
        SoccerTicketCountComponent,
        RefundComponent,
        RefundMatchDetailComponent,
        SpecificBettypeComponent,
        ConfirmRefundComponent,
        ConfirmScoreComponent,
        MoveBetComponent
    ],
    entryComponents: [ModalDialogComponent],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
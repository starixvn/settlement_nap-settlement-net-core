import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective, OnlyFirstTenScoreDirective } from '../shared/directives';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { AppComponent } from './components/app.component';
import { EarlySettlementComponent } from './components/early/early-settlement.component';
import { MatchDetailComponent } from './components/common/match-detail.component';
import { GroupNameByIdPipe } from './pipes/group-name-by-id.pipe';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { MaterialModule } from '../shared/material-module';
import { OnlyGoalRecordDirective } from './directives/only-goal-record.directive.native';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { TicketCountComponent } from '../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from '../shared/components/not-ready-match/not-ready-match.component';
import { CalculateActionsComponent } from "../tennis/components/calculate-actions.component";
import { NewMultipleSelectComponent } from '../shared/components/multiple-select/multiple-select.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterResultTypePipe } from './pipes/filter-result-type.pipe';
import { FilterTicketStatusPipe } from './pipes/filter-ticket-status.pipe';
import { FilterResultStatusPipe } from './pipes/filter-result-status/filter-result-status.pipe';


@NgModule({
    imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    NgbModule,
    PipesModule,
    MaterialModule,
    ToastrModule.forRoot({
        disableTimeOut: true,
        enableHtml: true,
        tapToDismiss: false,
        positionClass: 'inline',
        maxOpened: 1,
    }),
    ToastContainerModule,
    TicketCountComponent,
    ResettleCheckerComponent,
    NotReadyMatchComponent,
    OnlyIntegerDirective,
    CalculateActionsComponent,
    MatchDetailComponent,
    OnlyGoalRecordDirective,
    NewMultipleSelectComponent,
    BrowserAnimationsModule
],
    declarations: [
        AppComponent,
        OnlyFirstTenScoreDirective,
        EarlySettlementComponent,
        GroupNameByIdPipe,
        FilterResultTypePipe,
        FilterTicketStatusPipe,
        FilterResultStatusPipe
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
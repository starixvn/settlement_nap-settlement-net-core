import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModalDialogComponent } from "../shared/components/modal-dialog/modal-dialog.component";
import { TicketCountComponent } from "../shared/components/ticket-count/ticket-count.component";
import { OnlyIntegerDirective, FocusDirective } from '../shared/directives';
import { ResettleCheckerComponent } from "../shared/components/resettle-checker/resettle-checker.component";
import { NotReadyMatchComponent} from '../shared/components';
import {
    AppComponent,
    CalculationActionsComponent,
    RefundActionsComponent,
    MatchDetailComponent,
    EarlySettlementComponent,
} from './components';
import { MaterialModule } from "../shared/material-module";
import { NewMultipleSelectComponent } from "./../shared/components/multiple-select/multiple-select.component";
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
import { ResultByPlayerNamePipe, ResultNameByIdPipe, ResultValuePipe } from "./pipes";
import { CalculationMatchDetailComponent } from "./components/calculation-match-detail.component";
import { ManageLeagueComponent } from "../score-source-setting/components";
import { ExternalLinkPipe } from "../score-source-setting/pipes";
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { ToastContainerModule, ToastNoAnimationModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MaterialModule,
        NgbModule,
        PipesModule,
        BrowserAnimationsModule,
        ToastNoAnimationModule.forRoot({
            disableTimeOut: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'inline',
            maxOpened: 1,
        }),
        ToastContainerModule,
    ],
    declarations: [
        AppComponent,
        RefundActionsComponent,
        MatchDetailComponent,
        CalculationActionsComponent,
        CalculationMatchDetailComponent,
        NotReadyMatchComponent,
        EarlySettlementComponent,
        ModalDialogComponent,
        TicketCountComponent,
        NewMultipleSelectComponent,
        OnlyIntegerDirective,
        FocusDirective,
        ResettleCheckerComponent,
        ExternalLinkPipe,
        ResultNameByIdPipe,
        ResultValuePipe,
        ManageLeagueComponent,
        ResultByPlayerNamePipe,
    ],
    entryComponents: [ModalDialogComponent],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
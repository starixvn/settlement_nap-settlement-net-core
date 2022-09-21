import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { TicketCountComponent } from '../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from "../shared/components/resettle-checker/resettle-checker.component";
import {NewMultipleSelectComponent, NotReadyMatchComponent } from '../shared/components';
import {
    AppComponent,
    CalculationActionsComponent,
    CalculationMatchDetailComponent,
    RefundActionsComponent,
    MatchDetailComponent,
    EarlySettlementComponent,
} from './components';
import { ResourceNameByIdPipe } from './pipes/resource-name-by-id.pipe';
import { MaterialModule } from '../shared/material-module';
import { ManageLeagueComponent } from '../score-source-setting/components';
import { ExternalLinkPipe } from '../score-source-setting/pipes';
import { CustomHttpRequestInterceptor } from '../shared/custom-httprequest-interceptor.native';
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
        NgbModule,
        MaterialModule,
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
        CalculationActionsComponent,
        CalculationMatchDetailComponent,
        RefundActionsComponent,
        MatchDetailComponent,
        NotReadyMatchComponent,
        EarlySettlementComponent,
        ModalDialogComponent,
        OnlyIntegerDirective,
        TicketCountComponent,
        ResettleCheckerComponent,
        ResourceNameByIdPipe,
        ExternalLinkPipe,
        NewMultipleSelectComponent,
        ManageLeagueComponent
    ],
    entryComponents: [ModalDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
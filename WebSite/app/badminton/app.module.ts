import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModalDialogComponent, TicketCountComponent, ResettleCheckerComponent, NotReadyMatchComponent, NewMultipleSelectComponent } from '../shared/components';
import { OnlyIntegerDirective, FocusDirective } from '../shared/directives';

import {
    AppComponent,
    CalculateActionsComponent,
    CalculateMatchDetailComponent,
    MatchDetailComponent,
    RefundActionsComponent,
    EarlySettlementComponent,
} from './components';
import {
    ResourceNameByIdPipe,
    ExcludeTotalPointPipe,
    ResourceHeaderPipe,
} from './pipes';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { MaterialModule } from "../shared/material-module";
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { ExternalLinkPipe } from "../score-source-setting/pipes";
import { ManageLeagueComponent } from "../score-source-setting/components";
import { ToastContainerModule, ToastNoAnimationModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IntegerAndNoneDirective } from "./directives/integer-and-none.directive.native";

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
        ModalDialogComponent,
        OnlyIntegerDirective,
        FocusDirective,
        AppComponent,
        CalculateActionsComponent,
        CalculateMatchDetailComponent,
        NotReadyMatchComponent,
        MatchDetailComponent,
        RefundActionsComponent,
        EarlySettlementComponent,
        TicketCountComponent,
        ResourceNameByIdPipe,
        ResourceHeaderPipe,
        ExcludeTotalPointPipe,
        ResettleCheckerComponent,
        ExternalLinkPipe,
        NewMultipleSelectComponent,
        ManageLeagueComponent,
        IntegerAndNoneDirective,
    ],
    entryComponents: [ModalDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
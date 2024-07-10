import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';
import { ModalContentDialogComponent } from "../shared/components/modal-dialog/modal-content-dialog.component";
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { MaterialModule } from "./../shared/material-module";
import { MaterialDialogComponent } from '../shared/components/material-dialog-iframe/material-dialog.component';

import {
    AppComponent,
    FilterComponent,
    MatchesComponent,
    ReCalculationComponent,
    RefundComponent
} from './components';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { ToastNoAnimationModule } from 'ngx-toastr';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MaterialModule,
        NgbModule,
        ToastNoAnimationModule.forRoot({
            disableTimeOut: true,
            enableHtml: true,
            tapToDismiss: false,
            positionClass: 'inline',
            maxOpened: 1,
        }),
        DatepickerComponent,
        OnlyIntegerDirective,
        MaterialDialogComponent
    ],
    declarations: [
        AppComponent,
        FilterComponent,
        MatchesComponent,
        ReCalculationComponent,
        RefundComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
       
    ],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
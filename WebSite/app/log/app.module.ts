import { NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { AppComponent, LogModule } from './components'
import {
    LogComponent,
    MatchesComponent,
    FilterComponent,
} from './components/log';
import { ProviderLogComponent } from './components/provider-log/provider-log.component';
import { ProviderMatchesComponent } from './components/provider-log/provider-result.component';
import { ProviderFilterComponent } from './components/provider-log/provider-filter.component';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';
import { ResettleLogDetailComponent } from './components/log/resettle-log-detail.component';
import { LogDetailComponent } from './components/log/log-detail.component';
import { NewMultipleSelectComponent } from "../shared/components/multiple-select/multiple-select.component";
import { DynamicHeightDirective, OnlyIntegerDirective } from '../shared/directives';
@NgModule({
    declarations: [
        AppComponent,
        LogComponent,
        MatchesComponent,
        FilterComponent,
        ResettleLogDetailComponent,
        LogDetailComponent,
        ProviderMatchesComponent,
        ProviderFilterComponent,
        ProviderLogComponent
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        DatepickerComponent,
        LogModule,
        NewMultipleSelectComponent,
        NoopAnimationsModule,
        OnlyIntegerDirective,
        DynamicHeightDirective
    ]
})
export class AppModule {
}
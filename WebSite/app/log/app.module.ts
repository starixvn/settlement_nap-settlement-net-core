import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import {
    ModalDialogComponent,
    DatepickerComponent,
    ModalContentDialogComponent,
} from '../shared/components';
import {
    AppComponent,
    MatchesComponent,
    FilterComponent,
} from './components';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
    ],
    declarations: [
        AppComponent,
        MatchesComponent,
        FilterComponent,
        DatepickerComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,

    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import {
    AppComponent,
    MatchesComponent,
    FilterComponent,
} from './components';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        DatepickerComponent,
    ],
    declarations: [
        AppComponent,
        MatchesComponent,
        FilterComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,

    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
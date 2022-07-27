import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';

import {
    AppComponent,
    FilterComponent,
    MatchesComponent
} from './components';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { MaterialModule } from '../shared/material-module';
import { DynamicHeightDirective } from '../shared/directives';
import { MaterialDialogComponent } from '../shared/components';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        MaterialModule,
    ],
    declarations: [
        AppComponent,
        FilterComponent,
        DatepickerComponent,
        MatchesComponent,
        DynamicHeightDirective,
        MaterialDialogComponent,
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
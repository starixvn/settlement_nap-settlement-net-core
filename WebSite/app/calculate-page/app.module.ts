import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';

import {
    MatchesComponent,
    FilterComponent,
    PageComponent
} from './components/calculation';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";
import { MaterialModule } from '../shared/material-module';
import { DynamicHeightDirective } from '../shared/directives';
import { AutoCalculatePageComponent, AutoCalculateMatchesComponent, AutoCalculateFilterComponent } from './components/auto-calculation';
import { PageBaseComponent, MatchesBaseComponent } from './components/base-component';
import { FilterBaseComponent } from '../shared/components/gaming/filter-base.component';
import { AppComponent } from './components/app.component';
import { NewMultipleSelectComponent } from '../shared/components/multiple-select/multiple-select.component';
import { MaterialDialogComponent } from '../shared/components/material-dialog-iframe/material-dialog.component';
import { MaterialDialogWithResponseComponent } from '../shared/components/material-dialog-iframe/material-dialog-with-response.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgbModule,
        MaterialModule,
        DatepickerComponent,
        DynamicHeightDirective,
        NewMultipleSelectComponent,
        NoopAnimationsModule
    ],
    declarations: [
        AppComponent,
        PageBaseComponent,
        FilterBaseComponent,
        MatchesBaseComponent,
        FilterComponent,
        MatchesComponent,
        MaterialDialogComponent,
        PageComponent,
        AutoCalculateMatchesComponent,
        AutoCalculatePageComponent,
        AutoCalculateFilterComponent,
        MaterialDialogWithResponseComponent
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
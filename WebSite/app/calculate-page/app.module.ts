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
import { MaterialDialogComponent, MaterialDialogWithResponseComponent, NewMultipleSelectComponent } from '../shared/components';
import { AutoCalculatePageComponent, AutoCalculateMatchesComponent, AutoCalculateFilterComponent } from './components/auto-calculation';
import { PageBaseComponent, FilterCalculateBaseComponent, MatchesBaseComponent } from './components/base-component';
import { FilterBaseComponent } from '../shared/components/gaming/filter-base.component';
import { AppComponent } from './components/app.component';

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
        PageBaseComponent,
        FilterBaseComponent,
        MatchesBaseComponent,
        FilterComponent,
        DatepickerComponent,
        MatchesComponent,
        DynamicHeightDirective,
        MaterialDialogComponent,
        PageComponent,
        FilterCalculateBaseComponent,
        AutoCalculateMatchesComponent,
        AutoCalculatePageComponent,
        AutoCalculateFilterComponent,
        NewMultipleSelectComponent,
        MaterialDialogWithResponseComponent
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
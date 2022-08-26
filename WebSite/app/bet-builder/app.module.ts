import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
import {
    ModalDialogComponent,
    MultipleSelectComponent,
    DatepickerComponent,
    ModalContentDialogComponent,
    TreeViewComponent,
    MaterialDialogComponent,
} from '../shared/components';
import {
    AppComponent,
    FilterComponent,
    MatchesComponent,
    MatchDetailComponent,
    CalculationComponent,
} from './components';
import {NewMultipleSelectComponent} from "./../shared/components/multiple-select/multiple-select.component";
import { MaterialModule } from "./../shared/material-module";
import { ResultStatusPipe, SelectionPipe, TicketStatusPipe } from './pipes';
import { PipesModule } from '../shared/pipes/pipes.module.native';
import { CustomHttpRequestInterceptor } from "../shared/custom-httprequest-interceptor.native";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        MaterialModule,
        NgbModule,
        PipesModule
    ],
    declarations: [
        AppComponent,
        FilterComponent,
        MatchesComponent,
        MatchDetailComponent,
        CalculationComponent,
        DatepickerComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        MultipleSelectComponent,
        TreeViewComponent,
        NewMultipleSelectComponent,
        MaterialDialogComponent,
        OnlyIntegerDirective,
        ResultStatusPipe,
        SelectionPipe,
        TicketStatusPipe,
    ],
    entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
    providers: [ { provide: HTTP_INTERCEPTORS, useClass: CustomHttpRequestInterceptor, multi: true }],
    bootstrap: [AppComponent],
})
export class AppModule {
}
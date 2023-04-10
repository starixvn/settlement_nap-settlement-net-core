import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OnlyIntegerDirective } from '../shared/directives';
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
import { DatepickerComponent } from '../shared/components/date-picker/date-picker.component';
import { MaterialDialogComponent } from '../shared/components/material-dialog-iframe/material-dialog.component';
import { ModalContentDialogComponent } from '../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../shared/components/modal-dialog/modal-dialog.component';
import { MultipleSelectComponent } from '../shared/components/multiple-selection/multiple-select.component.native';
import { TreeViewComponent } from '../shared/components/multiple-selection/tree-view.component';

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
        OnlyIntegerDirective,
        NewMultipleSelectComponent,
        DatepickerComponent,
        NoopAnimationsModule
    ],
    declarations: [
        AppComponent,
        FilterComponent,
        MatchesComponent,
        MatchDetailComponent,
        CalculationComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        MultipleSelectComponent,
        TreeViewComponent,
        MaterialDialogComponent,
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